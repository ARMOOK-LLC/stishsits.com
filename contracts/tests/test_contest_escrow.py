"""Offline unit tests for the contest escrow, using algorand-python-testing (no network, no LocalNet).
These exercise contract logic only. A LocalNet/TestNet end-to-end suite is still TODO (see README)."""

from collections.abc import Iterator

import algopy
import pytest
from algopy_testing import AlgopyTestContext, algopy_testing_context

from smart_contracts.contest_escrow.contract import CANCELED, LOCKED, OPEN, PAID, SETTLED, ContestEscrow

T0 = 1_800_000_000
ENTRY = 100_000  # 10 test-SITS at 4 decimals
BOX_MBR = 2_500 + 400 * 41


@pytest.fixture()
def ctx() -> Iterator[AlgopyTestContext]:
    with algopy_testing_context() as c:
        c.ledger.patch_global_fields(latest_timestamp=algopy.UInt64(T0))
        yield c


class World:
    def __init__(
        self, ctx: AlgopyTestContext, promoter_bps: int = 1_000, venue_bps: int = 0, referee_bps: int = 0
    ) -> None:
        self.ctx = ctx
        self.asset = ctx.any.asset(decimals=4, total=5_000_000_000_000)
        self.organizer = ctx.any.account()
        self.referee = ctx.any.account()
        self.promoter = ctx.any.account()
        self.venue = ctx.any.account()
        self.contract = ContestEscrow()
        with ctx.txn.create_group(active_txn_overrides={"sender": self.organizer}):
            self.contract.create(
                self.asset,
                algopy.UInt64(ENTRY),
                self.referee,
                self.promoter,
                self.venue,
                algopy.UInt64(promoter_bps),
                algopy.UInt64(venue_bps),
                algopy.UInt64(referee_bps),
                algopy.UInt64(2),
                algopy.UInt64(20),
                algopy.UInt64(T0 + 3_600),
                algopy.UInt64(T0 + 7_200),
                algopy.UInt64(1_800),
            )
        self.app = ctx.ledger.get_app(self.contract)

    def call(self, sender: algopy.Account, method, *args):  # type: ignore[no-untyped-def]
        with self.ctx.txn.create_group(active_txn_overrides={"sender": sender}):
            return method(*args)

    def opt_in(self) -> None:
        pay = self.ctx.any.txn.payment(sender=self.organizer, receiver=self.app.address, amount=algopy.UInt64(200_000))
        self.ctx._default_sender = self.organizer  # app-call sender for deferred calls
        call = self.ctx.txn.defer_app_call(self.contract.opt_in_asset, pay)
        with self.ctx.txn.create_group([pay, call]):
            call.submit()

    def join(
        self, who: algopy.Account, amount: int = ENTRY, asset: algopy.Asset | None = None, **xfer_overrides
    ) -> None:  # type: ignore[no-untyped-def]
        fields = dict(
            sender=who,
            xfer_asset=asset or self.asset,
            asset_receiver=self.app.address,
            asset_amount=algopy.UInt64(amount),
        )
        fields.update(xfer_overrides)
        xfer = self.ctx.any.txn.asset_transfer(**fields)
        pay = self.ctx.any.txn.payment(sender=who, receiver=self.app.address, amount=algopy.UInt64(BOX_MBR))
        self.ctx._default_sender = who  # app-call sender for deferred calls
        call = self.ctx.txn.defer_app_call(self.contract.join, xfer, pay)
        with self.ctx.txn.create_group([xfer, pay, call]):
            call.submit()

    def at(self, ts: int) -> None:
        self.ctx.ledger.patch_global_fields(latest_timestamp=algopy.UInt64(ts))

    def asset_transfers(self) -> list[tuple[str, int]]:
        out = []
        for i in range(10):  # each submit() is its own inner group, all inside one atomic app call
            try:
                t = self.ctx.txn.last_group.get_itxn_group(i).asset_transfer(0)
            except Exception:  # noqa: BLE001
                break
            out.append((str(t.asset_receiver), int(t.asset_amount)))
        return out


def sha() -> algopy.Bytes:
    return algopy.Bytes(b"\x11" * 32)


def test_create_posts_terms(ctx: AlgopyTestContext) -> None:
    w = World(ctx)
    assert w.contract.status.value == OPEN
    assert w.contract.entry_amount.value == ENTRY
    assert w.contract.promoter_bps.value == 1_000
    assert w.contract.referee.value == w.referee


def test_create_rejects_cuts_over_30_percent(ctx: AlgopyTestContext) -> None:
    with pytest.raises(AssertionError, match="cuts too high"):
        World(ctx, promoter_bps=2_000, venue_bps=1_000, referee_bps=500)


def test_join_happy_path_and_double_entry(ctx: AlgopyTestContext) -> None:
    w = World(ctx)
    w.opt_in()
    a = ctx.any.account()
    w.join(a)
    assert w.contract.entrant_count.value == 1
    with pytest.raises(AssertionError, match="already entered"):
        w.join(a)


@pytest.mark.parametrize(
    ("kwargs", "msg"),
    [
        ({"amount": ENTRY - 1}, "wrong amount"),
        ({"asset_close_to": "CLOSE"}, "no close"),
        ({"rekey_to": "REKEY"}, "no rekey"),
        ({"asset_sender": "CLAWBACK"}, "no clawback"),
    ],
)
def test_join_rejects_bad_entry(ctx: AlgopyTestContext, kwargs: dict, msg: str) -> None:
    w = World(ctx)
    w.opt_in()
    other = ctx.any.account()
    for k, v in list(kwargs.items()):
        if v in ("CLOSE", "REKEY", "CLAWBACK"):
            kwargs[k] = other
    with pytest.raises(AssertionError, match=msg):
        w.join(ctx.any.account(), **kwargs)


def test_join_rejects_wrong_asset_and_referee_and_late(ctx: AlgopyTestContext) -> None:
    w = World(ctx)
    w.opt_in()
    with pytest.raises(AssertionError, match="wrong asset"):
        w.join(ctx.any.account(), asset=ctx.any.asset())
    with pytest.raises(AssertionError, match="referee may not enter"):
        w.join(w.referee)
    w.at(T0 + 3_600)
    with pytest.raises(AssertionError, match="entry closed"):
        w.join(ctx.any.account())


def test_join_requires_app_opt_in(ctx: AlgopyTestContext) -> None:
    w = World(ctx)
    with pytest.raises(AssertionError, match="app not opted in"):
        w.join(ctx.any.account())


def test_lock_needs_min_field(ctx: AlgopyTestContext) -> None:
    w = World(ctx)
    w.opt_in()
    w.join(ctx.any.account())
    with pytest.raises(AssertionError, match="field too small"):
        w.call(w.referee, w.contract.lock)
    w.join(ctx.any.account())
    with pytest.raises(AssertionError, match="not allowed"):
        w.call(ctx.any.account(), w.contract.lock)
    w.call(w.referee, w.contract.lock)
    assert w.contract.status.value == LOCKED


def _ten_sitter_race(ctx: AlgopyTestContext, **cuts: int) -> tuple[World, list[algopy.Account]]:
    w = World(ctx, **cuts)
    w.opt_in()
    sitters = [ctx.any.account() for _ in range(10)]
    for s in sitters:
        w.join(s)
    w.call(w.referee, w.contract.lock)
    return w, sitters


def test_only_referee_can_settle_and_winner_must_be_entrant(ctx: AlgopyTestContext) -> None:
    w, sitters = _ten_sitter_race(ctx)
    with pytest.raises(AssertionError, match="referee only"):
        w.call(w.organizer, w.contract.settle, sitters[3], sha())
    with pytest.raises(AssertionError, match="winner must be an entrant"):
        w.call(w.referee, w.contract.settle, ctx.any.account(), sha())
    with pytest.raises(AssertionError, match="32 bytes"):
        w.call(w.referee, w.contract.settle, sitters[3], algopy.Bytes(b"short"))
    w.call(w.referee, w.contract.settle, sitters[3], sha())
    assert w.contract.status.value == SETTLED


def test_payout_waits_for_window_then_splits_fixed_cuts(ctx: AlgopyTestContext) -> None:
    # Stish Sits Beginner example: 10 sitters x 10 SITS, promoter 10% -> winner 90 SITS
    w, sitters = _ten_sitter_race(ctx)
    w.at(T0 + 4_000)
    w.call(w.referee, w.contract.settle, sitters[3], sha())
    with pytest.raises(AssertionError, match="window open"):
        w.call(ctx.any.account(), w.contract.payout)
    w.at(T0 + 4_000 + 1_800)
    purse = w.call(ctx.any.account(), w.contract.payout)
    assert purse == 900_000
    assert w.contract.status.value == PAID
    assert sorted(w.asset_transfers()) == sorted([(str(w.promoter), 100_000), (str(sitters[3]), 900_000)])
    with pytest.raises(AssertionError, match="not settled"):
        w.call(ctx.any.account(), w.contract.payout)


def test_cornhole_style_split_with_rounding_to_first(ctx: AlgopyTestContext) -> None:
    w, sitters = _ten_sitter_race(ctx, promoter_bps=1_000, venue_bps=1_000, referee_bps=333)
    w.at(T0 + 4_000)
    w.call(w.referee, w.contract.settle, sitters[0], sha())
    w.at(T0 + 9_000)
    purse = w.call(ctx.any.account(), w.contract.payout)
    gross = 10 * ENTRY
    referee_cut = gross * 333 // 10_000
    assert purse == gross - 100_000 - 100_000 - referee_cut
    got = dict(w.asset_transfers())
    assert got[str(w.venue)] == 100_000
    assert got[str(w.referee)] == referee_cut
    assert sum(got.values()) == gross


def test_challenge_blocks_payout_then_cancel_and_refund(ctx: AlgopyTestContext) -> None:
    w, sitters = _ten_sitter_race(ctx)
    w.at(T0 + 4_000)
    w.call(w.referee, w.contract.settle, sitters[3], sha())
    with pytest.raises(AssertionError, match="entrants only"):
        w.call(ctx.any.account(), w.contract.challenge)
    w.call(sitters[5], w.contract.challenge)
    w.at(T0 + 6_000)
    with pytest.raises(AssertionError, match="challenged"):
        w.call(ctx.any.account(), w.contract.payout)
    w.call(w.organizer, w.contract.cancel)
    assert w.contract.status.value == CANCELED
    w.call(ctx.any.account(), w.contract.refund, sitters[5])
    assert w.asset_transfers() == [(str(sitters[5]), ENTRY)]
    with pytest.raises(AssertionError, match="already refunded"):
        w.call(ctx.any.account(), w.contract.refund, sitters[5])


def test_short_field_cancel_by_anyone_after_join_deadline(ctx: AlgopyTestContext) -> None:
    w = World(ctx)
    w.opt_in()
    lone = ctx.any.account()
    w.join(lone)
    stranger = ctx.any.account()
    with pytest.raises(AssertionError, match="cannot cancel yet"):
        w.call(stranger, w.contract.cancel)
    w.at(T0 + 3_600)
    w.call(stranger, w.contract.cancel)
    w.call(stranger, w.contract.refund, lone)
    assert w.asset_transfers() == [(str(lone), ENTRY)]


def test_timeout_cancel_when_referee_never_settles(ctx: AlgopyTestContext) -> None:
    w, sitters = _ten_sitter_race(ctx)
    stranger = ctx.any.account()
    with pytest.raises(AssertionError, match="cannot cancel yet"):
        w.call(stranger, w.contract.cancel)
    w.at(T0 + 7_201)
    w.call(stranger, w.contract.cancel)
    with pytest.raises(AssertionError, match="not locked"):
        w.call(w.referee, w.contract.settle, sitters[0], sha())
    with pytest.raises(AssertionError, match="not an entrant"):
        w.call(stranger, w.contract.refund, stranger)


def test_no_cancel_after_payout(ctx: AlgopyTestContext) -> None:
    w, sitters = _ten_sitter_race(ctx)
    w.at(T0 + 4_000)
    w.call(w.referee, w.contract.settle, sitters[1], sha())
    w.at(T0 + 6_000)
    w.call(ctx.any.account(), w.contract.payout)
    with pytest.raises(AssertionError, match="already final"):
        w.call(w.organizer, w.contract.cancel)
