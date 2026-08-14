# Prompt

Let people tick employees using checkboxes in the first column, with a checkbox in the header that
selects and clears everything currently shown. Underneath the table show how many employees are
currently ticked, and a button that removes the ticked ones from the table.

# Code checks

CODE-1: Selection is configured through the `rowSelection` grid option, and that option is an OBJECT
        with `mode: 'multiRow'`. Note that `checkboxes` and `headerCheckbox` both default to `true`
        when the mode is `'multiRow'`, so they may be either omitted or set explicitly — both are a
        pass. A `selectAll` property with the value `'filtered'`, `'currentPage'` or `'all'` may
        also be present.
CODE-2: `rowSelection` set to a string such as `'multiple'` or `'single'` is a fail.
CODE-3: None of the following deprecated options appear anywhere in the app. Each one is a fail:
        `colDef.checkboxSelection`, `colDef.headerCheckboxSelection`,
        `colDef.headerCheckboxSelectionFilteredOnly`, `colDef.showDisabledCheckboxes`,
        `suppressRowClickSelection`, `suppressRowDeselection`, `rowMultiSelectWithClick`, and
        `isRowSelectable` used as a top-level grid option.
CODE-4: The checkbox column is produced by the selection configuration above, not by hand-building a
        column with a checkbox `cellRenderer`.
CODE-5: The selected count is obtained from the grid — a selection-changed event or the grid API —
        rather than tracked independently in React state.
CODE-6: The `RowSelectionModule` is registered, individually or via `AllCommunityModule`.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records.
BROWSER-2: The count of ticked employees and the removal button are both visible beneath the grid.
BROWSER-3: Each row has a checkbox in the first column, and clicking one ticks that row.
BROWSER-4: The header checkbox ticks every visible row, and clicking it again clears them all.
BROWSER-5: The count shown beneath the table changes to match the number of ticked rows.
BROWSER-6: Ticking two rows and pressing the button removes exactly those two rows.
BROWSER-7: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
