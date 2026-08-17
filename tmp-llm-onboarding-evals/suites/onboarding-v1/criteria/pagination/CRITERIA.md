# Prompt

There are a lot of records in this table now, so break it into pages, with a control that lets
people choose whether to see 20, 50 or 100 rows on each page.

# Code checks

CODE-1: The `pagination` grid option is set to `true`.
CODE-2: `paginationPageSize` is set, and `paginationPageSizeSelector` is set to `[20, 50, 100]`.
CODE-3: The `Pagination` module is registered, individually or via `AllCommunityModule`.
CODE-4: Pagination is not implemented by slicing the `rowData` array in React state and passing one
        page at a time to the grid. That is a fail, because sorting and filtering would then apply
        only to the visible page.

# Browser checks

BROWSER-1: The grid is visible and shows employee records.
BROWSER-2: Page controls are visible beneath the table, and moving to the next page shows a
           different set of rows.
BROWSER-3: The page size control offers 20, 50 and 100, and choosing a different value changes how
           many rows are displayed.
BROWSER-4: Sort a column, then check the first page: the ordering must reflect the whole dataset,
           not just a re-ordering of the rows that happened to be on that page.
BROWSER-5: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
