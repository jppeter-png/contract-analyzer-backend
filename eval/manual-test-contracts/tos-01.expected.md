# tos-01

**Category:** tos  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`tos-01.txt`](tos-01.txt)

## Expected findings (2)

### 🔴 unilateral-modification (high)

> We may modify these Terms at any time, for any reason, effective immediately upon posting to our website, without direct notice to you

Terms can change instantly with no direct notice — just posting the change is deemed sufficient, and continued use is treated as automatic acceptance of terms the user may never see.

### 🔴 perpetual-content-license (high)

> a perpetual, irrevocable, worldwide, royalty-free, sublicensable license to use, reproduce, modify, distribute, and create derivative works from your content for any purpose, including commercial purposes unrelated to the App

The license is perpetual, irrevocable, and allows commercial use entirely unrelated to operating the app — far broader than what's needed to actually run the service.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "tos-01"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
