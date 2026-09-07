# employment-04

**Category:** employment  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`employment-04.txt`](employment-04.txt)

## Expected findings (1)

### 🟡 non-compete (medium)

> Employee shall not accept employment with, consult for, or hold any ownership interest in any entity engaged in Company Business

The 1-year duration looks reasonable in isolation, but "Company Business" is defined earlier to include any line of business the Company might enter or acquire in the future — so the actual scope of what's off-limits is open-ended and can't be determined at signing. The risk only becomes clear by cross-referencing the definitions section against the non-compete clause.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "employment-04"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
