# lease-03

**Category:** lease  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`lease-03.txt`](lease-03.txt)

## Expected findings (2)

### 🔴 nonrefundable-pet-deposit (high)

> A pet deposit of $500 is non-refundable regardless of whether any pet damage occurs, and is charged even if Tenant never has a pet during the lease term but merely reserves the right to

A non-refundable charge levied even when no pet is ever present and no damage occurs is effectively a disguised fee, not a real deposit — and many jurisdictions cap or prohibit non-refundable pet deposits.

### 🔴 notice-period-excessive (high)

> renews automatically for another full 12-month term unless Tenant gives 120 days' written notice

A 120-day non-renewal notice window is nearly a third of the lease term itself, making it easy for a tenant to miss the deadline and get locked into another full year unintentionally.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "lease-03"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
