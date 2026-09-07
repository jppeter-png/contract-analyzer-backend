# loan-01

**Category:** loan  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`loan-01.txt`](loan-01.txt)

## Expected findings (2)

### 🔴 uncapped-variable-rate (high)

> Lender may adjust at any time at its sole discretion, with no cap on the maximum rate and no requirement to give advance notice

No cap on the interest rate and no advance notice requirement means Borrower has no way to anticipate or budget for future rate changes, which could rise dramatically at Lender's whim.

### 🔴 broad-default-trigger (high)

> or experiences any "adverse change in financial condition" as determined by Lender in its sole discretion

A subjective, Lender-determined default trigger with no objective standard means Borrower could be declared in default and face immediate acceleration for reasons entirely outside missed payments.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "loan-01"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
