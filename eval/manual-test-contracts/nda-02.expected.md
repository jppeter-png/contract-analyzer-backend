# nda-02

**Category:** nda  
**Clean (no injected traps):** No  
**Source:** synthetic

Test file: [`nda-02.txt`](nda-02.txt)

## Expected findings (2)

### 🟡 one-sided-obligations (medium)

> This Agreement imposes confidentiality obligations on Contractor only; Sable Robotics may use or disclose any information Contractor shares during the engagement without restriction

A one-way confidentiality obligation in what's framed as a mutual working relationship — Contractor's own confidential information gets no protection at all.

### 🟢 non-solicitation (low)

> During the engagement and for 18 months thereafter, Contractor shall not solicit for employment any individual who was an employee of Sable Robotics at the time of the engagement

A non-solicitation clause embedded in an NDA is a modest scope-creep beyond confidentiality, though 18 months limited to current employees at time of engagement is within a defensible range — worth flagging but not severe.

---

Part of the automated eval set — see [`../dataset.json`](../dataset.json) (same entry, `id: "nda-02"`) and [`../results.md`](../results.md) for how the app actually scored against this and the other 29 contracts.
