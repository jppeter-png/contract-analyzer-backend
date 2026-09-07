# loan-04

**Category:** loan  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`loan-04.txt`](loan-04.txt)

## Expected findings (2)

### 🟡 no-cure-period (medium)

> a single missed payment constitutes default, and Lender may accelerate the full balance immediately without prior notice

No grace period and no notice before acceleration means a single late payment — even an honest mistake — can immediately trigger a demand for the full remaining balance.

### 🟢 late-fee (low)

> A payment more than 15 days late incurs a late fee of $40, capped at one late fee per billing cycle

This clause is actually reasonable (capped, modest amount, generous 15-day window) — included mainly to note it does NOT offset the missing grace period elsewhere in the agreement, not because the fee itself is a trap.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "loan-04"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
