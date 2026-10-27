# MCP docs search: pain points, Jan–Oct 2026

**Status:** draft. Ticket: [AG-18665](https://ag-grid.atlassian.net/browse/AG-18665).

Goal: actionable pain points from the docs MCP search log, as documentation gaps, product issues or search-service flaws, each with the share of clients affected.

## Data and method

- Source: `tmp/ag-mcp-query-log/queries_with_client.csv`, 129k successful searches, client = salted IP hash.
- Excluded: 9–16 Oct Charts/Studio surge and burst (~12.5k rows), 19 Oct version sweep (~100), unjoined rows (59).
- Unit: distinct clients. Threads (searches on one question) used to detect struggle.
- Old versions are first-class. Clients by main major version: v31 3%, v32 6%, v33 9%, v34 26%, v35 43%, v36 14% (9,764 clients).
- Visits: a client's searches with no gap over 30 min (35,898 visits).

## Search-service flaws

- **Unindexed versions:** about 10% of searches return 404, all for versions the index doesn't have.
    - Some new releases waited months to be indexed, e.g. 35.2.x and 35.3.0 got 404s from March–May until 1 July.
    - Still not indexed: 35.3.1, 36.0.1, 36.0.2 and 36.1.0.
    - The rest come from clients sending something that isn't a full version number, such as `32`, `latest` or `catalog:`.
- **Server errors:** about 4% of MCP requests failed with a 500, and roughly 10% of clients hit at least one. August was worst, at 8.9%.
- **Uptime:** about 99.6%, counting any 5-minute window where 90% or more of requests failed as down. Around 160 short outages, most under 40 minutes, the longest an hour, clustered around late June and July.

From the search log:

- **Version freeze:** all v36 searches log as `36.0.0`, because the search service stopped being updated at that version.
- **No Charts/Studio docs:** ~3% of traffic outside the surge is Charts queries, answered with Grid pages.

- **Answer not returned (sample):** of 98 sampled struggle claims whose answer is documented, 59 were in a page search never returned for those threads. The set filter list page is the most frequent miss.

## Sample round, 21 Oct

A sample, not the full run, to judge what each route yields. Every finding below was checked by a separate reviewer told to refute it. Clients are distinct clients whose struggle threads match the claim (out of 9,764).

Documentation gaps: 124 claims checked (all of the top 60 by clients, 32 from 5–9 clients, 32 from under 5). 7 of the top 8 were documented. Of the 116 after those, 16 were marked missing, 3 of which the reviewer refuted. The 3 upgrade-guide claims at the top were documented and returned: repeated searches while upgrading, not struggle.

Product issues: 70 suspected bugs from the code check went to test-writing (48 of them sent in this round, plus 22 in an earlier run that was stopped). 4 reproduced, 2 survived review. None of the 12 Playwright-suited candidates reproduced. Everything that reproduced came from the code check's 3 "bug" verdicts, plus b-0335 (refuted). The 67 undecided candidates produced nothing that survived. Many "not reproduced" notes say the symptom probably came from framework re-rendering (React, Angular), which these tests cannot reach.

Bug route, completed 22 Oct: the remaining 187 undecided candidates were also tried. 184 were blocked as too vague to test (grab-bags of unrelated reports, bare error-code lookups, no setup or wrong outcome) and 3 did not reproduce. Every candidate that could still be a bug has now been tried. The 240 others the code check ruled out with cited code (125 by design, 65 misuse, 50 already fixed) were not tested.

Spend: about $56 of subagent cost so far, estimated (see `tmp/ag-mcp-analysis/spend_ledger.md`).

## Pass 1, 26 Oct: wider bug net over strict threads

Why: the original one-week report found a bug this analysis missed (SSRM `masterDetail` without MasterDetailModule: no missing-module error, crash on expand). It was lost twice: a regex sent "validation error" (no code number) to the behaviour route, then behaviour triage rejected the thread as a support question.

Method: every search in the 9,353 strict threads judged on its own, unsure = flag, plus the old regex as a backstop; grouped into situations, previously checked ones marked dup; every situation code-checked in batches of 5; tests for `bug` and `possible`; sceptical review. Not told about the master detail bug.

- 38,358 searches → 3,012 flags (1,394 clients) → 1,572 situations: 1,178 checked, 330 dup, 64 skipped (later checked too).
- Code check (1,242 situations): 4 bug, 60 possible, 496 by design, 187 misuse, 481 untestable, 14 fixed.
- Tests: 64 written, 32 reproduced, 6 upheld after review (listed under Product issues).
- Blind test failed: the master detail search was flagged, then skipped at grouping, and when checked anyway the code check read the right rule (`gridOptionsValidations.ts:160`) and called it misuse because the error the agent described does not exist. The real bug is the missing error next to it.
- Reviewer inconsistency: p-0706 (pagination `initialState` page lost when `rowData` starts `[]`) was refuted, though the same behaviour was upheld earlier (`pagination-initial-state-page-async-data.test.ts`) and the row-group expansion equivalent was upheld here.
- Spend: ~$84 (running total ~$140).

Recheck, 26 Oct: code-checked the 330 dups and re-checked the 668 misuse/untestable, with instructions to judge what could have produced the searches rather than the agent's explanation, and to treat a crash or silence on a wrong setup as a missing validation.

- 998 situations → 6 bug, 304 possible, 404 by design, 171 misuse, 95 untestable, 18 fixed.
- 271 candidates after dropping 38 whose earlier duplicate already had a real test. Top 55 tested (bug first, then most clients): 26 reproduced, 10 upheld (one repeats an existing test). 216 untested.
- The master detail bug was found (`bug`, citing the rule and `dependsOn`), but not blind: one instruction line about checking module rules was added after a pilot missed it.
- Spend: ~$59 (running total ~$200).

## Documentation gaps

Sample only. Each is a true fact, cited in code, stated nowhere in the docs or API JSDoc.

- **Selection column position** (22 clients, v32–36): defaults to `lockPosition: 'left'` (`'right'` in RTL), `pinned: null`, `suppressMovable: true`, all overridable in `selectionColumnDef`. `selectionColService.ts:57-72`. Checked by hand, not by the reviewer.
- **Custom renderer in the selection column** (17, v32–36): the built-in checkbox is still added beside a custom `cellRenderer` unless checkboxes are turned off. `cellComp.ts:280-282`.
- **Changing row style options at runtime** (17, v31–36): updating `rowClassRules`, `getRowClass`, `getRowStyle`, `rowClass` or `rowStyle` re-applies them to existing rows. `rowCtrl.ts:665-668`.
- **Unknown SSRM row count** (16, v33–36): omit `rowCount` or pass -1; a short response marks the last row. `lazyCache.ts:932-948`.
- **SSRM transaction updates for unloaded rows** (14, v31–36): `update` entries whose id is not in the cache are silently ignored (documented only for `remove`). `lazyCache.ts:1194-1199`.
- **Popup editors and `popupParent`** (13, v31–35): popup cell editors use the popup service, so `popupParent` decides where they attach and avoids clipping. `cellComp.ts:575-585`.
- **Tree data sorting** (8, v33–36): children are sorted among siblings only; the hierarchy is kept. `groupSortStage.ts:60-101`.
- **Excluding a column from cell selection** (7, v32–36): no per-column option exists. `rangeService.ts`.
- **Row count status panels with SSRM** (6, v34–36): the filtered panels rely on `forEachNodeAfterFilter`, which SSRM lacks, and the total and selected panels count only loaded rows. `statusBar/providedPanels/utils.ts:3-5`.
- **Tree data `getSelectedNodes`** (4, v33–36): with `groupSelects: 'descendants'`, parents are not stored as selected; stated only for row grouping. `selectionService.ts:432`.
- **`setFocusedCell` takes browser focus** (4, v34–36): it passes `forceBrowserFocus: true`; the JSDoc doesn't say. `navigationApi.ts:20`.
- **Cell spanning switches row positioning** (4, v35–36): `enableCellSpan` positions rows with `top` rather than `transform`. `rowCtrl.ts:193`.
- **CSRM group row ids** (3, v33–35): `getRowId` is not called for group rows; ids are generated as `row-group-<colId>-<key>`. `groupStrategy.ts:523`.
- **Custom tool panel icons** (3, v32–36): a non-built-in `iconKey` must be registered in the `icons` grid option, otherwise error 134. `icon.ts:187-200`.

## Product issues

Sample only. Tests on branch `ag-18665/mcp-log-bug-repros`, in `testing/behavioural/src/mcp-log-findings/`; each fails on current code.

- **Restored pagination page lost** (1 client, Angular 36.0.0): with `initialState.pagination.page: 2` and `rowData: []` before data arrives, the grid ends on page 1. `pagination-initial-state-page-async-data.test.ts`.
- **Toolbar update closes open menu** (1 client, React 36.0.0): `updateGridOptions({ toolbar })` recreates all items instead of calling the documented `refresh()`. `toolbar-update-keeps-open-menu.test.ts`.

- **Toolbar never calls custom item `refresh`** (companion, hand-written): a custom item implementing `refresh` returning true is destroyed and recreated. `toolbar-update-custom-item-refresh.test.ts`.
- **SSRM `masterDetail` without MasterDetailModule** (1 client, Vue 36.0.0; from the original report, hand-written): no error #200, then expanding a master row throws a TypeError. Client-side control passes. `ssrm-master-detail-missing-module-validation.test.ts`.

From pass 1:

- **Date string editor on a text column crashes** (1 client, React 36.0.0): `agDateStringCellEditor` with `cellDataType: 'text'` throws "getDateParserFunction(...) is not a function" on edit. `date-string-editor-text-cell-data-type.test.ts`.
- **`setDataValue` overwritten by open editor** (1, React 32.3.5): with the default event source the editor stays open (docs say it closes), and on stop the editor's value overwrites the written one. `set-data-value-default-source-editor-overwrite.test.ts`.
- **Deep global options mutate the global theme** (2, Angular 35–36): with `provideGlobalGridOptions(..., 'deep')`, a grid's own `theme` is merged into the shared global theme instance, so later grids get the wrong theme. `global-options-deep-theme-mutation.test.ts`.
- **Row group expansion `initialState` lost with async data** (1, React 36.0.0): created with `rowData: []`, groups are not expanded when data arrives. `row-group-expansion-initial-state-async-data.test.ts`.
- **`autoGroupColumnDef.icons` ignored** (1, Angular 33.3.2): column-level `groupExpanded`/`groupContracted` icons not used by the group cell renderer. `auto-group-column-icons-ignored.test.ts`.
- **Popup editor ignores `stopEditingWhenCellsLoseFocus`** (1, vanilla 31.3.2): focus moving outside the grid does not stop a popup editor. `popup-editor-stop-editing-focus-leaves-grid.test.ts`.

From the recheck:

- **Popups mispositioned in a scrolled `popupParent`** (9 clients, all frameworks, v32–36; Playwright): the parent's scroll offset is ignored, so the column menu opens far from its button. `testing/e2e/e2e/mcp-log-popup-parent-scrolled.spec.ts`.
- **React drops `cellStyle` keys the docs say are kept** (6, React 34–36): docs say old styles are not removed; vanilla keeps them, React replaces the style object. `cell-style-react-removes-stale-styles.test.tsx`.
- **SSRM duplicate id across blocks not reported** (2, Angular 34–35): warning 205 only checks within one response; a duplicate in another block silently moves the existing node. `ssrm-duplicate-id-across-blocks-no-warning.test.ts`.
- **Legacy theme with `autoHeight` logs a false warning 9** (2, Vue/React 35–36; Playwright): legacy CSS loaded, yet "grid initialised before styles loaded" is logged. `testing/e2e/e2e/mcp-log-legacy-autoheight-warning-9.spec.ts`.
- **Popup not closed by a click on `<html>`** (2, React 34–35): the outside-click walk stops at `body`, which a click below a short body never meets. `popup-outside-mousedown-on-html-element.test.ts`.
- **`tooltipShowMode: 'whenTruncated'` ignored with a custom renderer** (2, Vue/React 33–35; Playwright): tooltip always shows. `testing/e2e/e2e/mcp-log-tooltip-when-truncated-custom-renderer.spec.ts`.
- **Framework inner header component never refreshed** (1, Angular 34.3.1): no `refresh` proxy on wrapped inner header components, so header changes are lost. Simulated wrapper, not real Angular. `inner-header-component-refresh-framework-wrapper.test.ts`.
- **Invalid custom icon crashes** (1, React 35.1.0): after warning 133 the grid calls `appendChild(undefined)` and throws. `custom-icon-invalid-result-append-child.test.ts`.
- **`formulaDataSource`/`formulaFuncs` without FormulaModule** (1, React 36.0.0): no missing-module error, silent no-op. `formula-options-missing-module-validation.test.ts`.
- The `setDataValue` bug above was also hit by a second client (React 35.1.0).

Refuted and unreviewed reproductions (45 files) moved out of the repo to `tmp/ag-mcp-analysis/refuted-tests/`; verdicts in `tmp/ag-mcp-analysis/sample_round_result.json` and `pass1/{testwrite,rc_testwrite}_result.json`.
