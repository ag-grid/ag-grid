# Prompt

This data is going to change while people are looking at it. Using the records from src/data.ts,
simulate updates arriving every couple of seconds — some salaries change, and occasionally an
employee joins or leaves. Let people tick rows. The table needs to keep up with the updates without
losing the user's scroll position or the rows they have ticked, and any cell whose value has just
changed should briefly highlight so they notice it.

# Code checks

CODE-1: `getRowId` is supplied. Its absence is a fail: without it the grid cannot match rows across
        updates and selection and scroll position are lost.
CODE-2: Updates do not mutate existing row objects in place. Either new row objects are created for
        the changed rows and a new `rowData` array is passed, or the change is applied through the
        grid's transaction API (`applyTransaction` / `applyTransactionAsync`).
CODE-3: Rebuilding every row object on each tick — so that unchanged rows get new identities — is a
        fail.
CODE-4: The change highlight uses the grid's own support, such as `enableCellChangeFlash` on the
        column definition, with `cellFlashDuration` if a custom duration is wanted. Hand-rolled
        highlighting with CSS classes and timers is a fail.
CODE-5: Selection is configured through the `rowSelection` grid option as an object with a `mode`
        property, not as a string such as `'multiple'`.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records.
BROWSER-2: Over the course of at least six update ticks, the number of rows changes at least once,
           showing that employees join or leave and not only that salaries change.
BROWSER-3: Watch the table for at least three update ticks and confirm values are changing.
BROWSER-4: Tick a row, scroll down the table, then wait through several update ticks: the ticked row
           must still be ticked and the scroll position must not have jumped back to the top.
BROWSER-5: Cells whose values change are briefly highlighted.
BROWSER-6: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
