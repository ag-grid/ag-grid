# Prompt

Make the salary and department columns editable. Department should be picked from a dropdown listing
the departments that already appear in the data. When someone changes a value, keep the change in
the app's state so it survives other re-renders, and don't accept a salary below zero.

# Code checks

CODE-1: Editing is turned on through `colDef.editable` on the salary and department columns.
CODE-2: The department dropdown uses a grid cell editor — for example `'agSelectCellEditor'` with
        the options supplied via `cellEditorParams.values`, or the enterprise rich select editor.
        Building a plain HTML `<select>` inside a `cellRenderer` instead of using a cell editor is a
        fail.
CODE-3: The edit handler updates React state immutably. Mutating `params.data` in place, or
        assigning to a property of an existing row object, is a fail.
CODE-4: `getRowId` is supplied so the grid can match rows across updates.
CODE-5: The modules required for editing and for the chosen cell editor are registered, individually
        or via `AllCommunityModule`.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records.
BROWSER-2: The department dropdown offers exactly the departments that appear in the data, with no
           extra or missing options.
BROWSER-3: Double-clicking a salary cell opens an editor, and a new value entered there is still
           shown after interacting with something else on the page.
BROWSER-4: Double-clicking a department cell opens a dropdown listing the departments, and picking
           one changes the cell.
BROWSER-5: Attempting to set a salary below zero does not leave a negative value in the cell.
BROWSER-6: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
