# Evaluation Results

Last run: 2026-09-07
Model: openai/gpt-oss-120b via Groq (temperature 0.2)
Dataset: `eval/dataset.json` (v1)

## Setup

- 30 contracts, 5 per category: employment, NDA, lease, service, loan, ToS
- 5 of those 30 are "clean" contracts (no injected traps), spread across 5 of the 6 categories (loan has none), to measure false-positive rate — including per-category, not just in aggregate
- Ground truth labeled manually against the trap categories in `backend/src/routes/analyze.js`'s per-type prompts, with severity and obviousness deliberately varied — not every trap is "high" severity, and a few require connecting two separate clauses rather than reading one in isolation
- Baseline: keyword/regex match against a fixed list of red-flag terms *per category* (`eval/keywordBaseline.js`), no LLM
- Matching: a prediction counts as hitting a ground-truth issue if it shares the issue's category vocabulary OR has substantive word overlap with the labeled `clause_excerpt` — not exact string match (see Methodology)

## Headline Metrics

| Approach | Precision | Recall | F1 |
|---|---|---|---|
| LLM (this app) | 0.73 | 0.91 | 0.81 |
| Keyword baseline | 0.73 | 0.86 | 0.79 |

### By category

| Category | Precision | Recall | F1 | n |
|---|---|---|---|---|
| Employment | 0.88 | 1.00 | 0.93 | 5 |
| NDA | 0.58 | 1.00 | 0.74 | 5 |
| Lease | 0.64 | 1.00 | 0.78 | 5 |
| Service | 0.80 | 0.57 | 0.67 | 5 |
| Loan | 0.80 | 0.89 | 0.84 | 5 |
| ToS | 0.78 | 1.00 | 0.88 | 5 |

*(Keyword-baseline by-category numbers are in `eval/predictions.json` — omitted here to match the headline table format; aggregate baseline numbers are above.)*

## False Positive Rate (clean contracts)

- LLM: 1/5 clean contracts had an `unfair_clause`-typed prediction that didn't match anything real (1 total — `missing_protection`-typed issues are excluded from this count, see below)
- Keyword baseline: 4/5 clean contracts flagged (8 total)
- Any false positives found: employment-05: "Undefined "cause" for termination"
- Separately (not counted above): the LLM raised 20 `missing_protection`-typed issues across the clean docs (noting standard clauses are absent) — expected behavior per the schema, not evidence of hallucination. See Methodology.

## Error Analysis

Concrete misses/errors, not just numbers:

1. **service-02 / service** — Missed clause: "including any pre-existing tools, libraries, and frameworks owned by Agency and incorporated into the deliverables, shall become the sole p…" (category: ip-overreach, severity: medium). Likely cause: clause likely used phrasing distant enough from the category label that it wasn't recognized as this specific issue type.
2. **service-02 / service** — Missed clause: "Any changes to project scope requested by Client shall be performed by Agency at no additional cost, regardless of the scope or time requir…" (category: unlimited-free-change-orders, severity: medium). Likely cause: clause likely used phrasing distant enough from the category label that it wasn't recognized as this specific issue type.
3. **service-03 / service** — Missed clause: "Either party may terminate with 30 days' written notice" (category: termination-notice, severity: low). Likely cause: clause likely used phrasing distant enough from the category label that it wasn't recognized as this specific issue type.
4. **employment-05 / employment** — False positive: flagged "Undefined "cause" for termination" (type: unfair_clause). Likely cause: model flagged an actively unfair clause (type: unfair_clause) as present on a contract with no injected traps — a genuine false positive worth reading in full in predictions.json.
5. **nda-01 / nda** — False positive: flagged "Obligations imposed only on Recipient" (type: unfair_clause). Likely cause: this prediction didn't match any ground-truth issue on this document — either a real miss in the dataset's labeling, or the model flagging something genuinely outside the injected traps.

## Methodology Notes & Limitations

- Ground truth labeled by a single reviewer (the author, with realism/calibration review from the project owner) — no inter-rater agreement check.
- Matching is category-or-text-overlap based (`eval/scoring.js`), not exact string match or human grading — a correct finding described in unexpected wording can be scored as a miss, and coincidental keyword overlap can be scored as a hit. Spot-check `eval/predictions.json` before citing exact numbers.
- "Likely cause" in the Error Analysis section is a heuristic best guess generated from available signals (severity, whether the entry was designed as a cross-clause trap, truncation), not a verified diagnosis.
- Synthetic/template-based contracts may not reflect the phrasing variance of real-world documents.
- Sample size (30) is small; category-level metrics (n=5) are noisy — treat as directional, not statistically robust.
- Model outputs are non-deterministic even at temperature 0.2; results may vary run to run.
- Each issue the LLM returns is typed `unfair_clause` or `missing_protection` (see `backend/README.md`). This dataset's ground truth issues are all "an unfair clause is present" traps, with no missing_protection-style entries — so `missing_protection`-typed predictions are **excluded from precision/recall scoring entirely** (they can never be true positives here by construction, and scoring them as ordinary false positives would unfairly penalize correct behavior the schema explicitly supports). They're tallied separately in the False Positive Rate section instead. An earlier version of this script scored them as false positives and it visibly wrecked precision (LLM precision measured ~0.29 instead of a number reflecting only unfair_clause predictions) — worth knowing if you're comparing against an older run.

## Reproducing

```bash
npm run eval
```

Regenerates this file from `eval/dataset.json` and `eval/predictions.json`. Requires a real `GROQ_API_KEY` in `.env` — hits the live API (~30 calls, paced to stay under free-tier rate limits, so it takes several minutes).
