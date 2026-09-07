# nda-05

**Category:** nda  
**Clean (no injected traps):** Yes  
**Source:** synthetic

Test file: [`nda-05.txt`](nda-05.txt)

## Expected result

No trap clauses were injected into this contract. A good analysis should not report any actively unfair clause (`unfair_clause`-typed issue). It may reasonably note a few standard protections as absent (`missing_protection`-typed issues) — that alone isn't a false positive, see the main README's note on the `type` field.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "nda-05"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
