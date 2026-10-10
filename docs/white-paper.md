# Stish Sits

**Transparent, skill-based contests settled on Algorand**

White paper draft v0.3.1 (wording revision) | October 2026 | Eric Binkley | stishsits.com

> **Status of this document.** This is a working draft for discussion, including with Algorand Foundation. Items marked **[Unconfirmed]** are design intentions or open questions, not commitments. Nothing here is legal, tax or investment advice. No legal review has been completed yet; see Section 14.

---

## 1. Abstract

Local skill contests run on trust. A bass tournament, a cornhole bracket, a lawnmower race or a golf scramble collects entry fees, and entrants are told what the purse is, what the venue keeps and what the organizer keeps. They rarely get to see it.

Stish Sits is a contest platform that puts the money side of a skill contest on the Algorand blockchain. Entries go into a contest application, not into someone's pocket. The purse, the venue cut, the promoter cut and the payout table are posted before anyone enters, and they are readable by anyone. When the result is final, the contract pays every party in a single atomic group: all transfers happen together or none happen.

The flagship contest is **Stish Sits** itself: a phone-flat sit-still skill contest where the phone app is the referee. It measures stillness with the accelerometer and tests attention with random pulses chosen by the server. Because the phone produces the result, it is the cleanest first test of on-chain settlement. Longer term, the same contract model, plus staked human referees, a challenge process and a contest builder, can serve any real-world skill competition.

The SITS token (Algorand ASA 127494380) is the entry chip and the stake. It is not offered as an investment. We make no claim that SITS will rise in value.

---

## 2. The problem: "where'd the purse go?"

Anyone who has entered a local tournament knows the questions:

- How much was actually collected in entry fees?
- How much did the venue keep, and how much did the organizer keep?
- Was the payout table decided before the event, or after the money was counted?
- Who decided the winner, and did that person have a stake in the outcome?
- If a result was wrong, who do you appeal to?

Most local events handle money with cash boxes, payment apps and spreadsheets. Even honest organizers cannot easily prove their numbers. Dishonest ones can skim, change the payout split after the fact, or quietly favor a friend. The result is that good events struggle to win trust, entrants hold back, and many contests never grow past a small circle.

The organizer is also usually the judge, the treasurer and the promoter at the same time. That concentration is the core weakness: one person controls the money and the result.

---

## 3. The solution

Stish Sits separates the money from the people.

1. **Posted terms.** Before entry, every contest publishes its entry amount, purse, venue cut, promoter cut, referee fee (where used) and payout table. These are stored in the contest application on chain.
2. **Escrowed entries.** Entries go into the contest application account. No organizer, venue or referee holds the money.
3. **Defined result authority.** Each contest names who reports the result: the phone app's referee key for Stish Sits, or a staked human referee or scorekeeper for other sports.
4. **Challenge window.** Results can be challenged by entrants who post a small bond. Referees who report wrong results lose their stake. A simple version runs in the Phase 4 cornhole pilot; the full design follows in later phases. See Section 7.
5. **Atomic settlement.** When the result is final, one atomic group pays the winners, the venue, the promoter and the referee. Every transfer is public and linked from the result screen.
6. **Automatic refunds.** If a contest does not fill or is canceled, every entry is refunded.

This is a skill contest model, the same idea as entry fees at a fishing tournament or a race car event: competitors pay to enter, and the best performance wins the purse. It is not a wager on an outcome the entrant does not control. Whether a given contest qualifies as a lawful skill contest in a given state is a legal question we have not yet answered; see Section 14.

### 3.1 Vision

> *"Stish Sits comes to life after years of development and passion for structured, competitive, skill-based reward systems."*

The long-term aim is for Stish Sits to become an annual event in Hochatown, Oklahoma: a recurring weekend of skill contests, with the phone-flat sit as the signature event, run with posted terms and on-chain payouts. **[Aspiration; no date, venue or attendance is set.]**

Because every entrant needs an Algorand wallet to take part, each event is also an introduction to Algorand. Many of the people who enter will be first-time wallet users, so local contests could bring new users to the chain in a practical setting, not through speculation. We have no user numbers yet and make no projection.

---

## 4. Stish Sits: the flagship contest

### 4.1 What it is

Stish Sits is a sit-still contest. Each sitter places their phone flat on their leg or on a still surface they are sitting at, and the app watches. Random pulses ask the sitter to respond: type a letter, type a one-word punchline, or hold still through a "don't move" check. Move past the posted motion line, miss a pulse, or pick up the phone, and you are out. The last sitter still in, still answering, wins the purse.

It is deliberately simple: no camera judging, no human judge, no equipment beyond a phone. That makes it a good first test of whether on-chain settlement works end to end.

### 4.2 The 17 rules

These are the rules every sitter agrees to, as drafted.

1. Phones flat. Everyone knows the rules.
2. A race starts only with at least two paid sitters. One sitter, no race. Entries are refunded.
3. Entry is a posted amount of SITS for that division. Beginner 10. Intermediate 50. Open 100. Invite fee is posted before that race.
4. Intermediate requires 100 beginner entries and 1 beginner win. Open requires 25 intermediate entries and 1 intermediate win. Invite is season standings only.
5. Before the clock arms, the phone must be on silent with vibration off. Airplane mode is the standard. The app will not arm if it can tell the ringer is not silent.
6. A vibration or notification bump in the first minute is a restart, once per sitter per race. After that, a buzz is a forfeit.
7. The phone stays flat on the sitter's leg or on a still surface they are sitting at. Picking it up is a forfeit.
8. Motion past the posted line is a forfeit. The line is the same for every sitter in that race.
9. Pulses are random, about every 40 to 120 seconds. A pulse is one of three: type a shown letter or digit, type a one-word punchline, or a no-type "don't move" check. The sitter has a posted number of seconds. A miss is a forfeit. A right answer that moved the phone is still a forfeit.
10. Last sitter still in, still answering, takes the purse minus the promoter's cut.
11. If two or more are still in when the clock ends, they go to sudden death. Pulses every 15 seconds. A single letter. Tighter motion line. Last miss loses. If two miss the same pulse, the faster clean answer on the prior pulse wins.
12. No coin flip. No random draw. A race that starts always ends with a winner.
13. The promoter's cut is posted before entry. Default 10 percent of entries. It pays the organizer who filled the field. It is not a judge's fee. Organizers do not decide the winner.
14. Forfeited entries stay in the purse, not with the promoter.
15. The purse does not roll because nobody survived. It grows only because more people entered. A canceled race refunds every entry.
16. Winners may enter again or leave. Cashing out is allowed.
17. No claim that SITS will rise. No claim that a purse pays anyone's bills. The purse is the prize shown on chain before the sit.

In Stish Sits races, the "promoter" and the "organizer" in rules 10 and 13 are the same person: whoever filled the field. In the general platform (Section 5) these can be separate roles.

### 4.3 Divisions

| Division | Entry (SITS) | Eligibility |
|---|---|---|
| Beginner | 10 | Open to any opted-in sitter |
| Intermediate | 50 | 100 Beginner entries and 1 Beginner win |
| Open | 100 | 25 Intermediate entries and 1 Intermediate win |
| Invite | Posted before the race | Season standings only |

Division gates are enforced by the contract at entry, using each sitter's recorded history.

### 4.4 The app flow

The app has four screens, in order:

- **Race card.** Division, entry, cut, purse so far, start time, motion line, pulse window. One Agree button.
- **Set.** Checklist: silent, vibration off, phone flat, opted into SITS. The clock arms only when the checklist passes.
- **Sit.** A big clock and a flat-phone indicator. When a pulse hits, it takes the whole screen. One answer field. No other buttons except Forfeit.
- **Result.** In, out, or winner. A one-line forfeit reason (moved, missed, picked up) and a link to the purse transaction.

The camera is optional and is never the judge. An optional video clip after the race may be shared but is not required to win, and a live stream is not used as proof.

---

## 5. The general contest platform

### 5.1 Beyond sitting still

Stish Sits proves the money layer with a contest the phone can referee by itself. The long-term goal is a general platform where any real skill competition can be run with full transparency, for example:

- Golf, pool, darts and cornhole
- Fishing and bass tournaments
- Lawnmower races and race car heats
- Tennis at a country club, wrestling
- Car shows and sound shows with multiple classes and multiple winners per class

These contests cannot be refereed by a phone. They need a human referee or scorekeeper, which is why staking, challenges and slashing (Section 7) are part of the platform design.

### 5.2 The contest builder

The contest builder is an app where an organizer creates a contest from a rule-set template and clicks to set:

| Setting | Example |
|---|---|
| Template | Cornhole double elimination, bass tournament heaviest bag, sound show by class |
| Venue | Named venue, or "no venue" for a free public spot |
| Referee / scorekeeper | Named staked referee, or app-refereed (Stish Sits) |
| Entry | Amount per entrant or per team |
| Purse | Entries collected, minus posted cuts |
| Venue cut | Percent of entries |
| Promoter cut | Percent of entries, or a sliding scale by turnout |
| Referee fee | Percent of entries or a fixed amount |
| Payouts | 1st, 2nd, 3rd (percent of purse) |
| Classes | One or more classes, each with its own payout table |
| Off-chain costs | Disclosed only: green fees, cart rental, boat launch, and so on |
| Minimum field | Contest cancels and refunds if not met |

When the organizer publishes, the contest factory creates a contest application with those terms locked in. Entrants see the full purse, the venue cut and the promoter cut before they enter. At the final, fees and payouts are paid automatically.

### 5.3 Example: the cornhole pilot

The first live event planned with a real purse is a cornhole tournament in Hochatown, Oklahoma, at a local venue **[venue TBD]** or at a cabin. Cornhole is a good pilot: it is widely played, easy to score, and a single scorekeeper can handle a bracket. The structure is:

- **Format:** bracket (single or double elimination) or round-robin into a bracket. **[Format TBD]**
- **Field:** about 8 teams of two, or 10 to 20 players.
- **Referee:** one human scorekeeper who stakes SITS, may not enter, and reports results.
- **Posted terms:** entry, purse, venue cut, promoter cut, referee fee, and 1st/2nd/3rd payouts, all published before entry.

Illustrative numbers (not final):

| Item | Amount (SITS) |
|---|---|
| Entry per team | 50 |
| Teams | 8 |
| Gross entries | 400 |
| Venue cut, 10% | 40 |
| Promoter cut, 10% | 40 |
| Referee fee, 5% | 20 |
| **Purse to winners** | **300** |
| 1st place, 50% of purse | 150 |
| 2nd place, 30% of purse | 90 |
| 3rd place, 20% of purse | 60 |

Off-chain costs, such as a cabin rental or a food minimum at the venue, would be disclosed on the contest card and paid directly, not through the contract.

The Stish Sits phone contest stays the flagship app-refereed format. The cornhole pilot tests the human-referee side of the platform.

---

## 6. Roles and incentives

| Role | What they do | What they put up | What they receive | Key constraint |
|---|---|---|---|---|
| Competitor | Enters and competes | Entry | A prize from the purse if they place | Plays by the posted rules |
| Referee / scorekeeper | Reports results | Stake in SITS | The posted referee fee | May never enter, or share in, a contest they officiate |
| Promoter | Fills the field | Stake in SITS **[later phases]** | The promoter fee set in the contest rules, which can scale with turnout | Does not decide the winner |
| Venue | Hosts the event | Real-world space and costs | The venue fee set in the contest rules | Discloses off-chain costs up front |
| Organizer | Creates the contest in the builder | Time, setup | May be the promoter, or may hire one | Terms lock at publish |

**Competitors** get transparency: they can see the purse grow, see every cut, and see their payout land.

**Referees** stake SITS and lose it if they cheat or report wrong results. Their reputation is built from an on-chain record of contests officiated and disputes lost. Referees can never enter, or share in the purse of, a contest they officiate, because referee and competitor collusion is the main scam the system must guard against.

**Promoters** browse open contests and see who signed up, the purse size, the venue and the competition. They can offer to promote a contest for the promoter fee set in its rules. They stake SITS to show skin in the game, build a credibility record (contests promoted, turnout, completion rate, disputes), and receive the posted promoter fee, which may follow a sliding scale based on turnout. An illustrative scale: 5% of entries under 10 entrants, 8% for 10 to 19, 10% for 20 or more. **[Scale TBD]**

**Venues** set their cut and disclose real-world costs off chain, such as green fees or golf carts. Some venues are free, like a public fishing spot.

**Partnerships.** Promoters, referees and venues can partner up to build real businesses: a venue with a regular league night, a referee crew that covers several towns, a promoter who runs a season. The platform records each party's history so good operators can show their track record.

---

## 7. Staking, challenges and slashing

### 7.1 The model

The design follows a proven pattern: an **optimistic** result, a **bonded challenge** window, and **slashing** for a wrong result. Two existing systems inform it:

- **UMA's optimistic oracle.** A proposer posts an answer with a bond. If nobody disputes it within a liveness window, it is accepted. A disputer must also post a bond, and the dispute escalates to a resolution process. The loser's bond pays the winner.
- **Kleros.** Disputes go to jurors who have staked a token and are drawn at random. Jurors who vote against the final outcome lose part of their stake.

Stish Sits adapts these ideas for small local contests.

### 7.2 Flow for a human-refereed contest

1. **Referee stake.** Before a contest opens, the assigned referee deposits a stake in SITS into the contest application. **[Proposed rule: stake at least equal to the expected purse, so cheating to steer the purse costs more than it could gain.]**
2. **Result posted.** After the event, the referee submits the placings, signed from their referee account.
3. **Challenge window.** A posted window opens, for example 2 hours for a same-day local event or 24 hours for a larger one. **[Window TBD]**
4. **Challenge.** A challenge succeeds in opening only if at least X entrants dispute (X is posted per contest; for example 2 entrants, or 25% of the field, whichever is larger). Each challenger posts a small bond, for example 10% of their entry. **[X and bond size TBD]**
5. **No challenge.** The result becomes final and the contract settles in one atomic group.
6. **Challenge opened.** Settlement pauses and the dispute goes to review:
   - **Early phases:** a disclosed review by the platform operator using the scorecards, video if any, and witness statements. This is centralized and we say so plainly.
   - **Later phases:** a panel of other staked referees drawn at random, in the style of Kleros. **[Design TBD]**
7. **Outcome.**
   - Challenge upheld: the result is corrected, the referee's stake is slashed, challengers get their bonds back plus a share of the slashed stake, and the remainder of the slash goes to the purse winners or a dispute fund. **[Split TBD]**
   - Challenge rejected: the original result settles, and challenger bonds go to the referee and the winners as compensation for the delay. **[Split TBD]**

The bond is the key to fairness in both directions. Referees cannot cheat without losing their stake. Sore losers cannot stall a payout without paying for it.

### 7.3 Flow for Stish Sits races

In Stish Sits, the referee is the server that scheduled the pulses and received the motion data. The same window applies, but it is shorter (for example 30 to 60 minutes), and the evidence is the motion log and pulse log for each sitter, which sitters can view. **[Window TBD]** A later version can replace the single referee key with a threshold of organizers; the draft deliberately does not start there.

### 7.4 Conflict rules

- A referee address cannot enter, and the contract rejects an entry from the referee address.
- An on-chain check only catches the same address. A referee could still collude through a different wallet. Real-world controls are needed too: a referee's identity is known to the venue and platform, a referee's history is public, and a referee who is found to have colluded is slashed and barred.
- Promoters do not decide winners (rule 13). Venues do not decide winners.

---

## 8. On-chain architecture on Algorand

### 8.1 Why Algorand

Algorand offers low and predictable transaction fees, fast blocks with immediate finality (no forks to wait out), native assets (ASAs) that do not need a custom token contract, atomic transaction groups, and smart contract applications with inner transactions. These features map directly onto escrowed entries and all-or-nothing payouts. Algorand Foundation has encouraged Eric to build on the chain for some time; no formal partnership or support arrangement exists at this writing.

### 8.2 The SITS asset

| Field | Value (read from Algorand mainnet indexer, Oct 9, 2026) |
|---|---|
| Asset ID | 127494380 |
| Name / unit | Stish Sits / SITS |
| Total supply | 500,000,000 SITS |
| Decimals | 4 |
| Creator | 3ELOPICTSZ5Y4W4VKXG533NEN6UBT3G5AGXXYWTA5OSDZ3DEN2ZAGOD24M |
| Manager, reserve, freeze, clawback | All set to the creator account |
| Default frozen | No |
| Holdings snapshot | Creator holds about 493.9 million SITS (about 98.8%); 178 accounts hold a nonzero balance |

Clawback and freeze are both enabled. That gives the issuer the technical ability to move or freeze SITS in any holder's account. We disclose this plainly. The intended use of clawback is narrow: a backstop if a payment was sent to the wrong account by mistake. Normal forfeits do not need it, because entries never leave the contest application until settlement. **[Open: publish a written clawback and freeze policy, and consider moving these roles to a multisig account.]**

### 8.3 Applications

- **Contest application.** One application per contest. Global state holds the contest id, template, division or class, entry amount, cuts in basis points, payout table, referee, promoter, venue, status and timing. Per-entrant records (paid, sitting, forfeited, placed) live in box storage so a field is not limited by local state slots. The application account opts into SITS and holds the entries.
- **Contest factory.** A parent application that creates contest applications from approved templates, so every contest runs audited code with only its parameters changed. Version one can be a single contest application; the factory follows, as the draft suggests.
- **Registry (later).** Tracks per-account history: entries per division, wins, contests officiated, disputes, promoter turnout. Used for division gates and reputation.

### 8.4 Calls

| Call | Who | What it does |
|---|---|---|
| Create | Organizer via factory | Sets the posted terms, which cannot change after entry opens |
| Stake | Referee (and later promoter) | Deposits stake into the contest application |
| Enter | Entrant | Atomic group: SITS transfer to the app plus an app call. The app rejects a wrong amount, a late entry, an ineligible entrant, or the referee's address |
| Forfeit | Referee key, or the entrant | Marks a forfeit. The entry stays in the purse |
| Post result | Referee key | Records winner(s) and starts the challenge window |
| Challenge | Entrant with bond | Records a dispute; pauses settlement once the threshold is met |
| Settle | Anyone, after the window | Pays winners, venue, promoter and referee as inner transactions in one atomic group; releases stakes |
| Cancel | Anyone, if the field is short at start time | Refunds every entry and releases every stake |

### 8.5 Atomic group settlement

Settlement issues all payments as inner transactions from one application call. Algorand executes the whole group or none of it. There is no state where the promoter is paid but the winner is not. Each payout transaction is publicly visible, and the result screen links to it.

### 8.6 Wallets: Pera WalletConnect, no seed phrases

Entrants connect with Pera Wallet through WalletConnect. The app requests signatures and never asks for, stores or sees a seed phrase. Each entrant must opt into ASA 127494380 once, which the app walks them through. Additional wallets can be supported later through a multi-wallet library.

---

## 9. Player onboarding

### 9.1 The friction

The biggest obstacle for a new player is not the contest. It is the setup: installing Pera Wallet, creating an account, getting a small amount of ALGO for fees, and opting into SITS (ASA 127494380) before they can enter. Many Hochatown visitors are tech workers from the Dallas area, but even comfortable phone users usually have not used an Algorand wallet. We expect a learning curve and plan for it.

### 9.2 QR-code setup at the event table

Every live event has a setup table with a helper:

- A printed QR code that opens the Stish Sits setup page (stishsits.com) on the player's phone.
- The setup page links to the official Pera Wallet listing for iPhone or Android and walks the player through each step.
- A second QR code on the contest page lets the player connect Pera through WalletConnect and approve the SITS opt-in and entry from a pre-built transaction, so nobody has to type an asset ID.
- The helper watches, answers questions, and checks that the player can see SITS in their wallet before they enter.
- The helper never touches the player's recovery phrase and never asks for it. A printed sign says so.
- Target: a first-time player goes from no wallet to entered in about five minutes. **[Target, to be measured at the pilot]**

### 9.3 Step-by-step opt-in guide

This is the guide printed at the table and posted on the site. Menu labels in Pera may differ slightly by app version.

1. **Install Pera Wallet** from the App Store or Google Play using the link on the setup page. Check that the publisher is Pera.
2. **Create a new account** in Pera.
3. **Write down your recovery passphrase** on paper and keep it private. Pera shows it once. Stish Sits, the helper and the contest app will never ask for it.
4. **Get a small amount of ALGO** for the account minimum and fees (see 9.4). **[How new players get this ALGO is an open decision; see 9.5.]**
5. **Add the SITS asset.** In Pera, use the add-asset option, search for **127494380**, and confirm that the name is **Stish Sits** and the unit is **SITS**. Lookalike assets with similar names can exist; the number is what matters. Approve the opt-in. Alternatively, scan the opt-in QR code at the table and approve it in Pera.
6. **Confirm** that SITS now shows in your asset list, with a balance of zero.
7. **Get SITS for the entry** by the method counsel approves. **[Open; see 9.5]**
8. **Enter the contest.** Scan the contest QR code, connect Pera, review the posted entry, purse and cuts, and approve the entry transaction.
9. **Check your entry** on the public contest page. Your account should show as paid.

### 9.4 Fees are tiny

Algorand network fees are very small: the minimum transaction fee is 0.001 ALGO. Beyond fees, every Algorand account must keep a small minimum balance: 0.1 ALGO for the account itself plus 0.1 ALGO for each asset it opts into. So a new player needs roughly 0.2 ALGO held in the account plus a few thousandths of an ALGO for the opt-in and entry fees. The minimum balance is not spent; it stays in the player's account. Contract settlement fees are covered by the contest application.

### 9.5 Selling SITS at events: needs attorney review

The simplest-looking option, selling SITS for cash or card at the event table, may raise money-transmission issues, and possibly securities issues, at the federal (FinCEN) and state level. The same applies to buying SITS back from winners. We will not sell or buy back SITS at events unless an attorney advises that a specific structure is allowed. Alternatives to review with counsel include in-person cash entries recorded on chain by the organizer, entries in a stablecoin, or distributing SITS without a sale. Even small gifts of ALGO to cover new players' minimum balances should be reviewed. **[Open decision, Phase 0]**

## 10. The oracle problem and anti-cheat

### 10.1 The oracle problem

A contract pays whatever it is told. On-chain settlement makes the money honest only if the result fed to the contract is honest. This is the oracle problem, and it is the most important design question for the platform.

Stish Sits is a good first test because the phone, guided by the server, produces the result. There is no human judgment to corrupt. Other sports need staked human referees or scorekeepers, a challenge window and slashing, as described in Section 7.

### 10.2 Stish Sits anti-cheat

- **Server-picked timing.** The server, not the phone, picks each pulse time and content, so a sitter cannot memorize the gaps. The phone only displays what the server sends and reports the answer and the motion data.
- **Accelerometer, not camera.** Each sample is compared to the last. A slow drift can be ignored. A grab, a stand-up or a hard buzz crosses the line. First races use a generous line, tightened only after real sits.
- **Motion logs.** Samples for each sit are logged so a dispute has a record. A hash of each log can be written into the settlement transaction note so the log cannot be changed later. **[Proposed]**
- **Same line for everyone** in a race (rule 8).

### 10.3 Known gaps and how we plan to handle them

| Gap | Detail | Approach |
|---|---|---|
| iOS cannot read the silent switch or airplane mode | Apple does not expose these to apps | On iPhone, the checklist relies on the sitter confirming silent and airplane mode themselves. A buzz after the first minute is still a forfeit under rule 6, so the incentive is aligned |
| Android can check | Android exposes ringer mode, airplane mode and Do Not Disturb status | The Android app checks and refuses to arm if it can tell the ringer is not silent (rule 5) |
| Web apps lose sensors | A browser page loses accelerometer access when the screen locks or the sitter switches apps | Build a native app, keep the screen awake during a sit, and treat leaving the app as a forfeit. A web version, if any, is for demos only |
| The "still surface" gap | Someone could set the phone on a table and walk around while still answering pulses from nearby | Proposed: a "lap" mode where natural body micro-motion is expected and a perfectly flat signal is flagged; tighter answer windows; optional on-device presence checks at random pulses. **[Open design question; needs real-sit data]** |
| Device tampering | Rooted or jailbroken phones, emulators, sensor spoofing | Platform attestation checks (Play Integrity on Android, App Attest on iOS) **[Planned]** |
| Multiple accounts | One person entering many times to farm a purse | Proposed: verified identity for real-purse contests; one entry per verified person per race **[Depends on legal review]** |

---

## 11. The SITS token's role

SITS has two jobs on the platform:

1. **Entry chip.** Contest entries are posted and paid in SITS.
2. **Stake.** Referees, and later promoters, stake SITS as a performance bond that can be slashed.

What SITS is not:

- It is not offered as an investment, and no one should acquire it expecting a profit.
- We make no claim that SITS will rise in value.
- We make no claim that a purse pays anyone's bills.
- Staking is a performance bond for doing a job (refereeing, promoting). It is not designed as a passive yield product. Referees receive the posted fee for work done, not interest on their stake.

The purse is the prize shown on chain before the contest. That is the whole promise.

How entrants obtain SITS for real-purse contests, and how winners convert it, is an open question with significant legal implications. It is addressed in Sections 9 and 14 and is a decision to be made with counsel before any real-purse event.

---

## 12. History of SITS

We have nothing to hide, so here is the full history of the token, including the parts that did not go well.

### 12.1 Origin and first use

Eric Binkley created SITS on Algorand in February 2021 (creation round 12,013,291) and holds the creator account today. Its first use was as a rewards token on a social media website run by Eric's team. Users received SITS for liking and commenting on posts, and could spend SITS to promote or boost their own content. Some users bought SITS to pay for boosting.

SITS was also sold directly for cash through a card payment flow. Stripe, the payment processor, shut that down, and direct cash sales stopped.

### 12.2 Trading and the Tinyman v1 exploit

SITS traded on Tinyman, an automated market maker (AMM) exchange on Algorand, with some volume.

On January 1, 2022 (starting around 19:03 UTC, about 1:03 PM Central), attackers began exploiting a previously unknown vulnerability in the Tinyman v1 pool contracts. The flaw was in the "burn" operation, which removes liquidity from a pool: the contract did not check the asset IDs and transaction type in part of the transaction group, so an attacker could withdraw two units of the more valuable asset in a pair instead of one of each. The largest losses were in the goBTC/ALGO and goETH/ALGO pools. Tinyman estimated roughly $3 million was withdrawn in the first wave, with copycat attacks following. On January 2, 2022, Tinyman advised all users to withdraw their liquidity from its pools, and it then patched the contracts after a security review by Runtime Verification. Sources: Tinyman's official announcement and technical report (January 2022) and the Runtime Verification security review.

This was a flaw in Tinyman's pool contract, not in SITS. The SITS asset itself was not altered. Eric reports that some SITS holders were caught up in the incident and its aftermath, and trading activity faded. That history is why SITS has about 178 holders today, the figure read from the Algorand indexer for this paper.

### 12.3 Why relaunch now

Algorand's user base and very low fees make this a good time to give SITS a genuine use case: an entry chip and a stake for real skill contests, not rewards for likes. In Eric's words:

> *"Someone has to sit in the seat to referee, someone has to promote, and someone has to sit in the competition seat. Real purses created by real people."*

Stish Sits also happens to be a palindrome. It reads the same backward, which seems right for a contest about staying put.

### 12.4 Issuer liquidity (discretionary, nothing promised)

ARMOOK may provide liquidity for SITS at its discretion. No price, value or market is promised, and no one should expect that they will be able to acquire or dispose of SITS at any particular level, or at all. ARMOOK does not intend to support the price of SITS or to act as a market maker. No amount, venue or terms have been set, and nothing will be done before counsel has reviewed it (Section 14.3). Any issuer-provided liquidity, and the creator account's holdings, will be disclosed publicly.

---

## 13. Fees and economics

### 13.1 Stish Sits examples (from the draft)

The default promoter cut is 10 percent of entries (rule 13). Forfeited entries stay in the purse (rule 14). The purse grows only with more entries and never rolls over (rule 15).

| Division | Entry | Sitters | Gross entries | Promoter cut (10%) | Winner receives |
|---|---|---|---|---|---|
| Beginner | 10 SITS | 10 | 100 SITS | 10 SITS | 90 SITS |
| Intermediate | 50 SITS | 10 | 500 SITS | 50 SITS | 450 SITS |
| Open | 100 SITS | 10 | 1,000 SITS | 100 SITS | 900 SITS |
| Any | Any | 1 | n/a | 0 | No race; entry refunded (rule 2) |

Sitter counts above are illustrative. Invite entries are posted before each Invite race.

### 13.2 Multi-party contests

For contests with venues, referees and classes, the cuts are posted in the builder and paid at the final. See the cornhole example in Section 5.3.

### 13.3 Network costs and platform revenue

Network costs are covered in Section 9.4: entrants pay their own tiny entry fees, and the contest application covers settlement fees through fee pooling. The draft does not define a platform fee; whether Stish Sits takes one, and how much, is an open decision. **[Unconfirmed]**

### 13.4 What is not in version one

Per the draft: no shops, no brand deals, no teams, no token price, no rollover jackpot, no live video of every sitter, and no national final.

---

## 14. Compliance approach

### 14.1 Where we stand

No attorney has reviewed this design yet. The items below are risks we have identified, not conclusions. Our plan is to obtain a legal review before the first real-purse event and to launch only in states where counsel advises it is allowed.

### 14.2 Gambling and contest law

- Entry fee plus prize can be treated as gambling in some states, depending on how much the outcome depends on skill versus chance.
- States use different tests. Many apply a "dominant factor" test; others are stricter and treat any material element of chance as disqualifying. Some states prohibit paid-entry contests, especially online ones, outright, or regulate them separately.
- Online contests are often treated differently from in-person events. Stish Sits is played on a phone; the cornhole pilot is in person. Each needs its own analysis.
- Stish Sits rules avoid random draws (rule 12), and tie-breaks are based on performance (rule 11). Whether pulse timing, which is randomized to prevent memorization, affects the analysis is a question for counsel.

### 14.3 Token, money transmission and securities

- **Securities.** A tradable token raises securities questions, particularly if it is sold to the public or marketed with any expectation of profit. Staking for rewards can draw securities scrutiny. The creator account holds about 98.8% of supply, which counsel will need to consider in any distribution plan.
- **Money transmission and FinCEN.** Holding entrants' value in escrow and paying it out, or selling and buying back SITS, may raise money transmission questions at the federal (FinCEN) and state level.
- **Issuer controls.** Clawback and freeze are enabled and must be disclosed and governed.
- **Prior cash sales.** SITS was previously sold directly for cash until Stripe shut that down. Counsel needs to review how those past sales affect the token's status today and what disclosure they require.
- **Boost purchases.** Some users bought SITS to boost content on the earlier social site. Counsel should review whether those purchases, which were for a use inside a product, change the analysis.
- **Issuer liquidity.** Any liquidity provided by the issuer could be viewed as market making or price support. ARMOOK does not intend either. Counsel should advise on structure and disclosure before any liquidity is provided.
- **Creator holdings disclosure.** The creator account holds about 98.8% of supply. We plan to disclose these holdings and any changes to them publicly; counsel should advise on the form and frequency.

### 14.4 Other items for review

- Age limits and identity verification for real-purse contests
- Geofencing to states where the contest is allowed
- Tax reporting for prize winnings
- Terms of service, privacy policy, and handling of motion data
- Venue and promoter agreements, and liability for in-person events
- Selling SITS, or buying it back, for cash or card at events (Section 9.5)
- Collegiate events: age limits (some players will be under 18 or under 21), state rules for minors in paid-entry contests, and each campus's own rules on paid events, prizes and digital assets
- Spectator features (future research only; not planned): any feature that involved money from non-participants would raise state gaming-law and CFTC questions, would need its own legal structure, and must never be mixed with contest purses

### 14.5 Entity

Eric's standing practice is that money-collecting sites sit under ARMOOK LLC as a DBA unless an attorney advises a separate entity. That choice will be made with counsel in Phase 0.

---

## 15. Roadmap

The roadmap follows the draft's build order, with Eric's cornhole pilot as the first real-purse event. Timing depends on legal review and is not committed.

| Phase | Focus | Gate to the next phase |
|---|---|---|
| 0 | Legal review, entity, domain, server | Attorney sign-off on pilot structure and launch states |
| 1 | Rules page and landing site at stishsits.com | Rules published |
| 2 | Phone prototype: arms, times, pulses, forfeits, motion logs. No wallet yet | Repeatable clean sits on iOS and Android |
| 3 | Testnet contracts: enter, forfeit, settle, cancel; multi-payout with venue, promoter and referee cuts; referee stake | Full flow on testnet with fake entries |
| 4 | Pilot: a cornhole tournament in Hochatown, OK, with a staked scorekeeper and real 1st/2nd/3rd payouts; optional Stish Sits beginner race of about 10 people | Contract paid winners correctly; no unresolved disputes |
| 5 | Organizer cut, division gates, season board | Gates enforced on chain |
| 6 | Contest builder, staked referees, bonded challenges | Multiple organizers run contests without hand-holding |
| 7 | Promoter marketplace and venues | Promoters and venues transacting on the platform |
| 8 | Collegiate expansion: students organize events and work as referees; colleges host as venues and receive the venue fee set in the contest rules | Campus approval and age rules confirmed for each school |

**Go-to-market.** Traffic is the real challenge for any marketplace, and Eric has built marketplaces before from his classifieds days. The plan is to prove it locally first in Hochatown and Broken Bow, Oklahoma: small events of 10 to 20 people with real payouts, then a regular schedule, then nearby towns. Algorand Foundation may help promote the project; nothing has been agreed. **[Unconfirmed]** The long-term goal is an annual Stish Sits event in Hochatown.

**Collegiate expansion (Phase 8).** Colleges are a natural fit for the platform's roles. Students can organize events and work as staked referees and scorekeepers, and colleges can host and receive the venue fee set in the contest rules. Two cautions: many students are under 21 and some are under 18, so age limits must follow state law and counsel's advice; and every campus has its own rules on paid events, prizes and digital assets, which must be cleared with the school first. **[No school has been approached]**

**Future research (not planned; only if lawful and approved by counsel): spectator features.** This is not part of the roadmap above and may never happen. Stish Sits is a skill contest: competitors pay to enter and control their own performance. Any feature for spectators who are not competing would be a different activity with different legal rules, would be considered only if counsel confirms it is lawful, would need its own legal structure, and would never touch contest purses. Competitors and referees would never be allowed to take a position on their own contests.

---

## 16. Disclaimer

This white paper is a draft for discussion. It describes a product that is not yet built, and the design may change. It is not an offer to sell, or a solicitation of an offer to buy, SITS or any other asset, and it is not legal, tax, financial or investment advice. SITS is intended as an entry chip and performance stake inside the Stish Sits platform. No one should acquire SITS expecting profit, any issuer-provided liquidity is discretionary and is not a promise of any price, value or market, and we make no claim that SITS will rise in value or that any purse will pay anyone's bills. Paid-entry contests may not be lawful in every jurisdiction; Stish Sits will operate real-purse contests only where counsel advises it is permitted. The SITS asset has clawback and freeze enabled, controlled by the creator account. On-chain data cited here is a snapshot from October 9, 2026, and may change. No partnership with Algorand Foundation, any college, or any venue is implied. No spectator features are offered or planned; any would be considered only if lawful and approved by counsel, under a separate legal structure.
