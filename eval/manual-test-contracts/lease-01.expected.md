# lease-01

**Category:** lease  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`lease-01.txt`](lease-01.txt)

## Expected findings (2)

### 🔴 rent-increase (high)

> Landlord may increase rent by any amount, with 5 days' written notice, at any time during the lease term

No cap on increase amount and only 5 days' notice mid-lease — far short of what most jurisdictions require and effectively lets the landlord force out a tenant with almost no warning.

### 🟡 entry-notice (medium)

> Landlord may enter the unit at any time, for any reason, without prior notice to Tenant

Removes the tenant's standard right to advance notice before landlord entry, which most residential tenancy law requires except in emergencies.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "lease-01"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
