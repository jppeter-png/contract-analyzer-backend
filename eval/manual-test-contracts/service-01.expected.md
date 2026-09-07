# service-01

**Category:** service  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`service-01.txt`](service-01.txt)

## Expected findings (2)

### 🔴 liability-cap-too-low (high)

> Consultant's total liability under this Agreement, including for gross negligence or willful misconduct, shall not exceed $100, regardless of the actual damages incurred by Client

A $100 cap that also covers gross negligence and willful misconduct — categories of harm that liability caps normally exclude — leaves Client with essentially no real recourse no matter how badly Consultant fails.

### 🟡 one-sided-indemnity (medium)

> Consultant shall indemnify, defend, and hold harmless Client from any and all claims, losses, or damages arising from this engagement, including claims caused by Client's own negligence

Consultant is forced to cover claims caused by Client's own negligence, not just its own — a one-sided risk allocation with no reciprocal protection for Consultant.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "service-01"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
