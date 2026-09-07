# Evaluation Results

Generated: 2026-09-06T20:25:48.126Z
Model: openai/gpt-oss-120b (Groq)
Fixtures: 22 total — 18 with hand-labeled trap clauses, 4 clean (no traps), spanning all 6 contract categories.

## Headline: trap-clause recall

| System | Traps detected | Traps total | Recall |
|---|---|---|---|
| LLM (openai/gpt-oss-120b) | 36 | 36 | **100.0%** |
| Keyword baseline | 17 | 36 | 47.2% |

## Precision / Recall / F1

Precision is issue-level: "of the issues/flags raised, how many corresponded to an actual labeled trap." Recall is the same trap-level number as the headline table above ("of the labeled traps, how many did we catch") — reused here to compute a combined F1, since precision and recall are necessarily different units (issues raised vs. traps caught) rather than two measurements of the same thing.

| System | Precision | Recall | F1 |
|---|---|---|---|
| LLM | 54.3% | 100.0% | 70.4% |
| Keyword baseline | 34.9% | 47.2% | 40.2% |

## False-positive rate (clean contracts)

4 clean contracts (no intentional trap clauses) were run through both systems.

| System | Docs with ≥1 flag | Total flags raised |
|---|---|---|
| LLM | 4 / 4 | 24 |
| Keyword baseline | 2 / 4 | 4 |

**What the LLM actually flags on clean contracts** (manually inspected in `eval/results.json`): not fabricated risky clauses, but real gaps — e.g. "no overtime/exempt classification stated," "missing benefits/equity provisions," "undefined 'cause' for termination." The system prompt explicitly asks for `missing_protections`, and a short contract will always be missing *something* relative to an exhaustive standard, so a nonzero flag count here is expected behavior, not hallucination. The practical risk is UX, not accuracy: the `overall_risk` field came back `"medium"` (occasionally `"high"`) on every clean contract in this set, which could read as alarming to a non-lawyer user looking at an otherwise fair contract. Consider whether "missing standard clause" issues should be visually distinct from "actively unfair clause" issues in the app, and whether `overall_risk` should weight the two differently.

## Recall by category (traps detected / traps total)

| Category | Docs | LLM | Baseline |
|---|---|---|---|
| employment | 3 | 6/6 (100.0%) | 3/6 (50.0%) |
| lease | 3 | 6/6 (100.0%) | 1/6 (16.7%) |
| loan | 3 | 6/6 (100.0%) | 5/6 (83.3%) |
| nda | 3 | 6/6 (100.0%) | 2/6 (33.3%) |
| service | 3 | 6/6 (100.0%) | 3/6 (50.0%) |
| tos | 3 | 6/6 (100.0%) | 3/6 (50.0%) |

## Per-document detail

| Doc | Category | Clean? | Overall risk (LLM) | LLM traps | Baseline traps | LLM issues raised | Baseline flags raised |
|---|---|---|---|---|---|---|---|
| clean-employment-01 | employment | true | medium | — | — | 5 | 2 |
| clean-nda-01 | nda | true | medium | — | — | 6 | 0 |
| clean-lease-01 | lease | true | medium | — | — | 5 | 0 |
| clean-service-01 | service | true | high | — | — | 8 | 2 |
| employment-01 | employment | false | high | 2/2 | 1/2 | 6 | 6 |
| employment-02 | employment | false | high | 2/2 | 1/2 | 6 | 5 |
| employment-03 | employment | false | high | 2/2 | 1/2 | 5 | 5 |
| lease-01 | lease | false | high | 2/2 | 0/2 | 5 | 3 |
| lease-02 | lease | false | high | 2/2 | 0/2 | 8 | 1 |
| lease-03 | lease | false | high | 2/2 | 1/2 | 6 | 4 |
| loan-01 | loan | false | high | 2/2 | 2/2 | 6 | 2 |
| loan-02 | loan | false | high | 2/2 | 1/2 | 6 | 2 |
| loan-03 | loan | false | high | 2/2 | 2/2 | 6 | 2 |
| nda-01 | nda | false | high | 2/2 | 0/2 | 8 | 2 |
| nda-02 | nda | false | high | 2/2 | 2/2 | 7 | 3 |
| nda-03 | nda | false | high | 2/2 | 0/2 | 10 | 1 |
| service-01 | service | false | high | 2/2 | 1/2 | 10 | 4 |
| service-02 | service | false | high | 2/2 | 0/2 | 8 | 2 |
| service-03 | service | false | high | 2/2 | 2/2 | 9 | 7 |
| tos-01 | tos | false | high | 2/2 | 2/2 | 7 | 8 |
| tos-02 | tos | false | high | 2/2 | 0/2 | 5 | 1 |
| tos-03 | tos | false | high | 2/2 | 1/2 | 9 | 5 |

## Methodology & caveats

- **Detection = keyword match on the write-up, not the reader.** A trap counts as "detected" if any signal term for that trap appears in the LLM's issue text (category/title/description/recommendation). This is an automatable proxy, not a human grading rubric — the LLM could theoretically describe a real issue accurately using none of the chosen signal terms (false negative in this eval, not necessarily in reality), or use a signal term in an unrelated context (false positive in this eval). Spot-check `eval/results.json` before citing exact numbers.
- **Baseline is intentionally naive**: `eval/keywords.js` is a fixed, category-agnostic list of ~30 common "risky legal phrase" substrings, authored independently of the fixtures' signal terms. It will catch traps built around a recognizable trigger word (non-compete, arbitration, perpetual/irrevocable, cross-default...) and miss traps that are purely relational/contextual (e.g. shifting structural-repair liability onto a tenant, a mismatched amortization schedule creating a hidden balloon payment) — that gap is the point of comparing them.
- **Small sample.** 18 trap contracts / 36 labeled traps is enough to see a directional signal, not enough for tight confidence intervals. Treat category-level breakdowns as especially noisy (3 docs/category).
- **Fixtures are synthetic**, written to exercise the specific risk categories each contract-type prompt in `backend/src/routes/analyze.js` already claims to look for — this measures "does it do what it says," not performance on arbitrary real-world contracts.
