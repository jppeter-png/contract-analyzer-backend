# employment-02

**Category:** employment  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`employment-02.txt`](employment-02.txt)

## Expected findings (2)

### 🟡 bonus-clawback (medium)

> Any performance bonus paid to Employee is subject to full repayment if Employee resigns or is terminated for any reason within 24 months of the bonus payment date, regardless of the reason for departure

Clawback applies even to voluntary resignation or no-cause termination, for a full 24 months — an unusually punitive trigger for what's framed as ordinary performance compensation.

### 🟢 confidentiality-scope (low)

> including general industry knowledge and skills acquired during employment, and shall not disclose or use such information at any time, without geographic or temporal limitation

Confidentiality is defined to cover general industry knowledge and skills the employee would normally be free to take to a new job, with no time limit — overbroad, though less severe than a clause restricting an actual trade secret.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "employment-02"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
