# lease-02

**Category:** lease  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`lease-02.txt`](lease-02.txt)

## Expected findings (2)

### 🟡 structural-repairs-shifted (medium)

> Tenant is responsible for all repairs and maintenance to the premises, including structural repairs, roof, and HVAC systems, regardless of the cause of damage

Structural repairs, roof, and HVAC are normally landlord obligations in a commercial lease — shifting them entirely to the tenant, with no exception even for landlord-caused damage, is an unusual and costly liability transfer.

### 🟢 late-fee (low)

> incurs a late fee of $150, plus 1.5% monthly interest on the unpaid balance

A flat fee plus ongoing interest is on the higher end for commercial lease late charges, though not egregious — worth negotiating but not a major red flag on its own.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "lease-02"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
