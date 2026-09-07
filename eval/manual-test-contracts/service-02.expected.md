# service-02

**Category:** service  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`service-02.txt`](service-02.txt)

## Expected findings (2)

### 🟡 ip-overreach (medium)

> including any pre-existing tools, libraries, and frameworks owned by Agency and incorporated into the deliverables, shall become the sole property of Client upon payment, with no license retained by Agency

Client claims ownership of Agency's own pre-existing tools and frameworks with no license carve-out — this would prevent Agency from reusing its own code on future projects, which is not how software service agreements are usually structured.

### 🟡 unlimited-free-change-orders (medium)

> Any changes to project scope requested by Client shall be performed by Agency at no additional cost, regardless of the scope or time required

No change-order pricing mechanism at all means Client can expand scope indefinitely without Agency being compensated for the added work — a classic scope-creep trap.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "service-02"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
