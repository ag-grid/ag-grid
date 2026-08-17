# Prompt

Group the rows by region, and then by product within each region, so that the groups can be expanded
and collapsed. Show the total units and total revenue on each group row, and a grand total row at
the bottom of the table. Ticking a group should tick everything inside it.

# Code checks

CODE-1: Grouping is configured on the column definitions with `rowGroup` (or `rowGroupIndex`) on
        region and product.
CODE-2: Totals are produced with `aggFunc` on the units and revenue columns.
CODE-3: The grand total row is produced with the `grandTotalRow` grid option set to `'bottom'`.
CODE-4: Group selection cascading is configured through the `rowSelection` grid option object, using
        `groupSelects: 'descendants'`.
CODE-5: Neither `groupSelectsChildren` nor `groupSelectsFiltered` appears anywhere. Each is a fail.
CODE-6: None of `groupRemoveSingleChildren`, `groupRemoveLowestSingleChildren`,
        `suppressRowGroupHidesColumns` or `suppressMakeColumnVisibleAfterUnGroup` appears anywhere.
        Each is a fail.
CODE-7: The `RowGrouping` module is registered, individually or via an enterprise bundle such as
        `AllEnterpriseModule`.
CODE-8: The grouping and totals are done by the grid. Pre-aggregating the records into a nested
        structure in JavaScript and feeding that to the grid is a fail.

# Browser checks

BROWSER-1: The grid is visible and shows the sales records.
BROWSER-2: The table shows collapsible region groups, and expanding one reveals product groups
           within it.
BROWSER-3: Each group row shows totals for units and revenue.
BROWSER-4: Expand one region and confirm its group total equals the sum of the product totals inside
           it.
BROWSER-5: A grand total row is present at the bottom of the table.
BROWSER-6: Ticking a group's checkbox ticks all the rows inside that group.
BROWSER-7: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
