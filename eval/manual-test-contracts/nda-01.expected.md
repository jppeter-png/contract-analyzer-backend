# nda-01

**Category:** nda  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`nda-01.txt`](nda-01.txt)

## Expected findings (2)

### 🔴 overbroad-definition (high)

> including information that is publicly known, information Recipient already possessed prior to disclosure, and information independently developed by Recipient

A proper NDA excludes information that's already public, already known, or independently developed. Including them in the definition means Recipient could technically be restricted from using its own pre-existing or independently-created knowledge.

### 🟡 perpetual-duration (medium)

> The obligations of confidentiality under this Agreement shall survive in perpetuity and have no expiration date

Confidentiality obligations with no end date are unusual and often unenforceable — most NDAs specify a 2-5 year term.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "nda-01"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
