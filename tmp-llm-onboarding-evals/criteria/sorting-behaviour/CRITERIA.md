# Prompt

Change how sorting works on this table. Clicking a column header should sort largest-or-last first,
clicking again should reverse it, and a third click should return the table to its original order.
Also show an icon on the columns that are not currently sorted, so people realise they can be
sorted.

# Code checks

CODE-1: `sortingOrder` is set on `defaultColDef` (or on individual column definitions), with the
        value `['desc', 'asc', null]`.
CODE-2: `unSortIcon` is set on `defaultColDef` (or on individual column definitions).
CODE-3: Setting `sortingOrder` as a top-level grid option is a fail.
CODE-4: Setting `unSortIcon` as a top-level grid option is a fail.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records.
BROWSER-2: The first click on a column header sorts it descending (largest or last value at the
           top).
BROWSER-3: The second click sorts it ascending.
BROWSER-4: The third click returns the rows to their original order.
BROWSER-5: Columns that are not currently sorted display a sort icon.
BROWSER-6: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
