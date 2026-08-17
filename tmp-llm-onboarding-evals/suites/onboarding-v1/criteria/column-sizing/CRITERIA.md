# Prompt

When the page first loads, the columns should fill the width of the window with no empty space on
the right hand side, and each column should be wide enough for the content it holds. It should still
look sensible after the window is resized.

# Code checks

CODE-1: Initial sizing is declared through grid configuration rather than imperative calls: either
        the `autoSizeStrategy` grid option, or `flex` on the column definitions, or a combination.
CODE-2: If `autoSizeStrategy` is used, the `ColumnAutoSize` module is registered, individually or
        via `AllCommunityModule`.
CODE-3: Calling sizing APIs imperatively from an `onGridReady` handler to achieve the initial fit is
        the outdated approach and is a fail.
CODE-4: Adding a manual `window` resize listener to re-size the columns is a fail; the grid handles
        resizing itself.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records.
BROWSER-2: On load, the columns span the full width of the grid with no empty gap to the right of
           the last column.
BROWSER-3: Column widths look appropriate to their content, with no heading or value obviously
           clipped.
BROWSER-4: Resize the browser window narrower and confirm the columns still fill the width with no
           gap.
BROWSER-5: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
