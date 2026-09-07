# lease-04

**Category:** lease  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`lease-04.txt`](lease-04.txt)

## Expected findings (1)

### 🟡 eviction-trigger-via-vague-fees (medium)

> Failure to pay any Rent or Additional Rent within 5 days of the due date constitutes a material default, entitling Landlord to pursue eviction proceedings immediately

On its own, a 5-day default-and-eviction clause for unpaid rent looks fairly standard. The real risk is that "Additional Rent" (Section 2) is defined so broadly that the landlord can unilaterally invent a new fee and then use non-payment of that fee, on a 5-day clock, as eviction grounds — the danger only appears when the default clause is read against the earlier fee definition.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "lease-04"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
