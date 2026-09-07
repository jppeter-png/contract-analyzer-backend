# nda-04

**Category:** nda  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`nda-04.txt`](nda-04.txt)

## Expected findings (1)

### 🟡 ip-overreach (medium)

> All Confidential Information, as defined in Section 1, together with all right, title, and interest therein, remains the sole property of Quill Data Corp at all times

This ownership clause looks like boilerplate on its own, but Section 1's definition of "Confidential Information" was quietly expanded to include Evaluator's own notes, analyses, and derivative work product — so the ownership clause effectively claims Quill's ownership over analysis the Evaluator itself created. Spotting this requires connecting Section 3 back to the broadened definition in Section 1.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "nda-04"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
