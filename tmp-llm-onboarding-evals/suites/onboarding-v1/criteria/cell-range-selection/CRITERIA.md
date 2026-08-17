# Prompt

I want spreadsheet-like behaviour on this table. I should be able to click and drag with the mouse
to select a rectangular block of cells, and there should be a small square at the corner of that
block which I can drag to copy the selected values over the neighbouring cells. Underneath the
table, show the total revenue of whatever cells are selected at the moment.

# Code checks

CODE-1: The behaviour is configured through the `cellSelection` grid option, set to an object — for
        example `{ handle: { mode: 'fill' } }` — or set to `true` with the handle configured
        alongside.
CODE-2: None of the following appear anywhere in the app. Each one is a fail:
        `enableRangeSelection`, `enableFillHandle`, `enableRangeHandle`,
        `suppressMultiRangeSelection`, `fillHandleDirection`, `fillOperation`,
        `suppressClearOnFillReduction`.
CODE-3: The selection-changed handler is `onCellSelectionChanged`. Use of `onRangeSelectionChanged`,
        `onRangeDeleteStart` or `onRangeDeleteEnd` is a fail.
CODE-4: The `CellSelectionModule` is registered, individually or via an enterprise bundle such as
        `AllEnterpriseModule`. Registering `RangeSelectionModule` is a fail.
CODE-5: Enterprise capability is brought in by registering modules, not by a bare side-effect
        `import 'ag-grid-enterprise'` on its own.

# Browser checks

BROWSER-1: The grid is visible and shows the sales records with region, product, quarter, units and
           revenue columns.
BROWSER-2: A total revenue figure for the current selection is visible beneath the grid.
BROWSER-3: Clicking one cell and dragging to another selects the rectangular block between them, and
           the block is visibly highlighted.
BROWSER-4: Select a block spanning three rows and including the revenue column, and confirm the
           figure shown beneath the table equals the sum of the revenue cells inside the selection.
           The prompt asks for total revenue, so summing only the revenue cells is correct; summing
           unrelated numeric columns such as units alongside it is not required and is not a pass
           condition either way.
BROWSER-5: A small square handle is visible at the corner of the selected block, and dragging it
           copies the selected values into the adjacent cells.
BROWSER-6: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
