# loan-05

**Category:** loan  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`loan-05.txt`](loan-05.txt)

## Expected findings (1)

### 🟡 overbroad-collateral-via-definition (medium)

> Borrower grants Lender a security interest in all business assets, now owned or hereafter acquired, to secure payment of the Obligations

A blanket lien on all business assets is already broad, but it's secured against "Obligations" — a term defined earlier to include any amount Lender determines in good faith is owed under this or any related document, not just the credit line itself. Read together, this could let Lender reach the collateral for more than the line of credit balance.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "loan-05"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
