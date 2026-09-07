# Evaluation Results

Generated: 2026-09-07T18:33:12.541Z
Model: openai/gpt-oss-120b (Groq)
Fixtures: 22 total — 18 with hand-labeled trap clauses, 4 clean (no traps), spanning all 6 contract categories.

## Headline: trap-clause recall

| System | Traps detected | Traps total | Recall |
|---|---|---|---|
| LLM (openai/gpt-oss-120b) | 35 | 36 | **97.2%** |
| Keyword baseline | 17 | 36 | 47.2% |

## Precision / Recall / F1

Precision is issue-level: "of the issues/flags raised, how many corresponded to an actual labeled trap." Recall is the same trap-level number as the headline table above ("of the labeled traps, how many did we catch") — reused here to compute a combined F1, since precision and recall are necessarily different units (issues raised vs. traps caught) rather than two measurements of the same thing.

| System | Precision | Recall | F1 |
|---|---|---|---|
| LLM | 55.1% | 97.2% | 70.3% |
| Keyword baseline | 34.9% | 47.2% | 40.2% |

## False-positive rate (clean contracts)

4 clean contracts (no intentional trap clauses) were run through both systems.

| System | Docs with ≥1 flag | Total flags raised |
|---|---|---|
| LLM (all issues) | 4 / 4 | 21 |
| LLM (`unfair_clause` only) | 2 / 4 | 2 |
| Keyword baseline | 2 / 4 | 4 |

**`overall_risk` on clean contracts**: 1 low, 3 medium — this is the number that actually reaches the user first, so it's the real headline metric for whether the app alarms someone unnecessarily.

As of this run, every flag the LLM raised on clean contracts was typed `missing_protection` (19 total) rather than `unfair_clause` (2 total) — real gaps like "no overtime/exempt classification stated" or "undefined 'cause' for termination," not fabricated risky clauses. The schema now separates the two (`issue.type`), the app displays `missing_protection` issues with a neutral "Missing protection" label instead of a severity badge and excludes them from the High/Medium/Low counts, and the prompt instructs the model not to let missing-protection-only findings push `overall_risk` above "medium". The `overall_risk` distribution above is the number to watch on future runs to confirm that instruction is actually holding.

## Recall by category (traps detected / traps total)

| Category | Docs | LLM | Baseline |
|---|---|---|---|
| employment | 3 | 6/6 (100.0%) | 3/6 (50.0%) |
| lease | 3 | 6/6 (100.0%) | 1/6 (16.7%) |
| loan | 3 | 5/6 (83.3%) | 5/6 (83.3%) |
| nda | 3 | 6/6 (100.0%) | 2/6 (33.3%) |
| service | 3 | 6/6 (100.0%) | 3/6 (50.0%) |
| tos | 3 | 6/6 (100.0%) | 3/6 (50.0%) |

## Per-document detail

| Doc | Category | Clean? | Overall risk (LLM) | LLM traps | Baseline traps | LLM issues raised | Baseline flags raised |
|---|---|---|---|---|---|---|---|
| clean-employment-01 | employment | true | low | — | — | 5 | 2 |
| clean-nda-01 | nda | true | medium | — | — | 1 | 0 |
| clean-lease-01 | lease | true | medium | — | — | 7 | 0 |
| clean-service-01 | service | true | medium | — | — | 8 | 2 |
| employment-01 | employment | false | high | 2/2 | 1/2 | 6 | 6 |
| employment-02 | employment | false | high | 2/2 | 1/2 | 5 | 5 |
| employment-03 | employment | false | high | 2/2 | 1/2 | 4 | 5 |
| lease-01 | lease | false | high | 2/2 | 0/2 | 4 | 3 |
| lease-02 | lease | false | high | 2/2 | 0/2 | 4 | 1 |
| lease-03 | lease | false | high | 2/2 | 1/2 | 4 | 4 |
| loan-01 | loan | false | high | 2/2 | 2/2 | 4 | 2 |
| loan-02 | loan | false | high | 2/2 | 1/2 | 5 | 2 |
| loan-03 | loan | false | high | 1/2 | 2/2 | 3 | 2 |
| nda-01 | nda | false | high | 2/2 | 0/2 | 4 | 2 |
| nda-02 | nda | false | high | 2/2 | 2/2 | 7 | 3 |
| nda-03 | nda | false | high | 2/2 | 0/2 | 10 | 1 |
| service-01 | service | false | high | 2/2 | 1/2 | 10 | 4 |
| service-02 | service | false | high | 2/2 | 0/2 | 9 | 2 |
| service-03 | service | false | high | 2/2 | 2/2 | 4 | 7 |
| tos-01 | tos | false | high | 2/2 | 2/2 | 4 | 8 |
| tos-02 | tos | false | high | 2/2 | 0/2 | 7 | 1 |
| tos-03 | tos | false | high | 2/2 | 1/2 | 4 | 5 |

## Methodology & caveats

- **Detection = keyword match on the write-up, not the reader.** A trap counts as "detected" if any signal term for that trap appears in the LLM's issue text (category/title/description/recommendation). This is an automatable proxy, not a human grading rubric — the LLM could theoretically describe a real issue accurately using none of the chosen signal terms (false negative in this eval, not necessarily in reality), or use a signal term in an unrelated context (false positive in this eval). Spot-check `eval/results.json` before citing exact numbers.
- **Baseline is intentionally naive**: `eval/keywords.js` is a fixed, category-agnostic list of ~30 common "risky legal phrase" substrings, authored independently of the fixtures' signal terms. It will catch traps built around a recognizable trigger word (non-compete, arbitration, perpetual/irrevocable, cross-default...) and miss traps that are purely relational/contextual (e.g. shifting structural-repair liability onto a tenant, a mismatched amortization schedule creating a hidden balloon payment) — that gap is the point of comparing them.
- **Small sample.** 18 trap contracts / 36 labeled traps is enough to see a directional signal, not enough for tight confidence intervals. Treat category-level breakdowns as especially noisy (3 docs/category).
- **Fixtures are synthetic**, written to exercise the specific risk categories each contract-type prompt in `backend/src/routes/analyze.js` already claims to look for — this measures "does it do what it says," not performance on arbitrary real-world contracts.
