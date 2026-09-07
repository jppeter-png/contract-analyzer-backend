# nda-03

**Category:** nda  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`nda-03.txt`](nda-03.txt)

## Expected findings (2)

### 🔴 liquidated-damages (high)

> entitles Company to liquidated damages of $250,000 per incident, in addition to any other remedies available at law

A large fixed penalty with no requirement to show actual harm, stackable per incident and on top of other remedies, is an unusually aggressive and potentially punitive damages structure for an NDA.

### 🔴 jurisdiction-selected-later (high)

> governed by the laws of a jurisdiction to be selected by Company at its sole discretion at the time any dispute arises

Leaving governing law undetermined until a dispute actually happens, and letting only one party pick it, removes any predictability for the other side and all but guarantees a forum favorable to Company.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "nda-03"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
