# tos-02

**Category:** tos  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`tos-02.txt`](tos-02.txt)

## Expected findings (2)

### 🟡 vague-third-party-sharing (medium)

> share this data with "marketing partners" without specifying who those partners are or how they will use the data

Continuous background location data shared with unnamed "marketing partners" gives the user no way to know who actually receives sensitive location history or for what purpose.

### 🟢 difficult-cancellation (low)

> you must call our support line during specific business hours and provide 30 days' advance notice; email or in-app cancellation is not available

Requiring a phone call during limited hours with a month of advance notice, and blocking the easier channels (email, in-app) a user signed up through, is a mild but real "dark pattern" making cancellation deliberately harder than signup.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "tos-02"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
