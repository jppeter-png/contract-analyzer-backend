# Manual test contracts

Every contract from [`../dataset.json`](../dataset.json), exported as a standalone `.txt` file — for trying the app by hand, not for the automated harness (that reads `dataset.json` directly via `npm run eval`).

Each `<id>.txt` is paired with an `<id>.expected.md` describing what a correct analysis should find.

## How to use

1. Open `<id>.txt`, copy its contents.
2. In the mobile app, paste it into the **Paste text** tab (or save it as a `.txt` file and use **Upload file**) and run the analysis.
3. Open the matching `<id>.expected.md` and compare: did the app catch the listed issue(s)? For a `*-clean` entry (marked "Clean: Yes"), did it avoid reporting any actively unfair clause?

30 contracts total — 25 with known trap clauses (2, or occasionally 1 for the cross-clause ones, per file), 5 clean. One file per category naming prefix: `employment-*`, `nda-*`, `lease-*`, `service-*`, `loan-*`, `tos-*`.

These are generated from `dataset.json`, not hand-maintained — if the dataset changes, regenerate with `node eval/buildManualTestContracts.js` (run from `backend/`). That script isn't part of the automated eval pipeline (`npm run eval` doesn't touch it); it's a one-off content generator.
