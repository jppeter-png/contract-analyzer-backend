# tos-03

**Category:** tos  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`tos-03.txt`](tos-03.txt)

## Expected findings (2)

### 🔴 withhold-funds-on-suspicion (high)

> withhold any funds in your account balance for up to 180 days after termination, for any reason, including suspected but unproven violations of these Terms

Funds can be frozen for up to six months based on a mere unproven suspicion, with no described appeal process — a significant financial risk for anyone using the platform to get paid.

### 🟡 liability-cap-too-low (medium)

> Our total liability to you for any claim arising from your use of the platform is limited to $50, regardless of the actual amount of any transaction or damages incurred

A flat $50 cap regardless of transaction size means the platform bears essentially no risk even if its own error causes a much larger loss to the user.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "tos-03"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
