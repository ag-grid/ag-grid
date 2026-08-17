# Prompt

Show the salary as GBP with thousands separators, show the start date as DD/MM/YYYY, and add a
column showing how many whole years each person has been with the company. Sorting and filtering on
those columns has to work on the real underlying values, not on the text that is displayed.

# Code checks

CODE-1: Display formatting is done with `colDef.valueFormatter` on the salary and start date
        columns.
CODE-2: Formatting done only inside a `cellRenderer` is a fail, because it leaves the displayed text
        and the sorted/filtered value out of step.
CODE-3: Converting the data in `src/data.ts` into display strings — so that salary becomes a string
        or the start date becomes a formatted string — is a fail.
CODE-4: The years-of-service column is produced with `colDef.valueGetter`, computed from the start
        date. Adding a pre-computed field to the row data is a fail.
CODE-5: Salary remains a number and start date remains a `Date` in the data passed to the grid.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records.
BROWSER-2: A years-of-service column is present in addition to the original columns.
BROWSER-3: Salary cells show a currency symbol and thousands separators.
BROWSER-4: Start date cells are shown in DD/MM/YYYY order.
BROWSER-5: Sort the salary column ascending and confirm the ordering is numeric, not alphabetical: a
           value such as 900 must sort below 1,000, not above it.
BROWSER-6: The years-of-service column shows plausible whole numbers consistent with the start
           dates.
BROWSER-7: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
