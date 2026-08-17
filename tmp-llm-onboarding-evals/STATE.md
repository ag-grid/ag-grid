# LLM onboarding evals — state of play

Working notes for a one-off investigation, written so the work can be picked up cold. Everything
here is grounded in `runs/` (51 immutable run folders) and `results/report.md`, which is
regenerated from them by `runner/report.py` and never hand-edited.

---

## 1. The original question

Do coding agents produce broken or outdated AG Grid React code, particularly around things known
to be hard (module registration) or recently changed (cell selection, Theming API)? And the
sub-question: is *elapsed time* since an API change what matters, or the *volume of stale examples*
online — is two years long enough for a model to have learned the new way?

## 2. Answer: the stale-training-data hypothesis is dead (for Opus 5)

51 runs, 17 criteria, 3 runs each. **45/51 fully correct.**

- **Zero deprecated symbols in 51 apps.** No `enableRangeSelection`, `enableFillHandle`,
  `RangeSelectionModule`, `checkboxSelection`, `headerCheckboxSelection`, `groupSelectsChildren`,
  `frameworkComponents`, `reactUi`.
- **Zero legacy CSS themes.** Every app used the Theming API.
- **Every app registered modules correctly** (39 all-bundle, 12 mixed).
- The criteria predicted to be highest-risk on stale-example mass — theming (v33), cell range
  selection (v32.2), row selection checkboxes (v32.2), row grouping (v32.2/v33) — were clean 9/9 each.
- **0/51 consulted ag-grid.com.** All of this came from weights alone.

Two criteria failed consistently, and neither is about old APIs:

| Criterion | Result | Nature |
| --- | --- | --- |
| `column-sizing` | 0/3 clean | Three runs, three *different* wrong approaches |
| `cell-editing` | 0/3 clean | Later judged a bad check of mine — see §5 |

Other informational results: **1/51** called `enableDevValidations()` unprompted, so the grid's own
deprecation/conflict warnings are dark for essentially every AI-built app. 29/51 ran a build or
typecheck. Total cost $126.82 (implement $70.21, verify-code $11.26, verify-browser $45.35).

## 3. The finding that survived: `column-sizing`

Template ships `defaultColDef = { flex: 1 }`. Prompt asks for columns that fill the width *and* fit
their content. Three runs:

| Run | Approach | Outcome |
| --- | --- | --- |
| 01 | `autoSizeAllColumns()` to measure, then `flex: <pixel width>` + `minWidth` | CODE-3 fail |
| 02 | `autoSizeStrategy: { type: 'fitCellContents' }`, then `flex: <pixel width>` | `warning #318` |
| 03 | Fully imperative `sizeColumnsToFit()` + `autoSizeAllColumns()` on `onFirstDataRendered` and `onGridSizeChanged` | CODE-1 + CODE-3 fail |

Notes:

- Runs 01 and 02 both fed **pixel widths in as flex ratios** — independently. `flex` is unitless.
- `warning #318` (`colDef.flex` is not supported with `gridOptions.autoSizeStrategy`) is one of 14
  conflicts the grid declares in its validation rules.
- **`scaleUpToFitGridWidth`** on `SizeColumnsToContentStrategy`
  (`packages/ag-grid-community/src/interfaces/autoSize.ts`) does exactly what the prompt asks in one
  option. Run 03's transcript shows it *tried this and discarded it* before building its own system.
- Run 03's transcript shows ~30 of 63 turns spent driving Playwright, screenshotting at 900/1500/320px
  and reading the PNGs — it **iterated visually to a working-but-elaborate answer**, rather than
  choosing the architecture up front.

## 4. Current working hypothesis (Bernie's)

For any moderately complicated feature there is a combination of **how the app is already set up**
and **what the prompt asks** that leads an agent to do something an experienced AG Grid developer
never would. Features have *alternative* strategies that are mutually exclusive; being asked for one
when another is already configured implies **removing** the existing one. Agents don't reliably make
that inference.

Refinements:

- The grid's 14 declared conflicts are the *least* valuable traps, because dev validations surface
  them. The dangerous ones are the conflicts nothing warns about.
- The conflict table is also a bad map: `flex` conflicts with `autoSizeStrategy` but **not** with the
  `autoSizeAllColumns` API method. The real exclusivity rules live in developers' heads.
- Complication: run 03 *did* delete `flex` and still failed. So the mechanism is not only "adds
  without removing" — it's also failing to re-choose a strategy, and patching toward a
  visually-acceptable result instead.

Supporting evidence: `app-owned-data-editing` is the mirror image. A template that *declared* its
ownership model got 3/3 correct with `readOnlyEdit` + `onCellEditRequest`, where `cell-editing` —
same feature, same model, undeclared ownership — chose `onCellValueChanged` 3/3. **Setup determined
the outcome.**

## 5. Methodology lessons (important)

**Every spurious failure was an authoring error of mine; none were the verifier's.** Four for four:

1. `row-selection-checkboxes` — required `checkboxes: true`/`headerCheckbox: true` explicitly; both
   default to `true` for `mode: 'multiRow'` (`gridOptionsUtils.ts:381,389`).
2. `cell-range-selection` — demanded the sum of all selected cells when the prompt said "total revenue".
3. `app-owned-data-editing` — required the log to "name the record" when the template renders an id.
4. `cell-editing` CODE-3 — forbade mutating `params.data`, which is the documented `valueSetter`
   idiom (`value-setters/index.mdoc:29`) and is harmless here because the mutation is immediately
   superseded by an immutable `setRowData`. **This one was reported as a finding and should not be.**

The safeguard that worked was requiring **concrete evidence for every verdict** — in each case the
verifier quoted code or `outerHTML` precise enough to expose my error. Keep that.

**Browser verification found no functional defects.** 297 browser checks across 51 runs; one
non-pass, and it was the *console* check catching `warning #318`. Agents self-validate functionality
effectively. Decision: **stop verifying functionality; assume the agent implemented the task.**

## 6. Harness (current)

```
criteria/<name>/CRITERIA.md + template/
runs/<name>/<NN>/    app/ (incl. node_modules), meta.json, prompts,
                     *.transcript.jsonl, console.*, screenshots/,
                     result-code.json, result-browser.json
runner/              run.sh implement.sh verify-code.sh verify-browser.sh
                     serve.sh capture-console.mjs save-transcript.sh report.py run-round.sh
results/             report.md, results.csv, logs/
```

- `run.sh <criterion> <run>` — build in `/tmp/<uuid>/app`, **move** into `runs/`, verify code, verify browser.
- `run-round.sh <n> [conc]` — fans whole runs out, default 6 at a time.
- `serve.sh <criterion> <run> [port]` — run a harvested app; edits hot-reload.
- Isolation: implementing agents get `--setting-sources ""` (no `ag-*` skills) and
  `--strict-mcp-config` with no config (no MCP). Verified: 0 MCP refs, 0 skill refs in transcripts.
- Each run builds in an unrelated uuid dir. Previously all runs shared `/tmp/grid-eval`, and
  **71% of implementing agents (36/51) used Playwright** picked up from a stray
  `/private/tmp/node_modules` — one run even read a `drive.mjs` a sibling had left behind. Both
  removed. Agents installing their own Playwright is fine and expected.
- Full message transcripts are saved via `save-transcript.sh` (backfilled for existing runs, 152 files).
- `CRITERIA.md` has three sections: `# Prompt`, `# Code checks` (`CODE-n:`), `# Browser checks`
  (`BROWSER-n:`). Fixed numbered IDs so results aggregate across runs.
- Prompt given to the agent is the task text and nothing else — no preamble, no "make sure it builds".

## 7. Agreed plan: depth on column sizing

Chosen over breadth because the method is not yet validated, and authoring error is the main risk
(§5). Column sizing is the only feature where we have a known-correct reference
(`scaleUpToFitGridWidth`) to measure "too complicated" against.

1. Enumerate the sizing mechanisms and their exclusivity: `flex`, `width`, `min/maxWidth`, the three
   `autoSizeStrategy` types, `sizeColumnsToFit`, `autoSizeColumns`/`autoSizeAllColumns`,
   `scaleUpToFitGridWidth`, column state persistence, `onGridSizeChanged`.
2. Write the **minimal correct solution** for each starting state. Bernie to review — this is the
   reference everything is scored against.
3. Predict traps: starting state × instruction → expected wrong output.
4. Build a criterion per prediction, 3 runs each (~6–8 criteria, ~$60–80).

**New validator design** (replaces functional verification):

- Unit of judgement is the **diff against the template**, not the whole app.
- Supply **mechanical metrics** alongside: lines changed, files touched, new deps, grid event
  handlers wired, new `useState`/`useEffect`/`useRef`, presence of a measure-then-react loop.
- LLM answers a narrow question: *is there a materially simpler way using the grid's own
  configuration, and if so what is it?* — with the reference solution supplied where one exists.
- Output is **triage, not verdict**: flag suspicious runs for human review.
- Known blind spot, accepted: complexity scoring rewards an implementation that does nothing.

Then, only if depth validates the method: a thin breadth scan, one criterion and one run per
feature, to rank which features light up.

## 8. Possible deliverable

The per-feature brief (mechanisms, exclusivities, source-of-truth, persistence) is plausibly the
*remedy*, not just eval input. If agents fail because no single page explains the alternatives and
their exclusivity, that page is the fix — and it can be A/B tested by re-running failing criteria
with the brief available.

Related docs gaps already found:

- The `cell-editing` page has **no React state-ownership guidance at all**; its `## Two Way Binding`
  section is Vue-only (`v-model`). `readOnlyEdit` is documented on `value-setters`, `clipboard` and
  `cell-selection-fill-handle` — never on the editing page.
- `react-hooks` recommends `useMemo` for row data "if your application does not update rowData",
  which silently selects the grid-owned model, without noting that cell editing then writes into
  your objects.
- `readOnlyEdit` disables undo/redo (`undo-redo-edits/index.mdoc:67`) — a real cost to state up front.
