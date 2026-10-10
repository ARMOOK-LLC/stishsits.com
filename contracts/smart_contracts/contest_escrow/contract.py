"""Stish Sits contest escrow (EXPERIMENTAL, TESTNET ONLY, NOT REVIEWED OR AUDITED).

One application per contest. Entries in a single ASA are held by the application account and
can leave it only through `payout` (after a posted result and challenge window) or `refund`
(after a cancel or timeout). Every term, including the fee split, is fixed at creation.

Lifecycle:  OPEN --lock--> LOCKED --settle--> SETTLED --(window passes)--> payout --> PAID
            OPEN/LOCKED/SETTLED --cancel (rules below)--> CANCELED --refund per entrant
"""

from algopy import (
    Account,
    ARC4Contract,
    Asset,
    BoxMap,
    Bytes,
    Global,
    GlobalState,
    Txn,
    UInt64,
    arc4,
    gtxn,
    itxn,
    subroutine,
)

# Contest status
OPEN = 0
LOCKED = 1
SETTLED = 2
PAID = 3
CANCELED = 4

# Entrant status (box value)
PAID_IN = 1
REFUNDED = 2

BPS = 10_000
MAX_TOTAL_CUT_BPS = 3_000  # posted cuts may never take more than 30% of gross entries
MIN_FIELD = 2  # rule 2: one sitter, no race


class ContestEscrow(ARC4Contract):
    def __init__(self) -> None:
        self.organizer = GlobalState(Account)
        self.referee = GlobalState(Account)
        self.promoter = GlobalState(Account)
        self.venue = GlobalState(Account)
        self.entry_asset = GlobalState(Asset)
        self.entry_amount = GlobalState(UInt64)
        self.promoter_bps = GlobalState(UInt64)
        self.venue_bps = GlobalState(UInt64)
        self.referee_bps = GlobalState(UInt64)
        self.min_entrants = GlobalState(UInt64)
        self.max_entrants = GlobalState(UInt64)
        self.join_deadline = GlobalState(UInt64)
        self.settle_deadline = GlobalState(UInt64)
        self.challenge_window = GlobalState(UInt64)
        self.status = GlobalState(UInt64)
        self.entrant_count = GlobalState(UInt64)
        self.winner = GlobalState(Account)
        self.result_hash = GlobalState(Bytes)
        self.result_time = GlobalState(UInt64)
        self.challenged = GlobalState(UInt64)
        self.asset_opted_in = GlobalState(UInt64)
        self.entrants = BoxMap(Account, UInt64, key_prefix=b"e")

    # ------------------------------------------------------------------ create
    @arc4.abimethod(create="require")
    def create(
        self,
        entry_asset: Asset,
        entry_amount: UInt64,
        referee: Account,
        promoter: Account,
        venue: Account,
        promoter_bps: UInt64,
        venue_bps: UInt64,
        referee_bps: UInt64,
        min_entrants: UInt64,
        max_entrants: UInt64,
        join_deadline: UInt64,
        settle_deadline: UInt64,
        challenge_window: UInt64,
    ) -> None:
        """Post the contest terms. They cannot change afterwards (no update method exists)."""
        assert entry_amount > 0, "entry must be positive"
        assert referee != Global.zero_address, "referee required"
        assert promoter_bps + venue_bps + referee_bps <= MAX_TOTAL_CUT_BPS, "cuts too high"
        assert min_entrants >= MIN_FIELD, "min field is 2"
        assert max_entrants >= min_entrants, "max < min"
        assert join_deadline > Global.latest_timestamp, "join deadline in the past"
        assert settle_deadline > join_deadline, "settle deadline must follow join deadline"
        if promoter_bps > 0:
            assert promoter != Global.zero_address, "promoter required for a promoter cut"
        if venue_bps > 0:
            assert venue != Global.zero_address, "venue required for a venue cut"

        self.organizer.value = Txn.sender
        self.entry_asset.value = entry_asset
        self.entry_amount.value = entry_amount
        self.referee.value = referee
        self.promoter.value = promoter
        self.venue.value = venue
        self.promoter_bps.value = promoter_bps
        self.venue_bps.value = venue_bps
        self.referee_bps.value = referee_bps
        self.min_entrants.value = min_entrants
        self.max_entrants.value = max_entrants
        self.join_deadline.value = join_deadline
        self.settle_deadline.value = settle_deadline
        self.challenge_window.value = challenge_window
        self.status.value = UInt64(OPEN)
        self.entrant_count.value = UInt64(0)
        self.winner.value = Global.zero_address
        self.result_hash.value = Bytes()
        self.result_time.value = UInt64(0)
        self.challenged.value = UInt64(0)
        self.asset_opted_in.value = UInt64(0)

    # ------------------------------------------------------------- opt in ASA
    @arc4.abimethod
    def opt_in_asset(self, mbr_payment: gtxn.PaymentTransaction) -> None:
        """Organizer funds the app's minimum balance and the app opts into the entry asset."""
        assert Txn.sender == self.organizer.value, "organizer only"
        assert self.status.value == OPEN, "not open"
        assert self.asset_opted_in.value == 0, "already opted in"
        assert mbr_payment.receiver == Global.current_application_address, "pay the app"
        assert mbr_payment.amount >= Global.min_balance + Global.asset_opt_in_min_balance, "fund MBR"
        assert mbr_payment.rekey_to == Global.zero_address, "no rekey"
        assert mbr_payment.close_remainder_to == Global.zero_address, "no close"
        itxn.AssetTransfer(
            xfer_asset=self.entry_asset.value,
            asset_receiver=Global.current_application_address,
            asset_amount=0,
            fee=0,
        ).submit()
        self.asset_opted_in.value = UInt64(1)

    # -------------------------------------------------------------------- join
    @arc4.abimethod
    def join(self, entry: gtxn.AssetTransferTransaction, box_mbr: gtxn.PaymentTransaction) -> None:
        """Enter: grouped SITS (entry asset) transfer to the app plus a payment covering the entrant box."""
        assert self.status.value == OPEN, "not open"
        assert self.asset_opted_in.value == 1, "app not opted in"
        assert Global.latest_timestamp < self.join_deadline.value, "entry closed"
        assert Txn.sender != self.referee.value, "referee may not enter"
        assert Txn.sender not in self.entrants, "already entered"
        assert self.entrant_count.value < self.max_entrants.value, "field full"

        assert entry.sender == Txn.sender, "entrant must pay own entry"
        assert entry.xfer_asset == self.entry_asset.value, "wrong asset"
        assert entry.asset_receiver == Global.current_application_address, "pay the app"
        assert entry.asset_amount == self.entry_amount.value, "wrong amount"
        assert entry.asset_sender == Global.zero_address, "no clawback transfers"
        assert entry.asset_close_to == Global.zero_address, "no close"
        assert entry.rekey_to == Global.zero_address, "no rekey"

        assert box_mbr.sender == Txn.sender, "entrant funds own box"
        assert box_mbr.receiver == Global.current_application_address, "pay the app"
        assert box_mbr.amount >= entrant_box_mbr(), "box MBR too low"
        assert box_mbr.rekey_to == Global.zero_address, "no rekey"
        assert box_mbr.close_remainder_to == Global.zero_address, "no close"

        self.entrants[Txn.sender] = UInt64(PAID_IN)
        self.entrant_count.value += 1

    # -------------------------------------------------------------------- lock
    @arc4.abimethod
    def lock(self) -> None:
        """Close entry and start the contest. Needs the minimum field."""
        assert Txn.sender == self.referee.value or Txn.sender == self.organizer.value, "not allowed"
        assert self.status.value == OPEN, "not open"
        assert self.entrant_count.value >= self.min_entrants.value, "field too small; cancel instead"
        self.status.value = UInt64(LOCKED)

    # ------------------------------------------------------------------ settle
    @arc4.abimethod
    def settle(self, winner: Account, result_hash: Bytes) -> None:
        """Referee posts the result (signed by the referee account) and opens the challenge window."""
        assert Txn.sender == self.referee.value, "referee only"
        assert self.status.value == LOCKED, "not locked"
        assert Global.latest_timestamp <= self.settle_deadline.value, "past settle deadline"
        assert winner in self.entrants, "winner must be an entrant"
        assert self.entrants[winner] == PAID_IN, "winner not paid in"
        assert result_hash.length == 32, "result hash must be 32 bytes (sha256 of the result log)"
        self.winner.value = winner
        self.result_hash.value = result_hash
        self.result_time.value = Global.latest_timestamp
        self.status.value = UInt64(SETTLED)

    # --------------------------------------------------------------- challenge
    @arc4.abimethod
    def challenge(self) -> None:
        """v1 challenge: any entrant can flag the result inside the window. Payout pauses;
        review is off-chain and disclosed as centralized. The organizer or referee then cancels
        (refunds) or the settle deadline passes and anyone can cancel."""
        assert self.status.value == SETTLED, "nothing to challenge"
        assert Txn.sender in self.entrants, "entrants only"
        assert Global.latest_timestamp < self.result_time.value + self.challenge_window.value, "window closed"
        self.challenged.value = UInt64(1)

    # ------------------------------------------------------------------ payout
    @arc4.abimethod
    def payout(self) -> UInt64:
        """Anyone may trigger payout once the window has passed with no challenge.
        All transfers are inner transactions in this one call: all succeed or none do."""
        assert self.status.value == SETTLED, "not settled"
        assert self.challenged.value == 0, "challenged; under review"
        assert Global.latest_timestamp >= self.result_time.value + self.challenge_window.value, "window open"

        gross = self.entry_amount.value * self.entrant_count.value
        promoter_cut = gross * self.promoter_bps.value // BPS
        venue_cut = gross * self.venue_bps.value // BPS
        referee_cut = gross * self.referee_bps.value // BPS
        purse = gross - promoter_cut - venue_cut - referee_cut  # rounding remainder goes to 1st

        self.status.value = UInt64(PAID)
        self._send(self.promoter.value, promoter_cut)
        self._send(self.venue.value, venue_cut)
        self._send(self.referee.value, referee_cut)
        self._send(self.winner.value, purse)
        return purse

    # ------------------------------------------------------------------ cancel
    @arc4.abimethod
    def cancel(self) -> None:
        """Cancel and allow refunds.
        - organizer or referee: any time before payout
        - anyone: OPEN past the join deadline with a short field, or not paid by the settle deadline
        """
        assert self.status.value != PAID and self.status.value != CANCELED, "already final"
        privileged = Txn.sender == self.organizer.value or Txn.sender == self.referee.value
        short_field = (
            self.status.value == OPEN
            and Global.latest_timestamp >= self.join_deadline.value
            and self.entrant_count.value < self.min_entrants.value
        )
        timed_out = Global.latest_timestamp > self.settle_deadline.value
        assert privileged or short_field or timed_out, "cannot cancel yet"
        self.status.value = UInt64(CANCELED)

    # ------------------------------------------------------------------ refund
    @arc4.abimethod
    def refund(self, entrant: Account) -> None:
        """Return one entrant's entry after a cancel. Anyone may call; funds only go to the entrant."""
        assert self.status.value == CANCELED, "not canceled"
        assert entrant in self.entrants, "not an entrant"
        assert self.entrants[entrant] == PAID_IN, "already refunded"
        self.entrants[entrant] = UInt64(REFUNDED)
        self._send(entrant, self.entry_amount.value)

    # ------------------------------------------------------------------- reads
    @subroutine
    def _send(self, receiver: Account, amount: UInt64) -> None:
        if amount > 0:
            itxn.AssetTransfer(
                xfer_asset=self.entry_asset.value,
                asset_receiver=receiver,
                asset_amount=amount,
                fee=0,
            ).submit()

    @arc4.abimethod(readonly=True)
    def entrant_status(self, entrant: Account) -> UInt64:
        return self.entrants.get(entrant, default=UInt64(0))


@subroutine
def entrant_box_mbr() -> UInt64:
    # 2500 + 400 * (key bytes + value bytes); key = 1 prefix + 32 address, value = 8
    return UInt64(2_500 + 400 * (1 + 32 + 8))
