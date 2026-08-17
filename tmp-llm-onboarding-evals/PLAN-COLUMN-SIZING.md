# Plan: the column-sizing priming experiment

## The claim under test

Two stages, same 15 criteria, same prompts, same model.

- **Stage 1 (cold).** An agent given only the app and the prompt picks the wrong mechanism, or the
  right one plus scaffolding it doesn't need. Expected to fail often — that is the finding.
- **Stage 2 (primed).** The same agent, given a brief describing the sizing mechanisms and how they
  relate, picks correctly. The delta between the stages is the result.

The brief is the deliverable-in-waiting: if priming works, the remedy is a documentation page.

**Execution authority.** Build the templates, run stage 1 run 1, check the failure rate and the
failure reasons, fix what is obviously fixable, then carry on through runs 2 and 3, the brief, stage
2 and the comparison — without checking in at each step. **One hard stop:** if run 1 does not produce
a decent number of failures, or the failures are not real, stop and report rather than spending the
remaining runs.

---

## 0. Repository structure

The 51 existing runs are a different experiment and should stay legible. Introduce a suite level
rather than archiving, so `report.py` and the runner stay shared and round 1 remains re-runnable.

```
tmp-llm-onboarding-evals/
  runner/                        shared scripts, gain a <suite> first argument
  suites/
    onboarding-v1/               criteria/ runs/ results/   ← existing 17 criteria, 51 runs, moved wholesale
    column-sizing/               criteria/ runs/ results/ templates/ BRIEF.md
  STATE.md
  COLUMN-SIZING.md
  PLAN-COLUMN-SIZING.md
```

A plain `git mv` plus a path variable in each runner script. `STATE.md` gets its paths updated.

---

## 1. The brief

`suites/column-sizing/BRIEF.md` starts from sections 1 and 2 of `COLUMN-SIZING.md` — the mechanism
inventory and the relationship rules — edited to read as documentation rather than as notes. It is
written after stage 1 (see §8).

**The brief is mutable.** This is exploratory: if a first version doesn't move the numbers, rewriting
it and re-running is the experiment, not a violation of it. There is no requirement to have it
finished before stage 1.

Two constraints that survive that. It stays generic — it describes mechanisms and their
exclusivities, never "for a grid configured with flex, do X", and it names no criterion. And each
stage 2 run records **which version of the brief it was given**, so a later comparison between brief
revisions is possible and so a result is never attributed to the wrong text. That is bookkeeping,
not a freeze.

Worth stating once and then leaving alone: a brief revised in response to observed failures is
measuring an upper bound — how well priming *can* work once you know the answers — rather than how
well a brief written blind would do. That is the right thing to measure first, and the distinction
just needs saying in the write-up.

---

## 2. Build and verify 15 templates

The bulk of the work. Each criterion needs its own starting application, and each must be proven to
render correctly with a clean console *before* an agent touches it — otherwise a warning found after
the run can't be attributed.

**Shared base.** One Vite + React + TS app: providers, theme, data loading, layout. Per criterion,
only `App.tsx` differs (occasionally one extra file, e.g. the persistence helper for 9 and 10).

**Data.** Real data files, no invented data, reusing round 1's datasets where they fit. Three shapes
are needed: a general table with a short numeric id and a date column (1–8, 14), one with a long
free-text field (13), and one that appends rows on a timer (11, 12).

**Template verification gate.** For each template: `npm run build` clean; load in Playwright; grid
renders the expected row and column count; **zero console output with `enableDevValidations()`
enabled**. Baseline warnings are disqualifying — several criteria are specifically about whether the
agent introduces `warning #318`, so the templates must start silent. Record content hashes as
`TEMPLATE-VERIFICATION.md` did for round 1.

**Shipped state.** Templates ship *without* `enableDevValidations()`, exactly as round 1 did, so
whether the agent enables it stays measurable. It is injected at verification time.

**Two premises to settle first,** by building the two apps and looking at them:
- **#12** assumes `fitCellContents` fires against an initial empty `rowData` array and is then never
  re-applied. If the strategy in fact runs when the real data lands, there is no bug and the
  criterion is void.
- **#15** assumes the "Autosize All Columns" menu action is reachable. If that needs an enterprise
  module the app doesn't have, the criterion changes or goes.

If either fails, drop it rather than contriving a replacement; 13 solid criteria beat 15 with two
inventions.

---

## 3. Stage 1 runs

Unchanged from round 1, which is the point — the harness is already validated. Copy the template to
`/tmp/<uuid>`, `npm install`, one-shot `claude -p` with the literal prompt and nothing else,
`--setting-sources ""` and `--strict-mcp-config` for isolation, then **move** the result into
`suites/column-sizing/runs/<criterion>/<NN>/`. Full transcript saved.

15 criteria × 3 runs = 45. Three runs is the minimum that distinguishes "this criterion always
fails" from "this criterion sometimes fails", which is the distinction that matters here.

**Gate: stop after run 1 of 3 and analyse.** Fifteen runs, then read every one by hand before
spending the other thirty. Two outcomes send us back to the criteria rather than forward:

- **Too few failures.** If the cold agent gets most of these right, the premise doesn't hold and the
  criteria are too easy — more runs of the same thing would only confirm that more precisely.
- **Failures for the wrong reason.** A run marked failed because the prompt admitted a reading I
  didn't anticipate, or because the template's premise didn't hold, or because the expected-result
  text was over-strict. Round 1 produced four of these and every one was mine, so this is the
  likelier of the two.

Only when run 1's failures are real and attributable do runs 2 and 3 execute.

---

## 4. Verification: diff-based, not functional

Round 1 established that functional verification finds nothing (297 browser checks, one non-pass,
and that one was the console). The question here is not "does it work" but "is this what a
competent AG Grid developer would have written".

**Mechanical, computed by script — no LLM:**

- `diff -ru template app`, excluding `node_modules` — the unit of judgement. The verifier also has
  read access to both trees, so it can open any file the diff only shows a fragment of. The diff is
  what it is asked about, not the limit of what it can see.
- Lines added/removed, files touched, dependencies added.
- Counts of new `useState` / `useEffect` / `useRef` / `useMemo`.
- Grid event handlers added, by name.
- Which sizing mechanisms are present in the final app: `flex`, `initialFlex`, `width`,
  `initialWidth`, `min`/`maxWidth`, `autoSizeStrategy` and its type and options, each sizing API
  method, `getColumnState`/`applyColumnState`/`resetColumnState`, `initialState`.
- Red-flag API presence: `ResizeObserver`, `window.addEventListener('resize')`, `measureText`,
  `getBoundingClientRect`, `offsetWidth`, `setInterval`/`setTimeout` where the template had none.
- Console capture from a headless load with dev validations injected. Deterministic, cheap, catches
  `warning #318` without an agent. Kept for exactly that reason — not as evidence the app works.

**LLM, given the diff, the metrics, and bullet 3's expected-result text:**

```json
{ "criterion": "...", "run": 1,
  "usedExpectedApproach": "yes|no", "approachEvidence": "...",
  "isMinimal": "yes|no",            "minimalEvidence": "..." }
```

Two judgements, both requiring quoted evidence from the diff. Nothing else — no scores, no
categories, no verdict field hiding a taxonomy. Output is triage: every `no` gets read by hand
before it becomes a finding, because §5 of `STATE.md` says every spurious failure so far was an
authoring error of mine, not the verifier's.

Known blind spot, accepted as in round 1: minimality rewards a change that does nothing. The
`usedExpectedApproach` judgement is what guards against it.

---

## 5. Stage 2 runs

Identical, except the brief is appended to the prompt under a "Reference documentation" heading —
**decided**. This isolates the variable: dropping the brief in the repo as a file would be more
realistic but confounds "did the brief help" with "did the agent open it".

Same 45 runs, same verifier, same expected-result text. Each run records the brief version it was
given.

If the effect is large, a repo-file variant on a subset is the obvious follow-up, since a docs page
is the plausible deliverable and nobody pastes documentation into their prompt.

---

## 6. Reporting

`report.py` grows a suite argument and emits, per criterion, stage 1 vs stage 2 as
`usedExpectedApproach` counts out of 3, plus the mechanical metrics side by side. The headline is a
single comparison across 45 + 45 runs.

**Stated honestly up front:** 3 runs per cell detects large effects, not small ones. A criterion
going 0/3 → 3/3 is real; 1/3 → 2/3 is noise. Criteria that pass 3/3 cold carry no information about
priming and should be reported as such rather than diluting the average.

---

## 7. Cost

From round 1's actuals ($1.38 per implement run, $0.22 per code verification):

| | |
| --- | --- |
| Stage 1 implement, 45 runs | ~$62 |
| Stage 2 implement, 45 runs | ~$70 (longer prompt) |
| Verification, 90 runs | ~$20 |
| Template construction | ~$10 |
| **Total** | **~$160** |

Disk: ~90 `node_modules` trees, ~9 GB, cleared periodically.

---

## 8. Order of work

1. Restructure into suites; move round 1; update `STATE.md` paths.
2. Build the shared base and the 15 `App.tsx` variants; settle the #12 and #15 premises.
3. Verify every template in a browser; record content hashes.
4. Build the diff verifier and the metrics script.
5. **Stage 1, run 1 only — 15 runs.**
6. **Gate.** Read all 15 by hand. Fix criteria, prompts, expected text or templates as needed, and
   re-run any criterion that was changed. Do not proceed on a set that is failing for the wrong
   reasons or barely failing at all.
7. Stage 1, runs 2 and 3 — 30 runs.
8. Write `BRIEF.md`.
9. Stage 2, 45 runs.
10. Report.

Steps 1–4 produce nothing spendable and are where the authoring risk lives. Step 6 is the gate that
stopped round 1 from publishing four false findings, moved earlier so it costs 15 runs to discover a
bad criterion rather than 45.

`BRIEF.md` is written at step 8 rather than up front — with stage 1 complete, it can be written
against the mechanisms the runs actually got wrong, which is the point of exploratory mode.

---

## 9. Decisions

Settled, recorded so they don't get relitigated:

- **Priming delivery** — appended to the prompt. A repo-file variant is a follow-up, not part of the
  headline.
- **Runs per criterion** — three, gated after the first.
- **Template review** — not required before the runs.
- **Brief timing** — not frozen, not written up front; versioned per run.
