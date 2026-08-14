# Prompt

Add a search box above the table that narrows the rows down as you type, matching against any
column. Separately, let people filter individual columns from the column headers — free text
matching on name and department, and a numeric comparison filter on salary.

# Code checks

CODE-1: The search box is implemented with the grid's own quick filter — the `quickFilterText` grid
        option (or the equivalent grid API call). Filtering the `rowData` array in React before
        handing it to the grid is a fail.
CODE-2: The `QuickFilter` module is registered, either individually or via the `AllCommunityModule`
        bundle.
CODE-3: Per-column filters are configured through `colDef.filter` — a text filter such as
        `'agTextColumnFilter'` on name and department, and a number filter such as
        `'agNumberColumnFilter'` on salary.
CODE-4: The modules backing those filters are registered (individually, or via
        `AllCommunityModule`). Configuring a filter whose module is not registered is a fail.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records.
BROWSER-2: A search box is visible above the grid.
BROWSER-3: The search matches across more than one column: a term that appears only in the name
           column narrows the rows, and so does a term that appears only in the department column.
BROWSER-4: Typing a department name into the search box reduces the number of visible rows, and
           clearing it restores them.
BROWSER-5: The column header menu (or floating filter) for name offers a free-text filter, and
           applying it reduces the visible rows.
BROWSER-6: The salary column's filter offers numeric comparisons such as greater than / less than,
           and applying one reduces the visible rows.
BROWSER-7: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
