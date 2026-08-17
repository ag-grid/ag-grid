# Mega Awesome Column Sizing Auto Discovery Results

Data regenerated from run folders by `runner/cs-report.py`. Do not hand-edit this file —
edit `ANALYSIS.md` for the narrative, which is spliced in below, or the run folders for the data.

## What this measured

Thirteen column-sizing tasks, each a single realistic request against a working React app whose
starting state was verified in a browser. Every task was run three times cold (prompt only) and
three times primed (prompt plus a 103-line reference brief on the sizing mechanisms and how they
relate). Same model, same isolation, same templates. 78 runs.

The prompts name no API and no feature. The four bug-report criteria state a symptom; the rest
state a goal. Nothing was verified functionally — an earlier round of this investigation
established that these agents produce working software — so the only questions asked were *did it
use the mechanism the grid provides* and *is this close to the smallest change that does it*.

Every recorded failure was then read by hand. Where the implementation turned out to be reasonable
and the criterion was at fault, the criterion was rewritten and the affected runs redone. Three
criteria were corrected this way; the numbers below are after that audit.

## The headline

| | cold | primed |
| --- | --- | --- |
| Correct approach | 31/39 | **39/39** |
| Minimal | 27/39 | **36/39** |
| Both | 27/39 | **36/39** |

**Priming eliminated wrong-mechanism failures entirely.** No criterion did worse primed than cold.

The cold failures were concentrated, not spread:

- **01** 0/3. All three hand-wrote content measurement — 131, 110 and 153-line modules using canvas
  `measureText` or cloned DOM nodes, scraping fonts, padding and borders off the rendered grid.
  Primed: 3/3, one of them a +3/-3 line diff.
- **13** 0/3. All three discarded `fitGridWidth` and rebuilt it from `flex: 1` plus a
  `fitCellContents` strategy scoped to the exempt column — a combination the grid rejects with
  `warning #318`, so it did not work. `suppressSizeToFit` appeared in none of them. Primed: 3/3.
- **02** 2/3, the third being the same hand-rolled measurement module.
- **09** 2/3, the failure being `flex: widths[field]` — stored pixel values used as flex ratios.

Seven criteria were 3/3 in both stages and carry no information about priming.

## The failure mode is not ignorance

Every cold failure on 01, 02 and 11 named the built-in mechanism and rejected it. The stated reason
was always the same and always true: content fitting measures only the rendered rows, so a value in
an off-screen row can be truncated. No prompt asked about off-screen rows.

The same pattern drives what is left after priming. All nine remaining primed-and-cold minimality
failures are the correct mechanism wrapped in machinery that re-derives what the grid already
computes: a grow-only width ratchet around `autoSizeAllColumns` (11, three runs), a hand-rolled
available-width guard before `sizeColumnsToFit` (09), a per-column limit table rebuilt from
`getActualWidth()` (09, two runs), a redundant `autoSizeStrategy` on top of an existing fit (09),
and a magic-number `width` alongside a correct `suppressSizeToFit` (13).

These agents know the API. What they lack is a sense of when the built-in is the answer and the
edge case is not worth defending against. That is a judgement gap, not a knowledge gap, and it is
why "is this minimal" turned out to be the more discriminating question — priming fixed approach
completely and left a third of the minimality failures standing.

## What the audit found

Six of the twenty originally-recorded failures were errors in the criteria, not in the code. All
three were mine, and all three are the same mistake: encoding one implementation as *the* answer
instead of describing the required outcome.

- **10** — three runs called `applyColumnState` with state mapped from `columnDefs`. My expected
  text banned "a hand-built list of default widths", but these derive from the single source of
  truth, reset only `width` (which is what the prompt asked, where `resetColumnState` also restores
  order, sort and pinning), and need no `localStorage` clearing because applying state fires a
  resize that `onStateUpdated` persists. Criterion rewritten to accept both routes; now 3/3 and 3/3.
- **09** — two primed runs migrated to grid-owned state. The prompt asked that widths "still be
  there after a reload", which describes behaviour, not ownership, and they preserved the behaviour.
  The prompt now says explicitly to carry on keeping the widths in the application's own store.
- **13** — one primed run used `suppressSizeToFit: true` *and* a hardcoded `width: 130`. The
  mechanism is right; the magic number is a minimality problem. Rescored accordingly.

Across the whole investigation that is eight authoring errors and zero verifier errors. The
verifier has been faithful to the expected text every time, which keeps pointing at the text as the
weak link rather than the judge. Requiring quoted file-and-line evidence for every verdict is what
made each of these findable.

## Other observations

- **0/78 runs called `enableDevValidations()`.** All three cold runs of criterion 13 shipped a
  configuration the grid explicitly rejects, and the warning saying so was switched off. The only
  mechanically-detected defect in the experiment was invisible to the agent that caused it.
- **0/78 consulted ag-grid.com.** Everything came from model weights or the supplied brief.
- Hand-rolled measurement APIs — canvas, `measureText`, `getBoundingClientRect`, `offsetWidth` —
  appear only in cold runs. Priming eliminated them.

## What this does not show

Three runs per cell detects large effects, not small ones. The 0/3 → 3/3 movements on 01 and 13 are
unambiguous; single-run differences are not, and are reported here only where the mechanism was
identifiable in the diff.

The brief was written after seeing the cold failures. A goal-to-mechanism lookup table was cut from
it before the primed runs, along with a sentence that directly forbade hand-rolled measurement,
specifically so the result could not be attributed to an answer key — but the remaining text is
still informed by knowing where agents go wrong. This measures how well a well-targeted page can
work, not how well a page written blind would do.

One section of the brief is also known to be wrong as written. "Widths are grid state, not
application state" is not accurate: updating column definitions resets the grid's state to the
definitions' values, so an application chooses between setting the definitions once and letting the
grid own the state, or updating them and taking responsibility for supplying correct values on
every update. That framing also explains the React re-render behaviour and `initialFlex` as one
fact rather than three rules. The primed runs used the inaccurate wording.

---

`approach` = used the mechanism a competent AG Grid developer would have used, per the
criterion's expected-result text. `minimal` = close to the smallest change that does it.
Both come from an LLM judging the diff with evidence; everything else is a grep.

## Headline

- **primed** (39 runs): correct approach **39/39**, minimal **36/39**, both **36/39**
- **cold** (39 runs): correct approach **31/39**, minimal **27/39**, both **27/39**

## Per criterion

| Criterion | primed approach | cold approach |
| --- | --- | --- |
| 01-flex-to-fit-content | 3/3 | 0/3 |
| 02-flex-to-fit-content-and-fill | 3/3 | 2/3 |
| 03-fit-grid-to-fit-content | 3/3 | 3/3 |
| 04-imperative-to-reactive | 3/3 | 3/3 |
| 05-default-to-fill-container | 3/3 | 3/3 |
| 06-flex-with-pinned-column | 3/3 | 3/3 |
| 07-widths-lost-on-rerender | 3/3 | 3/3 |
| 08-persist-user-resizes | 3/3 | 3/3 |
| 09-app-owned-widths-fill-gap | 3/3 | 2/3 |
| 10-reset-to-defaults | 3/3 | 3/3 |
| 11-strategy-with-changing-data | 3/3 | 3/3 |
| 12-constrain-existing-strategy | 3/3 | 3/3 |
| 13-fit-grid-with-exception | 3/3 | 0/3 |

## Every run

| Criterion | Run | Stage | Approach | Minimal | +/- lines | Added | Removed | Red flags | AG warnings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01-flex-to-fit-content | 01 | cold | no | no | +152/-5 | — | flex | canvas, measureText, offsetWidth | — |
| 01-flex-to-fit-content | 02 | cold | no | no | +124/-5 | — | flex | getBoundingClientRect | — |
| 01-flex-to-fit-content | 03 | cold | no | no | +170/-5 | — | flex | canvas, getBoundingClientRect, measureText | — |
| 01-flex-to-fit-content | 51 | primed | yes | yes | +3/-3 | autoSizeStrategy, fitCellContents | flex | — | — |
| 01-flex-to-fit-content | 52 | primed | yes | yes | +3/-3 | autoSizeStrategy, fitCellContents | flex | — | — |
| 01-flex-to-fit-content | 53 | primed | yes | yes | +6/-3 | autoSizeStrategy, fitCellContents | flex | — | — |
| 02-flex-to-fit-content-and-fill | 01 | cold | yes | yes | +15/-3 | autoSizeStrategy, fitCellContents, scaleUpToFitGridWidth | flex | — | — |
| 02-flex-to-fit-content-and-fill | 02 | cold | no | no | +141/-5 | — | flex | canvas, measureText | — |
| 02-flex-to-fit-content-and-fill | 03 | cold | yes | yes | +8/-3 | autoSizeStrategy, fitCellContents, scaleUpToFitGridWidth | flex | — | — |
| 02-flex-to-fit-content-and-fill | 51 | primed | yes | yes | +6/-3 | autoSizeStrategy, fitCellContents, scaleUpToFitGridWidth | flex | — | — |
| 02-flex-to-fit-content-and-fill | 52 | primed | yes | yes | +9/-4 | autoSizeStrategy, fitCellContents, scaleUpToFitGridWidth | flex | — | — |
| 02-flex-to-fit-content-and-fill | 53 | primed | yes | yes | +8/-3 | autoSizeStrategy, fitCellContents, scaleUpToFitGridWidth | flex | — | — |
| 03-fit-grid-to-fit-content | 01 | cold | yes | yes | +2/-5 | fitCellContents | defaultMinWidth, fitGridWidth | — | — |
| 03-fit-grid-to-fit-content | 02 | cold | yes | yes | +2/-5 | fitCellContents | defaultMinWidth, fitGridWidth | — | — |
| 03-fit-grid-to-fit-content | 03 | cold | yes | yes | +2/-5 | fitCellContents | defaultMinWidth, fitGridWidth | — | — |
| 03-fit-grid-to-fit-content | 51 | primed | yes | yes | +3/-3 | fitCellContents | defaultMinWidth, fitGridWidth | — | — |
| 03-fit-grid-to-fit-content | 52 | primed | yes | yes | +2/-5 | fitCellContents | defaultMinWidth, fitGridWidth | — | — |
| 03-fit-grid-to-fit-content | 53 | primed | yes | yes | +3/-3 | fitCellContents | defaultMinWidth, fitGridWidth | — | — |
| 04-imperative-to-reactive | 01 | cold | yes | yes | +10/-6 | flex, minWidth | sizeColumnsToFit | — | — |
| 04-imperative-to-reactive | 02 | cold | yes | yes | +4/-6 | flex | sizeColumnsToFit | — | — |
| 04-imperative-to-reactive | 03 | cold | yes | yes | +10/-6 | flex, minWidth | sizeColumnsToFit | — | — |
| 04-imperative-to-reactive | 51 | primed | yes | yes | +4/-6 | flex, minWidth | sizeColumnsToFit | — | — |
| 04-imperative-to-reactive | 52 | primed | yes | yes | +10/-6 | flex, minWidth | sizeColumnsToFit | — | — |
| 04-imperative-to-reactive | 53 | primed | yes | yes | +5/-7 | flex | sizeColumnsToFit | — | — |
| 05-default-to-fill-container | 01 | cold | yes | yes | +7/-1 | flex | — | — | — |
| 05-default-to-fill-container | 02 | cold | yes | yes | +7/-1 | flex | — | — | — |
| 05-default-to-fill-container | 03 | cold | yes | yes | +7/-1 | flex | — | — | — |
| 05-default-to-fill-container | 51 | primed | yes | yes | +3/-1 | flex, minWidth | — | — | — |
| 05-default-to-fill-container | 52 | primed | yes | yes | +3/-1 | flex, minWidth | — | — | — |
| 05-default-to-fill-container | 53 | primed | yes | yes | +7/-1 | flex, minWidth | — | — | — |
| 06-flex-with-pinned-column | 01 | cold | yes | yes | +1/-1 | maxWidth, minWidth | — | — | — |
| 06-flex-with-pinned-column | 02 | cold | yes | yes | +1/-1 | maxWidth, minWidth | — | — | — |
| 06-flex-with-pinned-column | 03 | cold | yes | yes | +1/-1 | maxWidth, minWidth | — | — | — |
| 06-flex-with-pinned-column | 51 | primed | yes | yes | +1/-1 | — | — | — | — |
| 06-flex-with-pinned-column | 52 | primed | yes | yes | +2/-1 | — | — | — | — |
| 06-flex-with-pinned-column | 53 | primed | yes | yes | +1/-1 | maxWidth, minWidth | — | — | — |
| 07-widths-lost-on-rerender | 01 | cold | yes | yes | +18/-10 | — | — | — | — |
| 07-widths-lost-on-rerender | 02 | cold | yes | yes | +22/-11 | — | — | — | — |
| 07-widths-lost-on-rerender | 03 | cold | yes | yes | +19/-11 | — | — | — | — |
| 07-widths-lost-on-rerender | 51 | primed | yes | yes | +18/-11 | initialFlex | — | — | — |
| 07-widths-lost-on-rerender | 52 | primed | yes | yes | +19/-10 | — | — | — | — |
| 07-widths-lost-on-rerender | 53 | primed | yes | yes | +15/-10 | initialFlex | — | — | — |
| 08-persist-user-resizes | 01 | cold | yes | yes | +41/-3 | initialState, onStateUpdated | — | — | — |
| 08-persist-user-resizes | 02 | cold | yes | yes | +89/-3 | applyColumnState, getColumnState | — | — | — |
| 08-persist-user-resizes | 03 | cold | yes | yes | +62/-3 | initialState, onStateUpdated | — | — | — |
| 08-persist-user-resizes | 51 | primed | yes | yes | +35/-3 | initialState, onStateUpdated | — | — | — |
| 08-persist-user-resizes | 52 | primed | yes | yes | +57/-4 | initialFlex, initialState, onStateUpdated | flex | — | — |
| 08-persist-user-resizes | 53 | primed | yes | yes | +47/-4 | initialFlex, initialState, onStateUpdated | flex | — | — |
| 09-app-owned-widths-fill-gap | 01 | cold | yes | no | +39/-2 | getColumnState, sizeColumnsToFit | — | — | — |
| 09-app-owned-widths-fill-gap | 02 | cold | no | no | +18/-2 | autoSizeStrategy, fitGridWidth, sizeColumnsToFit | — | — | — |
| 09-app-owned-widths-fill-gap | 03 | cold | yes | no | +20/-2 | columnLimits, minWidth, sizeColumnsToFit | — | — | — |
| 09-app-owned-widths-fill-gap | 51 | primed | yes | yes | +34/-13 | sizeColumnsToFit | — | — | — |
| 09-app-owned-widths-fill-gap | 52 | primed | yes | no | +44/-5 | columnLimits, minWidth, sizeColumnsToFit | — | — | — |
| 09-app-owned-widths-fill-gap | 53 | primed | yes | yes | +32/-8 | getColumnState, sizeColumnsToFit | — | — | — |
| 10-reset-to-defaults | 01 | cold | yes | yes | +11/-2 | resetColumnState | — | — | — |
| 10-reset-to-defaults | 02 | cold | yes | yes | +13/-2 | resetColumnState | — | — | — |
| 10-reset-to-defaults | 03 | cold | yes | yes | +19/-2 | resetColumnState | — | — | — |
| 10-reset-to-defaults | 51 | primed | yes | yes | +23/-3 | applyColumnState | — | — | — |
| 10-reset-to-defaults | 52 | primed | yes | yes | +19/-2 | applyColumnState | — | — | — |
| 10-reset-to-defaults | 53 | primed | yes | yes | +19/-2 | applyColumnState | — | — | — |
| 11-strategy-with-changing-data | 01 | cold | yes | no | +25/-3 | applyColumnState, autoSizeAllColumns, getColumnState | — | — | — |
| 11-strategy-with-changing-data | 02 | cold | yes | no | +32/-3 | autoSizeAllColumns, columnLimits, minWidth | — | — | — |
| 11-strategy-with-changing-data | 03 | cold | yes | yes | +22/-3 | autoSizeAllColumns, columnLimits, minWidth | — | — | — |
| 11-strategy-with-changing-data | 51 | primed | yes | yes | +14/-3 | autoSizeAllColumns | — | — | — |
| 11-strategy-with-changing-data | 52 | primed | yes | yes | +14/-3 | autoSizeAllColumns | — | — | — |
| 11-strategy-with-changing-data | 53 | primed | yes | no | +34/-3 | applyColumnState, autoSizeAllColumns, getColumnState | — | — | — |
| 12-constrain-existing-strategy | 01 | cold | yes | yes | +1/-1 | maxWidth | — | — | — |
| 12-constrain-existing-strategy | 02 | cold | yes | yes | +1/-1 | maxWidth | — | — | — |
| 12-constrain-existing-strategy | 03 | cold | yes | yes | +1/-1 | maxWidth | — | — | — |
| 12-constrain-existing-strategy | 51 | primed | yes | yes | +1/-1 | maxWidth | — | — | — |
| 12-constrain-existing-strategy | 52 | primed | yes | yes | +1/-1 | maxWidth | — | — | — |
| 12-constrain-existing-strategy | 53 | primed | yes | yes | +1/-1 | maxWidth | — | — | — |
| 13-fit-grid-with-exception | 01 | cold | no | no | +12/-8 | fitCellContents, flex | fitGridWidth | — | #318 |
| 13-fit-grid-with-exception | 02 | cold | no | no | +15/-4 | fitCellContents, flex | fitGridWidth | — | #318 |
| 13-fit-grid-with-exception | 03 | cold | no | no | +17/-4 | fitCellContents, flex | fitGridWidth | — | #318 |
| 13-fit-grid-with-exception | 51 | primed | yes | yes | +1/-1 | suppressSizeToFit | — | — | — |
| 13-fit-grid-with-exception | 52 | primed | yes | yes | +1/-1 | suppressSizeToFit | — | — | — |
| 13-fit-grid-with-exception | 53 | primed | yes | no | +1/-1 | suppressSizeToFit | — | — | — |

## Runs that did not use the expected approach

### 01-flex-to-fit-content run 01 (cold)

They removed `flex` but, instead of using AG Grid's fitCellContents auto-sizing, wrote a 131-line module that scrapes fonts/padding from the rendered grid DOM, measures every cell's text with canvas `measureText`, and applies the resulting pixel widths via `api.setColumnWidths` from `onFirstDataRendered`.

> They removed `flex` (src/App.tsx:29 `const defaultColDef = useMemo<ColDef>(() => ({ resizable: true }), []);`) but did NOT use `autoSizeStrategy: { type: 'fitCellContents' }` or `api.autoSizeAllColumns()` — the metrics confirm autoSizeStrategy/fitCellContents/autoSizeAllColumns are all false after. Instead they hand-rolled canvas text measurement, which the expected text explicitly calls wrong: src/columnWidths.ts:124-131 `function textWidth(text: string, font: string): number { context ??= document.createElement('canvas').getContext('2d'); ... return context.measureText(text).width; }`, src/columnWidths.ts:98 `extra += (sibling as HTMLElement).offsetWidth;`, and the computed pixel widths are assigned as widths at src/columnWidths.ts:42-44 `api.setColumnWidths(columns.map((column) => ({ key: column, newWidth: Math.ceil(widest.get(column.getColId())!) })));`. The measureText/offsetWidth measurement plus pixel-width assignment is what decided it. Their own comment at src/columnWidths.ts:6-9 shows they consciously rejected `autoSizeStrategy`/`autoSizeAllColumns` in favour of the manual approach.

### 01-flex-to-fit-content run 02 (cold)

They removed `flex: 1` but, instead of using autoSizeStrategy fitCellContents or autoSizeAllColumns, they wrote a 110-line sizeColumnsToContent module that clones header/cell DOM elements, measures them with getBoundingClientRect and pushes computed pixel widths via api.setColumnWidths from onFirstDataRendered.

> They removed flex correctly (src/App.tsx:28 replaces `const defaultColDef = useMemo<ColDef>(() => ({ flex: 1 }), []);` with a comment, and no defaultColDef is passed at src/App.tsx:36-40), but they used neither of the two permitted mechanisms: `autoSizeStrategy: { type: 'fitCellContents' }` appears nowhere, and `api.autoSizeAllColumns()` is never called. Instead onFirstDataRendered (src/App.tsx:29-31) calls a hand-written measurer, src/sizeColumnsToContent.ts, which does exactly what the expected text names as wrong: it measures DOM text and assigns pixel widths. src/sizeColumnsToContent.ts:65 `const width = eMeasure.getBoundingClientRect().width;`, src/sizeColumnsToContent.ts:69 `return Math.ceil(width);`, and src/sizeColumnsToContent.ts:42 `api.setColumnWidths(widths);` (widths built as `{ key: colId, newWidth: width }` at line 38). The getBoundingClientRect measurement plus computed pixel widths pushed into setColumnWidths is what decided this. The file's own comment at src/sizeColumnsToContent.ts:13-15 shows they knew about `autoSizeStrategy: 'fitCellContents'` and deliberately replaced it.

### 01-flex-to-fit-content run 03 (cold)

They removed the flex defaultColDef but, instead of using autoSizeStrategy 'fitCellContents' or autoSizeAllColumns, wrote a 153-line custom sizer that clones cells, measures text with canvas measureText plus getBoundingClientRect over every row value, and pushes the computed pixel widths through api.setColumnWidths from onFirstDataRendered.

> They removed flex (App.tsx:42 comment '/* No defaultColDef flex: ... */', defaultColDef gone) but did NOT use either permitted mechanism: no autoSizeStrategy: { type: 'fitCellContents' } and no api.autoSizeAllColumns(). Instead they hand-rolled text measurement in a new 153-line file, explicitly dismissing the built-in in a comment at src/sizeColumnsToData.ts:16-18 ("The grid's own `autoSizeAllColumns()` / `autoSizeStrategy: 'fitCellContents'` only measures the cells currently rendered in the DOM ... This measures every row's value against a hidden clone of a real cell"). The expected text names exactly this as wrong: src/sizeColumnsToData.ts:144 `approxWidth: (text) => canvas.measureText(text).width`, src/sizeColumnsToData.ts:149 `return container.getBoundingClientRect().width`, and the computed pixel widths assigned as widths at src/sizeColumnsToData.ts:50-52 (`const width = Math.ceil(Math.max(widestValueWidth(...), headerWidth)); ... newWidths.push({ key: colId, newWidth: width })`) applied via src/sizeColumnsToData.ts:59 `api.setColumnWidths(newWidths)`. Removing flex alone does not make this the expected approach; the measureText/getBoundingClientRect measurement and manual pixel width assignment decided it.

### 02-flex-to-fit-content-and-fill run 02 (cold)

They removed `flex: 1` and, instead of using `autoSizeStrategy: { type: 'fitCellContents', scaleUpToFitGridWidth: true }`, wrote a 101-line canvas `measureText` module that measures every cell, scales the measured widths up to the grid width by hand via `api.setColumnWidths`, and drives it from `onFirstDataRendered`/`onGridSizeChanged` with a `visibility: hidden` flash guard.

> No `autoSizeStrategy` anywhere: src/App.tsx:56-66 passes only `rowData`, `columnDefs`, `onFirstDataRendered` and `onGridSizeChanged` to `<AgGridReact>`; `fitCellContents`/`scaleUpToFitGridWidth` appear in neither file (the only mention is a comment dismissing it, src/columnSizing.ts:27-29 "The grid's own `fitCellContents` autosize ... We measure every value with canvas text metrics instead."). They removed `flex` (template `const defaultColDef = useMemo<ColDef>(() => ({ flex: 1 }), [])` is gone) but replaced it with exactly what the expected text calls wrong: a hand-rolled measure-then-scale loop in application code. src/columnSizing.ts:34-70 `measureContentWidths` builds a canvas 2d context (src/columnSizing.ts:8-11), copies cell/header fonts and padding out of computed styles (src/columnSizing.ts:45-48, 14-22), and calls `ctx.measureText(value).width + cellChrome` per cell (src/columnSizing.ts:62); src/columnSizing.ts:77-101 `applyContentWidths` then computes `const scale = available > total ? available / total : 1` (src/columnSizing.ts:87) and pushes computed pixel widths via `api.setColumnWidths(sized)` (src/columnSizing.ts:100). That is the measure-then-scale loop, not the single `autoSizeStrategy: { type: 'fitCellContents', scaleUpToFitGridWidth: true }` option.

### 09-app-owned-widths-fill-gap run 02 (cold)

They kept the app-owned widths store and its onColumnResized write-back and closed the gap with `api.sizeColumnsToFit()` from a new `onGridSizeChanged` handler, but also added the explicitly ruled-out `autoSizeStrategy: { type: 'fitGridWidth' }` to do the startup fill.

> They did keep the app store intact and did reach for the grid's own fit -- src/App.tsx:62-64 `const onGridSizeChanged = useCallback((event: GridSizeChangedEvent<Employee>) => { event.api.sizeColumnsToFit(); }, []);` with the untouched `onColumnResized` write-back at src/App.tsx:46-58 and `width: widths[field]` still driving the coldefs at src/App.tsx:42. But they additionally added the mechanism the expected text names as wrong: src/App.tsx:26 `const AUTO_SIZE_STRATEGY: AutoSizeStrategy = { type: 'fitGridWidth' };` wired in at src/App.tsx:72 `autoSizeStrategy={AUTO_SIZE_STRATEGY}`. The expected text rules out `autoSizeStrategy`, 'which sizes the columns without the store ever learning the resulting widths', so that addition is what decided this as 'no'. Their own comment at src/App.tsx:24-25 confirms it is there to do the initial fill, i.e. the startup fill is performed by the ruled-out mechanism rather than by the fit whose result flows through the store.

### 13-fit-grid-with-exception run 01 (cold)

They deleted the `fitGridWidth` autoSizeStrategy, put `flex: 1` on all six non-date columns and scoped a `fitCellContents` strategy to `startDate`, instead of simply adding `suppressSizeToFit: true` to the date column — a combination AG Grid rejects with warning #318.

> They never used `suppressSizeToFit` (metrics confirm suppressSizeToFit before:false / after:false) and they deleted the working `fitGridWidth` strategy. src/App.tsx:15-21 puts `flex: 1` on every column except startDate ({ field: 'id', flex: 1 } ... { field: 'startDate' } ... { field: 'salary', flex: 1 }), and src/App.tsx:27-30 replaces it with `useMemo<SizeColumnsToContentStrategy>(() => ({ type: 'fitCellContents', colIds: ['startDate'] }), [])`. That is verbatim the combination the expected text calls wrong: 'replacing fitGridWidth with a different sizing mechanism such as per-column flex plus a scoped fitCellContents strategy, which raises warning #318 and does not work.' The clean-load console confirms it: "AG Grid: warning #318 `colDef.flex` is not supported with `gridOptions.autoSizeStrategy`."

### 13-fit-grid-with-exception run 02 (cold)

They deleted the `fitGridWidth` autoSizeStrategy and rebuilt the sizing with `defaultColDef: { flex: 1 }`, `flex: 0` on startDate, and a `fitCellContents` strategy scoped to `colIds: ['startDate']`, which triggers AG Grid warning #318 and leaves the flex sizing inoperative.

> They removed the working `fitGridWidth` strategy and replaced it with the exact combination the expected text names as wrong: per-column `flex` plus a scoped `fitCellContents` strategy. src/App.tsx:27 `const defaultColDef = useMemo<ColDef<Employee>>(() => ({ flex: 1 }), []);`, src/App.tsx:21 `{ field: 'startDate', flex: 0 },` and src/App.tsx:29-32 `const autoSizeStrategy = useMemo<SizeColumnsToContentStrategy>(() => ({ type: 'fitCellContents', colIds: ['startDate'] }), []);` — replacing template src/App.tsx:26 `const autoSizeStrategy = useMemo<SizeColumnsToFitGridStrategy>(() => ({ type: 'fitGridWidth' }), []);`. `suppressSizeToFit` appears nowhere in the file. The predicted failure is confirmed by the clean-load console: "AG Grid: warning #318 `colDef.flex` is not supported with `gridOptions.autoSizeStrategy`", so flex is ignored and the other columns do not fill the grid width.

### 13-fit-grid-with-exception run 03 (cold)

They tore out the template's `fitGridWidth` auto-size strategy and rebuilt the behaviour as `defaultColDef: { flex: 1 }` with `flex: 0` on startDate plus a `fitCellContents` strategy scoped to `colIds: ['startDate']`, a combination AG Grid rejects with warning #318, rather than simply setting `suppressSizeToFit: true` on the startDate column.

> They never used `suppressSizeToFit: true`, and they removed the `fitGridWidth` strategy entirely. src/App.tsx:31-34 replaces it with `const autoSizeStrategy = useMemo<SizeColumnsToContentStrategy>(() => ({ type: 'fitCellContents', colIds: ['startDate'] }), [])`, and src/App.tsx:28 introduces per-column flex via `const defaultColDef = useMemo<ColDef<Employee>>(() => ({ flex: 1 }), [])` with `{ field: 'startDate', flex: 0 }` at src/App.tsx:21. This is exactly the combination the expected text names as wrong: "replacing `fitGridWidth` with a different sizing mechanism such as per-column `flex` plus a scoped `fitCellContents` strategy, which raises `warning #318` and does not work". The captured clean-load console confirms it: "AG Grid: warning #318 `colDef.flex` is not supported with `gridOptions.autoSizeStrategy`."

## Runs judged not minimal

- **01-flex-to-fit-content run 01** (cold) — 131 lines of new measurement machinery (src/columnWidths.ts) replace a single built-in grid option. Specifically: the canvas measurement helper src/columnWidths.ts:122-131, the DOM-scraping theme metrics src/columnWidths.ts:66-82 (`readMetrics`, reading `.ag-cell`, `.ag-header-cell-text`, computed fonts, padding and borders), the ancestor/sibling chrome accumulator src/columnWidths.ts:90-104, the 
- **01-flex-to-fit-content run 02** (cold) — 110 lines of hand-rolled measurement machinery replace a single built-in grid option. src/sizeColumnsToContent.ts:53-66 builds a hidden `<div>` with `position: fixed`, `visibility: hidden`, `width: max-content`, clones the real header and cell elements into it, appends it to the live grid and reads `getBoundingClientRect().width` (line 65). src/sizeColumnsToContent.ts:85-110 `cloneForMeasuring` ha
- **01-flex-to-fit-content run 03** (cold) — The whole of src/sizeColumnsToData.ts (153 lines) replaces a single built-in grid option. It clones live DOM cells into a hidden container (src/sizeColumnsToData.ts:107-135 `createProbe`, including `element.cloneNode(true)` and appending to `.ag-root-wrapper`), runs a canvas advance-width pass plus a candidate shortlist with tuning constants (src/sizeColumnsToData.ts:8 `const CANDIDATE_TOLERANCE =
- **02-flex-to-fit-content-and-fill run 02** (cold) — A 101-line hand-rolled sizing module plus 40 lines of wiring replaces one grid option. Specific machinery the built-in makes unnecessary: (1) canvas text measurement — src/columnSizing.ts:6-11 `measureCtx ??= document.createElement('canvas').getContext('2d')` and src/columnSizing.ts:56/62 `ctx.measureText(...)`, with manual padding/border arithmetic at src/columnSizing.ts:14-22; (2) the proportion
- **09-app-owned-widths-fill-gap run 01** (cold) — The fit is wrapped in a hand-rolled measurement guard that re-derives what `sizeColumnsToFit()` already computes internally — src/App.tsx:66-75: `const { left, right } = api.getHorizontalPixelRange(); const availableWidth = right - left; const columnsWidth = api.getColumnState().reduce((total, column) => (column.hide ? total : total + (column.width ?? 0)), 0); if (availableWidth > columnsWidth) { 
- **09-app-owned-widths-fill-gap run 02** (cold) — The `autoSizeStrategy` at src/App.tsx:26 and src/App.tsx:72 is redundant machinery on top of the fit they already have: `onGridSizeChanged` (src/App.tsx:62-64) fires when the grid first gets its size as well as on later resizes, so `event.api.sizeColumnsToFit()` already closes the initial gap. The strategy exists only to duplicate that first fill -- and to do it via a path that bypasses the store.
- **09-app-owned-widths-fill-gap run 03** (cold) — The task needs only `event.api.sizeColumnsToFit()` inside the handler. Instead src/App.tsx:62-65 hand-rolls a per-column limit table before the call:
- **09-app-owned-widths-fill-gap run 52** (primed) — The minimal change is the `onGridReady` calling `event.api.sizeColumnsToFit()`; two extra pieces of machinery go beyond it. (1) src/App.tsx:90-102, the `readWidths(api, previous)` helper, re-derives every column's width from the api (`for (const column of api.getColumns() ?? []) { ... column.getActualWidth() }`) plus a manual `let changed = false` / identity-return dance, replacing the template's 
- **11-strategy-with-changing-data run 01** (cold) — The `api.autoSizeAllColumns()` call at src/App.tsx:43 is all the task needs; everything around it is hand-rolled machinery that re-derives and overrides what the grid already tracks. src/App.tsx:42 snapshots every column's width from the grid's own state (`const widthBefore = new Map(api.getColumnState().map(({ colId, width }) => [colId, width ?? 0]));`), then src/App.tsx:46-49 reads the state bac
- **11-strategy-with-changing-data run 02** (cold) — The smallest change that implements the expected approach is `onRowDataUpdated={({ api }) => api.autoSizeAllColumns()}`. Two blocks of extra machinery sit on top of that. (1) A hand-rolled grow-only ratchet, src/App.tsx:42-51: `const columnLimits = api.getColumns()?.map((column) => ({ colId: column.getColId(), minWidth: column.getActualWidth() })); api.autoSizeAllColumns({ columnLimits });` — this
- **11-strategy-with-changing-data run 53** (primed) — The autoSizeAllColumns() call at src/App.tsx:54 is the whole of the expected change; the surrounding ratchet machinery at src/App.tsx:53 and src/App.tsx:55-60 is extra hand-rolled logic on top of it: `const widthsBefore = new Map(api.getColumnState().map((column) => [column.colId, column.width ?? 0]));` snapshots widths the grid already tracks, and then `api.applyColumnState({ state: api.getColumn
- **13-fit-grid-with-exception run 01** (cold) — The minimal change is one property on one column definition (`suppressSizeToFit: true` on src/App.tsx:20's `{ field: 'startDate' }`), leaving `autoSizeStrategy: { type: 'fitGridWidth' }` untouched. Instead they hand-rolled a substitute sizing scheme: six separate `flex: 1` properties added across src/App.tsx:15-19 and :21, plus a rewritten strategy object and changed type import (src/App.tsx:3 `Si
- **13-fit-grid-with-exception run 02** (cold) — The minimal change is a single property on the startDate column def (src/App.tsx:20 in the template becoming `{ field: 'startDate', suppressSizeToFit: true }`), leaving line 26's `fitGridWidth` strategy untouched. Instead they tore out the existing built-in sizing and hand-assembled a replacement across three sites: a new `defaultColDef` memo at src/App.tsx:27 and its wiring at src/App.tsx:40 `def
- **13-fit-grid-with-exception run 03** (cold) — The minimal change is a single property on one column def — `suppressSizeToFit: true` on `{ field: 'startDate' }` (src/App.tsx:21) with the template's `autoSizeStrategy = { type: 'fitGridWidth' }` left untouched. Instead they changed the import type (src/App.tsx:3), added a whole new `defaultColDef` useMemo (src/App.tsx:28), added `flex: 0` to startDate (src/App.tsx:21), rewrote the autoSizeStrate
- **13-fit-grid-with-exception run 53** (primed) — src/App.tsx:20 adds `width: 130` alongside `suppressSizeToFit: true`. The expected text calls this out directly: the task asks for the column's natural width, and this magic number replaces it with an invented one. Removing `width: 130` and leaving `{ field: 'startDate', suppressSizeToFit: true }` would implement the same behaviour and honour 'natural width', so the 130 is surplus to the approach.

## Agent behaviour

- Enabled dev validations unprompted: **0/78**
- Consulted ag-grid.com: **0/78**
- Ran a build or typecheck: **28/78**
- Turns: median 9, max 73
- Implementation cost: **$49.90**

Red-flag APIs, counted across all runs:

- `canvas` — 3 run(s)
- `measureText` — 3 run(s)
- `getBoundingClientRect` — 2 run(s)
- `offsetWidth` — 1 run(s)

