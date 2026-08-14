# AG Grid + coding agents: failure-mode probe

Scenario catalogue and harness for measuring how well coding agents build new AG Grid React
applications without hand-holding.

Selection principle: **bread-and-butter first**. Every scenario below is something a new customer
is likely to hit in their first hour of evaluating the grid. Recency of API change is a secondary
weighting — scenarios that are both common *and* recently changed are the most valuable, but a
niche feature is excluded no matter how recently it changed.

---

## 1. Harness

### Scaffold

A single pre-built template, copied fresh per run:

- Vite + React + TypeScript, `npm install` already run, `node_modules` present
- **No AG Grid installed**, no AG Grid code, no AG Grid mention anywhere in the template
- A trivial placeholder `App.tsx` the agent is expected to replace
- Dev server on a per-run port

Installing and wiring AG Grid is part of what is under test, so we must not pre-empt it. Letting
each agent run `npm create vite` itself would burn tokens and add variance for no signal.

### Launch

`claude -p` from a directory **outside this repository**, one directory per run.

Running as a sub-agent of this session is not acceptable: it would inherit this repo's `CLAUDE.md`
/ `AGENTS.md`, the `.rulesync` glob rules, the ag-* plugin skills, and — fatally — `packages/ag-grid-*/src`
sitting on disk, from which the correct current API could simply be read.

**Verified invocation** (both implementing and verifying agents):

```
claude -p "<prompt>" \
  --model opus \
  --setting-sources "" \
  --strict-mcp-config \
  --mcp-config <repo>/agent-grid-probe-mcp.json
```

Empirically established while designing this (all four confirmed by test runs from a directory
outside the repo):

- Running `claude -p` outside the repo is **not** sufficient isolation on its own. The `ag-*` plugin
  skills are enabled at user scope, so they follow the agent anywhere — including
  `ag-product:example`, whose own description states it "contains required conventions that differ
  from training data". An implementing agent that loaded it would be handed the answers.
- `--setting-sources ""` strips them: the agent is left with only built-in skills, and no `ag-*`
  entries. OAuth still works; no API key needed.
- `--setting-sources ""` **also** strips the user-scoped MCP servers, which live in `~/.claude.json`
  rather than in a settings file. They must therefore be re-supplied explicitly.
- `--mcp-config agent-grid-probe-mcp.json` (in this repo, holding `chrome-devtools` and `playwright`
  lifted from the user config) restores browser MCP with no skill contamination.

`--bare` would be a heavier-handed alternative but requires `ANTHROPIC_API_KEY` rather than OAuth,
so it is not used.

**Implementing agents keep browser MCP.** They are simply never told about it. This is the realistic
condition — a developer's agent does generally have a browser available — and it converts "did the
agent check its own work?" from an assumption into a measurement. Whether an implementing agent
opens the app in a browser, sees the console, and self-corrects is one of the more interesting things
this experiment can tell us.

Other parameters:

- Model: **Opus 5** for all agents.
- Network access: **allowed**. Agents may browse, search, and read ag-grid.com. This is the realistic
  condition, and "did reading the docs save them?" is part of what we learn.
- `~/.claude/CLAUDE.md` leakage is accepted as harmless (confirmed with the user).
- Version is **not pinned**. Agents install whatever npm gives them. Record the resolved
  `ag-grid-community` / `ag-grid-enterprise` version per run — deprecation applicability depends on it.
- 3 runs per scenario, to separate consistent failure from sampling noise.

### Prompt template

The agent receives exactly this, with `{{TASK}}` replaced by the scenario's prompt:

> You are working in an existing Vite + React + TypeScript project in the current directory.
> Dependencies are already installed. Replace the contents of `src/App.tsx` (and add any other files
> you need) to build the following:
>
> {{TASK}}
>
> Install any packages you need. Make sure the app builds and runs.

Nothing else. No mention of modules, themes, licences, versions, validation, or the browser.

### Prompt authoring rules

These apply to every `{{TASK}}` in the catalogue:

1. **No API, option, module, or type names.** Describe the behaviour as a user experiences it.
2. **No old-vs-new disambiguation.** Where the old and new API have different names, use a term that
   is neither — e.g. "click and drag to select a rectangular region of cells" rather than either
   "cell selection" or "range selection".
3. **No warnings, no "make sure you…", no anticipation of known traps.** The whole point is to see
   what an unassisted agent does.
4. **No mention of licences or editions.** If a scenario needs an enterprise feature, the prompt asks
   for the behaviour and the agent works out the rest. We supply no licence key.
5. **Realistic voice.** Written as a working developer would write it — a bit loose, feature-led,
   describing the app rather than the library.

### Licensing

No licence key is supplied and licensing is never mentioned. Enterprise scenarios will therefore
show the watermark and licence console error; that is expected and excluded from the console check.

A secondary observation worth recording: when asked for an enterprise-only behaviour with no licence
available, does the agent use the enterprise feature anyway, or silently substitute a
community-level approximation without telling the user?

---

## 2. Verification

Two checks per run, both performed by a separate verifying agent that has the scenario spec
(including the "correct approach" and "API check" sections below) but did **not** write the code.
Implementing agents are told nothing about Chrome MCP or about verification.

### Check 1 — browser

1. Record whether the implementation already calls `enableDevValidations()`. **This is a data point
   in its own right.** `AllCommunityModule` does not bundle `ValidationModule`
   (`packages/ag-grid-community/src/validation/enableDevValidations.test.ts:36`), so validation is off
   until explicitly opted in — meaning an app that never calls it emits no deprecation or
   missing-module warnings at all. If agents essentially never call it, the grid's own
   self-correction channel is dark for every AI-built app.
2. If absent, add the call.
3. Load the app in Chrome MCP, drive the interactions listed in the scenario's browser check, and
   confirm visually that they work.
4. Console must be clean apart from the enterprise licence warning.

### Check 2 — API

The verifying agent compares the implementation against the "correct approach" and "predicted
failure modes" documented in the scenario. The scenario spec is the authority on what the right
answer is; the verifier is not being asked to recall the modern API from its own knowledge.

### Per-run record

- Resolved AG Grid version
- Did the implementing agent open the app in a browser at all? (It had MCP; it was never told.)
- `enableDevValidations` present before verification: yes/no
- Browser check: pass / partial / fail, with what was observed
- Console: clean / warnings / errors, verbatim
- API check: which expected APIs used, which predicted failure modes hit
- Verdict: `pass` / `works-but-outdated` / `broken`

`works-but-outdated` is the interesting middle category and must not be collapsed into `pass` — see
S05 and S06, where the legacy API still functions and the app looks perfect.

---

## 3. Scenario catalogue

Recency is expressed against the repo's current version (36.1 at time of writing). Two distinct
mechanisms can produce old-API output and the analysis must keep them apart:

- **Stale-example mass** — the change is old enough to be well inside training data, but the corpus
  is dominated by pre-change content.
- **Post-cutoff ignorance** — the change is so recent the model may not know the new API exists.

---

### S01 — First grid: get it on screen

**Prompt**
> Build a React page that shows a table of employee records — name, department, start date, salary.
> Around 50 rows of made-up data. The user should be able to sort by clicking column headers and
> resize the columns by dragging. Use AG Grid.

**The trap**
v33 made module registration mandatory. Pre-v33 examples — the overwhelming majority of what exists
online — either register nothing or use the old CSS import lines. The grid errors clearly when a
module is missing, so this should be self-correcting *if* the agent looks at the browser; it has no
browser, so the question is whether it gets it right from knowledge and docs alone.

**Correct approach**
`AllCommunityModule` registered via `ModuleRegistry.registerModules`, or React's `AgGridProvider`
(exported from `ag-grid-react`, `packages/ag-grid-react/src/index.ts:7`). Theming API by default;
no `ag-grid.css` import. *(Confirm the exact recommended React registration idiom before running.)*

**Predicted failure modes**
- No module registration at all
- Importing `ag-grid-community/styles/ag-grid.css` and `ag-theme-alpine.css`
- Registering a long hand-rolled list of individual modules instead of `AllCommunityModule`
- Deprecated `ag-grid-react` import paths

**Recency / stale-example mass** — Change at v33 (three majors back). Stale-example mass **very
high**: every AG Grid tutorial ever written starts with the CSS imports.


**API check** — Modules registered; no legacy CSS imports; no `theme="legacy"`.

**Browser check** — Grid renders 50 rows. Header click sorts asc/desc. Column drag-resizes. Console
clean.

---

### S02 — Make it match our brand

**Prompt**
> Take the employee table and restyle it to fit our product: dark background, our accent colour
> #6C5CE7 for selected and hovered rows, slightly more compact rows than the default, and the header
> in a heavier font. Use AG Grid.

**The trap**
The single highest-value scenario. v33 replaced CSS file themes with the Theming API, and the two
are mutually exclusive. The grid detects the conflict and reports it — error 239,
`packages/ag-grid-community/src/validation/errorMessages/errorText.ts:697` — but *only* when no
`theme` option was passed and `ag-grid.css` is present. An agent that fully commits to the legacy
path by passing `theme="legacy"` gets a working, silent, entirely outdated app.

Styling is also where new users go immediately after their first grid renders, and where the
pre-v33 corpus is deepest (every blog post about customising AG Grid predates the Theming API).

**Correct approach**
`theme` grid option set to a Theming API theme — `themeQuartz.withParams({...})` or a custom theme
via `createTheme` — with no CSS file imports.

**Predicted failure modes**
- `ag-theme-alpine-dark` / `ag-theme-quartz-dark` class on a wrapper div plus CSS imports
- Overriding `--ag-*` CSS custom properties in a stylesheet rather than through theme params
- `theme="legacy"` plus legacy CSS — works, silent, fully outdated
- Mixing both: Theming API theme *and* a CSS import → error 239
- Raw CSS overrides targeting internal `.ag-*` class names

**Recency / stale-example mass** — Change at v33. Stale-example mass **very high**, and the legacy
path still works, so nothing forces correction.


**API check** — `theme` option present with a Theming API object; no `ag-grid.css` / `ag-theme-*.css`
imports; no `theme="legacy"`; no `--ag-*` overrides in a stylesheet.

**Browser check** — Dark grid, accent colour visible on hover and selection, compact rows, heavy
header font. Console clean — in particular no error 239.

---

### S03 — Search and filter

**Prompt**
> Add a search box above the employee table that filters the rows as you type across all columns.
> Also let people filter individual columns — a text filter on name and department, and a
> number-range filter on salary, reachable from the column headers. Use AG Grid.

**The trap**
Module granularity. Community filters live in separate modules, and picking `filter: 'agTextColumnFilter'`
/ `'agNumberColumnFilter'` without the matching modules is a runtime error the agent cannot see.
Also a naming trap: quick filter has changed shape over the years.

**Correct approach**
`TextFilterModule` / `NumberFilterModule` (plus the floating-filter module if used) registered, or
`AllCommunityModule`. Quick filter via the current grid option. *(Confirm exact module and quick-filter
option names before running.)*

**Predicted failure modes**
- Column filters configured but the modules not registered
- Hand-rolled external filtering of `rowData` in React state instead of using the grid's quick filter
- Deprecated quick-filter API naming
- `floatingFilter` without its module

**Recency / stale-example mass** — Module split predates v33 but was made mandatory at v33.
Stale-example mass **high**. Bread-and-butter: nearly every evaluator tries filtering.


**API check** — Required filter modules registered; grid-native quick filter used rather than
pre-filtering `rowData`.

**Browser check** — Typing in the search box narrows rows live. Column header menus offer text and
number filters and they apply. Console clean.

---

### S04 — Row selection with checkboxes

**Prompt**
> Let users tick multiple employees using checkboxes in the first column, with a checkbox in the
> header that selects and deselects everything currently shown. Show the count of selected employees
> and a Delete Selected button underneath. Use AG Grid.

**The trap**
v32.2 moved row selection from a scattered set of options into a single `rowSelection` object. The
old options are deprecated but **still work**, so a v31-era answer produces a perfect-looking app.
Six separate deprecations are in play here, all confirmed in
`packages/ag-grid-community/src/validation/rules/gridOptionsValidations.ts` and
`colDefValidations.ts:15-30`.

**Correct approach**
`rowSelection: { mode: 'multiRow', checkboxes: true, headerCheckbox: true, selectAll: 'filtered' }`.

**Predicted failure modes**
- `rowSelection: 'multiple'` as a string
- `colDef.checkboxSelection: true` — deprecated v32.2, "Use `rowSelection.checkboxes` in `GridOptions` instead."
- `colDef.headerCheckboxSelection` — deprecated v32.2
- `colDef.headerCheckboxSelectionFilteredOnly` — deprecated v32.2, "Use `rowSelection.selectAll = "filtered"`"
- `suppressRowClickSelection` — deprecated v32.2
- `rowMultiSelectWithClick` — deprecated v32.2

**Recency / stale-example mass** — v32.2, roughly two years settled. Stale-example mass **very high**;
`checkboxSelection` is in essentially every tutorial. Prime test of the "is two years enough?" question.


**API check** — `rowSelection` is an object using the v32.2+ shape; none of the six deprecated options
appear.

**Browser check** — Checkbox column renders; header checkbox selects all; count updates; Delete
Selected removes the right rows. Console clean — **any deprecation warning is a fail**, since this is
the scenario where the app works while being outdated.

---

### S05 — Spreadsheet-style cell range selection

**Prompt**
> Build a React app with a grid of sales records — region, product, quarter, units, revenue. I want
> spreadsheet-like selection: click and drag with the mouse to select a rectangular region of cells,
> and a small square in the corner of the selection that I can drag to copy values across adjacent
> cells. Show the total revenue of whatever cells are currently selected underneath the grid. Use AG Grid.

**The trap**
Both APIs work. `enableRangeSelection` / `enableFillHandle` are deprecated at v32.2 but functional,
and `RangeSelectionModule` is deprecated at v33 yet still exported as an alias that `dependsOn`
`CellSelectionModule` (`packages/ag-grid-enterprise/src/rangeSelection/rangeSelectionModule.ts:32-37`).
A 2023-era answer builds, runs, and behaves correctly while using an API surface we intend to remove.

**Correct approach**
`cellSelection: { handle: { mode: 'fill' } }`; `CellSelectionModule` registered (enterprise).

**Predicted failure modes**
- `enableRangeSelection` — deprecated v32.2, "Use `cellSelection = true` instead."
- `enableFillHandle` — deprecated v32.2, "Use `cellSelection.handle` instead."
- `RangeSelectionModule` instead of `CellSelectionModule`
- `onRangeSelectionChanged` instead of `onCellSelectionChanged` — deprecated v32.2
- Side-effect `import 'ag-grid-enterprise'` instead of explicit module registration

**Recency / stale-example mass** — Option renamed v32.2, module renamed v33. Stale-example mass
**very high**; "ag grid range selection" was the canonical search term for a decade.


**API check** — `cellSelection` object used; `CellSelectionModule` registered; none of the deprecated
names present.

**Browser check** — Drag-select a 3×2 block; footer total matches the sum of those six cells. Fill
handle present and drag-copies. Console clean apart from the licence warning.

---

### S06 — Sorting configuration

**Prompt**
> On the employee table, make every column sort in descending order first when clicked, allow a
> third click to return to unsorted, and show an icon on unsorted columns so people realise they can
> be sorted. Use AG Grid.

**The trap**
v33 moved `sortingOrder` and `unSortIcon` from grid options onto `defaultColDef`. Both still work at
grid level, deprecated with warnings. Small, common, and almost invisible without validation on.

**Correct approach**
`defaultColDef: { sortingOrder: ['desc', 'asc', null], unSortIcon: true }`.

**Predicted failure modes**
- Top-level `sortingOrder` — deprecated v33, "Use `defaultColDef.sortingOrder` instead."
- Top-level `unSortIcon` — deprecated v33, "Use `defaultColDef.unSortIcon` instead."

**Recency / stale-example mass** — v33. Stale-example mass **moderate**; less blogged than selection
or theming, so a useful contrast case against S04.


**API check** — Both options on `defaultColDef`, not at grid level.

**Browser check** — First click sorts descending; third click clears; unsorted columns show an icon.
Console clean.

---

### S07 — Editing cells and saving changes

**Prompt**
> Make the salary and department columns editable in the employee table. Department should be a
> dropdown of the valid departments. When someone edits a value, log the change and update our local
> state so it survives a re-render. Reject salaries below zero. Use AG Grid.

**The trap**
Editing requires `EditCore` (`GRID_OPTIONS_MODULES` maps `editType` and `invalidEditValueMode` to it),
plus the cell-editor modules. The React state-sync half is where the immutability trap bites: agents
routinely mutate the row object in place and rely on the grid re-rendering, which it will not reliably
do. Nothing warns about this.

**Correct approach**
Edit modules registered; a dropdown cell editor; `onCellValueChanged` updating state immutably;
`getRowId` supplied; validation of the new value through the grid's supported mechanism.
*(Confirm current invalid-value handling and dropdown editor names before running.)*

**Predicted failure modes**
- Cell editors configured without the required modules
- Mutating `params.data` in place and expecting the grid to notice
- Replacing the whole `rowData` array on every keystroke with no `getRowId`, losing selection and scroll
- Hand-rolled `<select>` renderer instead of a cell editor
- Deprecated editor component registration patterns

**Recency / stale-example mass** — Module requirement v33; the immutability issue is timeless rather
than recent. Bread-and-butter — editing is a top-three evaluation task.


**API check** — Edit modules registered; state updated immutably; `getRowId` present; grid-native
dropdown editor used.

**Browser check** — Edit a salary; new value persists after a state change elsewhere. Department
opens a dropdown. Negative salary rejected. Console clean.

---

### S08 — Live data updates

**Prompt**
> The employee table gets updates pushed to it every couple of seconds — some rows change salary,
> occasionally a new employee is added or one leaves. Simulate that with a timer. The grid should
> update smoothly without losing the user's scroll position or selection, and changed cells should
> briefly flash. Use AG Grid.

**The trap**
The purest silent-failure scenario, and one of the most commercially damaging — "AG Grid is janky
with live data" is a first-week impression that loses evaluations. Without `getRowId` the grid cannot
match rows across updates, so selection and scroll are lost and flashing misfires. Nothing warns.

**Correct approach**
`getRowId` supplied; immutable `rowData` replacement or the transaction API; cell flashing enabled
through the grid's own mechanism.
*(Confirm current transaction API and cell-flash option names before running.)*

**Predicted failure modes**
- No `getRowId`
- Mutating existing row objects while keeping the array identity, so React and the grid both miss it
- Full `rowData` replacement with fresh object identities every tick, destroying selection and scroll
- Hand-rolled flash via CSS classes and timers instead of the grid's cell-flash support
- Calling a deprecated refresh API to force redraws

**Recency / stale-example mass** — Not a recent change; included because it is core to the grid's
core value proposition and is silently got wrong.


**API check** — `getRowId` present; no in-place mutation of row objects; grid-native flashing.

**Browser check** — Select a row and scroll down; over several update ticks selection and scroll
position survive. Changed cells flash. Console clean.

---

### S09 — Custom cell rendering

**Prompt**
> In the employee table, show the salary as a coloured bar whose width reflects the value relative to
> the highest salary, with the formatted number on top. Add a last column with Edit and Archive
> buttons that call handlers in my component. Use AG Grid.

**The trap**
React integration specifics. There is a long tail of removed APIs here — `frameworkComponents`, the
`reactUi` flag, class-based component registration — that appear throughout the pre-v31 corpus.

**Correct approach**
Plain React function components passed via `cellRenderer`, with handlers reached through props or
context. *(Confirm which of the legacy registration paths still exist versus are fully removed.)*

**Predicted failure modes**
- `frameworkComponents` (removed)
- `reactUi: true` (removed)
- `components` registration where a direct component reference is now idiomatic
- Defining the renderer inline in the component body, remounting it every render
- Reaching handlers via `context` in a way that captures stale closures

**Recency / stale-example mass** — Removals predate v33 but the corpus is deep. Bread-and-butter —
custom cells are the first thing every evaluator customises after styling.


**API check** — Function components used directly; no removed registration APIs; renderer defined
outside the render path.

**Browser check** — Bars render at proportional widths with readable numbers. Buttons fire handlers
with the right row. Console clean.

---

### S10 — Number, date, and currency formatting

**Prompt**
> In the employee table, show salary as GBP with thousands separators, start date as DD/MM/YYYY, and
> add a column showing how many years they have been with us, calculated from the start date. Sorting
> and filtering on those columns should work on the underlying values, not the displayed text.
> Use AG Grid.

**The trap**
The formatter/getter distinction. Formatting in a cell renderer or pre-formatting the data breaks
sorting and filtering — a subtle bug that only shows up when the user sorts, and one that the
implementing agent has no way to notice.

**Correct approach**
`valueFormatter` for display, `valueGetter` for the derived tenure column, underlying values left as
numbers and dates.

**Predicted failure modes**
- Pre-formatting `rowData` into strings, so salary sorts lexicographically
- Formatting via `cellRenderer` where `valueFormatter` is correct
- Computing tenure into the data rather than via `valueGetter`
- Date column typed as a string, so the date filter cannot be used

**Recency / stale-example mass** — Not a recent change. Included as core bread-and-butter with a
silent failure mode.


**API check** — `valueFormatter` and `valueGetter` used; underlying data left unformatted.

**Browser check** — Salary sorts numerically (verify 900 sorts below 1,000, not above). Date filter
offers date semantics. Tenure column correct. Console clean.

---

### S11 — Pagination

**Prompt**
> The employee table now has 10,000 rows. Add pagination with a page size selector offering 20, 50
> and 100 rows per page, and show which records are being viewed. Use AG Grid.

**The trap**
Module requirement, plus the question of whether the agent reaches for pagination or hand-rolls
slicing of `rowData` in React state — the latter defeats sorting and filtering across pages.

**Correct approach**
Pagination module registered; grid pagination options with a page-size selector.
*(Confirm current pagination module and page-size-selector option names before running.)*

**Predicted failure modes**
- Slicing `rowData` in React state, so sorting and filtering apply only to the current page
- Pagination options set without the module registered
- Deprecated page-size option naming

**Recency / stale-example mass** — Module requirement v33. Bread-and-butter.


**API check** — Grid pagination used with its module; no manual slicing of `rowData`.

**Browser check** — Page controls work; page size selector changes rows per page; sorting reorders
across the whole dataset, not just the visible page. Console clean.

---

### S12 — Column sizing

**Prompt**
> When the employee table first loads, the columns should fill the available width sensibly rather
> than leaving a gap on the right, and each column should be wide enough for its content. It should
> stay sensible when the window is resized. Use AG Grid.

**The trap**
`autoSizeStrategy` requires the `ColumnAutoSize` module (confirmed in `GRID_OPTIONS_MODULES`). The
older approach — calling sizing APIs from `onGridReady` — still works, so agents reproduce it and the
app looks fine.

**Correct approach**
`autoSizeStrategy` with the `ColumnAutoSize` module registered.

**Predicted failure modes**
- `onGridReady` calling sizing APIs imperatively
- `autoSizeStrategy` set but `ColumnAutoSize` not registered
- Deprecated sizing API names on the grid API
- Manual resize listeners

**Recency / stale-example mass** — Module requirement v33; `autoSizeStrategy` is the modern
replacement for a very widely blogged imperative pattern. Stale-example mass **high**.


**API check** — `autoSizeStrategy` used with its module; no imperative sizing in `onGridReady`.

**Browser check** — Columns fill the width on load with no right-hand gap; resizing the window keeps
it sensible. Console clean.

---

### S13 — Grouping and totals

**Prompt**
> Group the sales records by region and then by product, with collapsible groups. Show the total
> revenue and total units for each group and a grand total at the bottom. Ticking a group should tick
> everything inside it. Use AG Grid.

**The trap**
Enterprise, and a nest of v32.2/v33 deprecations that all still work: `groupSelectsChildren`,
`groupRemoveSingleChildren`, `suppressRowGroupHidesColumns`, `suppressMakeColumnVisibleAfterUnGroup`.

**Correct approach**
Row grouping and aggregation modules registered; `rowSelection.groupSelects: 'descendants'`;
`groupHideParentOfSingleChild` where relevant; grand total row via the current option.
*(Confirm current grand-total option name before running.)*

**Predicted failure modes**
- `groupSelectsChildren` — deprecated v32.2, "Use `rowSelection.groupSelects = "descendants"`"
- `groupSelectsFiltered` — deprecated v32.2
- `groupRemoveSingleChildren` — deprecated v33, "Use `groupHideParentOfSingleChild` instead."
- `suppressRowGroupHidesColumns` — deprecated v33
- Grouping configured without the enterprise modules registered
- Hand-rolled grouping of the data in React

**Recency / stale-example mass** — v32.2 and v33. Stale-example mass **high**. Grouping is the single
most common reason evaluators try enterprise.


**API check** — Modern grouping and selection options; none of the four deprecated options; modules
registered.

**Browser check** — Two-level collapsible grouping; per-group and grand totals correct; ticking a
group ticks its children. Console clean apart from the licence warning.

---

### S14 — Loading and empty states

**Prompt**
> The employee data comes from an API call that takes a second or two. While it is loading show a
> spinner over the grid, and if it comes back empty show a "No employees found" message. Handle the
> error case too. Use AG Grid.

**The trap**
`suppressLoadingOverlay` was deprecated at v32 in favour of `loading=false` — one of the older
deprecations in the set, and a good probe of whether age alone fixes things. Also whether the agent
uses the grid's overlay support at all or wraps it in its own conditional rendering.

**Correct approach**
`loading` grid option driving the built-in overlay; a no-rows overlay for the empty case.
*(Confirm current overlay-component option names before running.)*

**Predicted failure modes**
- `suppressLoadingOverlay` — deprecated v32, "Use `loading`=false instead."
- Imperative overlay show/hide API calls from effects
- Conditionally rendering the grid entirely, destroying and recreating it on every load
- Deprecated overlay-template string options

**Recency / stale-example mass** — v32, the oldest deprecation in the catalogue. Stale-example mass
**moderate**. Useful as the long-settled end of the recency axis.


**API check** — `loading` option used; no `suppressLoadingOverlay`; grid not conditionally unmounted.

**Browser check** — Spinner during load; message on empty; error path handled. Console clean.

---

### S15 — Export to Excel

**Prompt**
> Add a button that downloads the current view of the sales table as an Excel file, respecting
> whatever sorting and filtering the user has applied, with the currency column formatted as currency
> in the spreadsheet. Use AG Grid.

**The trap**
The community/enterprise boundary runs straight through this: CSV export is community, Excel export
is enterprise. An agent that does not know the split either fails to register the enterprise module
or silently delivers CSV renamed `.xlsx`.

**Correct approach**
`ExcelExportModule` (enterprise) registered; export API called with the relevant params.
*(Confirm current export API and module names before running.)*

**Predicted failure modes**
- CSV export module used and the file named `.xlsx`
- Excel export API called without the module registered
- Hand-rolled CSV string building from `rowData`, ignoring sort and filter state
- A third-party spreadsheet library installed instead

**Recency / stale-example mass** — Not a recent change. Included as bread-and-butter and as a clean
probe of community/enterprise boundary awareness.


**API check** — `ExcelExportModule` registered; grid export API used; no third-party library.

**Browser check** — Button downloads a file; sorting/filtering first is reflected in the output.
Console clean apart from the licence warning.

---

### S16 — Chart the selection *(lower priority)*

**Prompt**
> On the sales grid, let users select some cells and turn them into a chart from a right-click menu,
> with the chart appearing next to the grid. Use AG Grid.

**The trap**
Integrated charts requires `IntegratedChartsModule.with(AgChartsEnterpriseModule)` and a separate
`ag-charts-enterprise` install — a two-package composition that agents very rarely get right, and
which the grid reports explicitly
(`packages/ag-grid-community/src/validation/errorMessages/errorText.ts:220-223`).

**Correct approach**
`ag-charts-enterprise` installed; `IntegratedChartsModule.with(AgChartsEnterpriseModule)` registered
alongside `CellSelectionModule` and `ContextMenuModule`.

**Predicted failure modes**
- `IntegratedChartsModule` registered without `.with(...)`
- `ag-charts-enterprise` not installed
- `enableCharts` set with no modules
- Context menu module missing, so there is nothing to right-click

**Recency / stale-example mass** — The `.with()` composition arrived at v33. Stale-example mass
**moderate**. Marked lower priority: it is a headline enterprise feature evaluators do try, but it is
further from bread-and-butter than the rest of the catalogue.


**API check** — `.with(AgChartsEnterpriseModule)` present; `ag-charts-enterprise` in `package.json`;
cell selection and context menu modules registered.

**Browser check** — Select cells, right-click, create a chart, chart renders. Console clean apart
from the licence warning.

---

## 4. Results

To be filled in per run. One row per (scenario, run).

| Scenario | Run | Version | devValidations present | Browser | Console | API check | Verdict |
| -------- | --- | ------- | ---------------------- | ------- | ------- | --------- | ------- |

---

## 5. Open questions

- **Confirm-before-running list.** Several scenarios above cite API names I have flagged rather than
  verified against the source: the React `AgGridProvider` registration idiom (S01), quick-filter and
  filter module names (S03), cell-editor and invalid-value handling (S07), transaction and cell-flash
  options (S08), which React legacy registration APIs are removed versus deprecated (S09), pagination
  option names (S11), grand-total option (S13), overlay component options (S14), export API (S15).
  All must be pinned down from the repo before the first run — a wrong "correct approach" would
  invalidate the API check.
- **Recency axis coverage.** The catalogue spans v32 (S14) through v33 (S01, S02, S06, S12, S13, S16)
  with several timeless-but-core scenarios (S08, S10). Deliberately excluded: v34+ changes, which
  are all niche under the bread-and-butter rule, and which would in any case measure post-cutoff
  ignorance rather than stale-example mass.
- **Cross-model comparison.** Currently Opus 5 only. Whether to add other models later changes
  whether the conclusion is "agents get AG Grid wrong" or "Claude gets AG Grid wrong".
- **Docs-access arm.** Network is on for all runs. If results are poor, a no-network arm would
  separate "the model does not know" from "the docs did not help", but it doubles the run count.
