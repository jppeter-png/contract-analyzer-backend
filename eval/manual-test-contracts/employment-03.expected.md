# employment-03

**Category:** employment  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`employment-03.txt`](employment-03.txt)

## Expected findings (2)

### 🔴 wage-theft (high)

> without payment of any accrued but unused vacation time, notwithstanding any state law requiring payout of accrued vacation upon termination

Explicitly attempts to override state law requiring payout of accrued vacation — this is the kind of clause likely to be unenforceable and is a clear wage-theft red flag.

### 🟡 non-solicitation (medium)

> For 5 years after termination, Employee shall not solicit, hire, or attempt to hire any person who was employed by the Company at any point during the preceding 10 years

A 5-year restriction reaching back to cover employees from up to 10 years before termination is far outside the 1-2 year ranges that are typically enforceable for non-solicitation clauses.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "employment-03"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
