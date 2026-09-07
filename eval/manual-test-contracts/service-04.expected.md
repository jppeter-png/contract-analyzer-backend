# service-04

**Category:** service  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`service-04.txt`](service-04.txt)

## Expected findings (1)

### 🟢 deemed-acceptance (low)

> Client shall be deemed to have accepted all Deliverables, and payment for the corresponding installment becomes due, five business days after Advisor provides a Deliverable, whether or not Client has reviewed it

A short automatic-acceptance window is common enough not to be alarming on its own, but combined with the earlier definition of "Deliverables" including draft-form work product, it means Client could owe payment for a rough draft it never got to properly review — the practical risk only shows up when the acceptance clause is read against the broad definition of Deliverables.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "service-04"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
