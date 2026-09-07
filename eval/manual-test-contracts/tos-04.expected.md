# tos-04

**Category:** tos  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`tos-04.txt`](tos-04.txt)

## Expected findings (1)

### 🟡 indefinite-retention-of-personal-data (medium)

> We retain User Content, including any personal information it contains, indefinitely for "platform improvement purposes," even after account deletion

This clause reads as a normal data-retention note on its own, but "User Content" was defined earlier to explicitly include personal information embedded in uploads and posts — meaning personal data specifically, not just anonymous usage content, is retained forever even after the user deletes their account. The privacy risk only becomes clear when the retention clause is read against the broader definition.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "tos-04"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
