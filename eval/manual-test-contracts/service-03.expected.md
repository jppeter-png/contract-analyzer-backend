# service-03

**Category:** service  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`service-03.txt`](service-03.txt)

## Expected findings (2)

### 🔴 arbitration-costs-one-sided (high)

> binding arbitration administered by an arbitrator of Agency's choosing, with Client responsible for 100% of arbitration costs regardless of outcome

Client must pay all arbitration costs no matter who wins, and Agency alone picks the arbitrator — this stacks the deck against Client in any dispute and could make pursuing a legitimate claim financially impractical.

### 🟢 termination-notice (low)

> Either party may terminate with 30 days' written notice

This term is actually balanced and standard — flagged here only as a minor note that Client should confirm what happens to fees already paid for the notice period, not because the clause itself is unfair.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "service-03"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
