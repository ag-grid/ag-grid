# Conclusions: coding agents building new AG Grid React apps

Evidence base: 48 runs — 16 criteria × 3 runs — of Opus 5 building or extending a React app from a
feature-led prompt that never names an AG Grid API. Network access allowed, no licence key supplied,
no MCP tools, no AG Grid repo access. Full data in
[`tmp-llm-onboarding-evals/`](tmp-llm-onboarding-evals/), report at
[`results/report.md`](tmp-llm-onboarding-evals/results/report.md).

## 1. Agents almost never turn on the grid's own validation, so it cannot correct them

**1 of 48 runs called `enableDevValidations()`.** Because `AllCommunityModule` does not bundle
`ValidationModule`, validation is off unless explicitly opted into, which means AG Grid's deprecation
warnings, missing-module errors and incompatible-option warnings are silent in essentially every
AI-built app. This is not hypothetical: the grid detected a genuine conflict in one run and reported
it precisely — `warning #318 colDef.flex is not supported with gridOptions.autoSizeStrategy` — and
the agent never saw it, because it had not enabled validation and had no browser.

- The one run that did call it: [`runs/first-grid/01`](tmp-llm-onboarding-evals/runs/first-grid/01)
- The unseen warning: [`runs/column-sizing/02/console.json`](tmp-llm-onboarding-evals/runs/column-sizing/02/console.json)
- Opt-in requirement confirmed at `packages/ag-grid-community/src/validation/enableDevValidations.test.ts:36`

## 2. Column sizing and cell editing fail every time, and both are bread-and-butter tasks

**These are the only two criteria that failed, and each failed in 3 of 3 runs.** The other fourteen
were clean in all three.

**[`column-sizing`](tmp-llm-onboarding-evals/criteria/column-sizing/CRITERIA.md) — 0/3, with a
different wrong answer each run.** The agent has no settled model of how sizing is configured in
current AG Grid, rather than one stale habit it keeps repeating:

| Run | Approach taken | Failure |
| --- | --- | --- |
| [01](tmp-llm-onboarding-evals/runs/column-sizing/01) | `flex` plus imperative `api.autoSizeAllColumns()` from `onFirstDataRendered` | CODE-3 |
| [02](tmp-llm-onboarding-evals/runs/column-sizing/02) | `autoSizeStrategy` combined with `colDef.flex` — mutually incompatible | BROWSER-5, warning #318 |
| [03](tmp-llm-onboarding-evals/runs/column-sizing/03) | Fully imperative: `sizeColumnsToFit()`, `autoSizeAllColumns()`, manual `onGridSizeChanged` | CODE-1 and CODE-3 |

**[`cell-editing`](tmp-llm-onboarding-evals/criteria/cell-editing/CRITERIA.md) — 0/3, the same
failure each run.** Every run mixed the two documented editing models: it used `valueSetter` to
mutate `params.data` (the grid-owns-mutable-data model) while also treating React state as the source
of truth. `readOnlyEdit` with `onCellEditRequest` exists for exactly this situation and was not found
in any run.

- Example: [`runs/cell-editing/01/app/src/App.tsx:38`](tmp-llm-onboarding-evals/runs/cell-editing/01/app/src/App.tsx)
- Both models are documented at `documentation/ag-grid-docs/src/content/docs/value-setters/index.mdoc`
  — the mutable model at line 29, `Read Only Edit` at line 57. The agent found the first and missed
  the second.

Both failures are **incompatible combinations of current APIs**, not use of obsolete ones — a
category absent from the hypotheses we started with.

## 3. Stale training data is not the problem — no run used a deprecated or legacy API

**Zero deprecated symbols and zero legacy CSS themes across all 48 apps.** Not one instance of
`enableRangeSelection`, `enableFillHandle`, `RangeSelectionModule`, `checkboxSelection`,
`headerCheckboxSelection`, `groupSelectsChildren`, `frameworkComponents` or `reactUi`, and no
`ag-theme-*.css` import anywhere. Every run registered modules correctly.

This directly contradicts the premise the exercise was built to test. The criteria chosen for their
large volume of stale online examples were clean in 9 of 9 runs each:

- [`theming`](tmp-llm-onboarding-evals/criteria/theming/CRITERIA.md) — Theming API, changed v33; every
  run produced `themeQuartz`-based themes with parameters, none used CSS file themes
- [`cell-range-selection`](tmp-llm-onboarding-evals/criteria/cell-range-selection/CRITERIA.md) —
  `cellSelection`, renamed v32.2; every run used the current object form and `onCellSelectionChanged`
- [`row-selection-checkboxes`](tmp-llm-onboarding-evals/criteria/row-selection-checkboxes/CRITERIA.md)
  — `rowSelection` object, changed v32.2; no run used the deprecated colDef checkbox options
- [`row-grouping-totals`](tmp-llm-onboarding-evals/criteria/row-grouping-totals/CRITERIA.md) —
  `groupSelects`/`grandTotalRow`, changed v32.2 and v33; no run used the four deprecated group options

For Opus 5, two to three years is long enough for an API change to be learned, and the weight of
pre-change material online did not measurably corrupt the output. Notably **0 of 48 runs consulted
ag-grid.com** — this was achieved from model weights alone.

## Caveats

- One model only (Opus 5). This says nothing about other agents or older models.
- The catalogue spans v32–v33 changes. It therefore measures resistance to stale training data, not
  knowledge of changes made after the training cutoff, which is a different mechanism.
- Criteria are bread-and-butter tasks by design; niche features were deliberately excluded and may
  behave differently.
- Templates for the fourteen follow-on criteria already contained correct module registration and
  theming, so those two concerns were measured only by their own dedicated criteria.
