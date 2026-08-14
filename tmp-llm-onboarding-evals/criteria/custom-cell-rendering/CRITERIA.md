# Prompt

In the salary column, show a horizontal bar whose length reflects that salary compared with the
highest salary in the data, with the salary number shown on top of the bar. Add a final column with
Edit and Archive buttons that call functions in my component and log which employee was clicked.

# Code checks

CODE-1: The custom cells are React function components passed to `colDef.cellRenderer`.
CODE-2: `frameworkComponents` does not appear anywhere in the app. It has been removed from AG Grid
        and its presence is a fail.
CODE-3: The `reactUi` grid option does not appear anywhere. It has been removed and its presence is
        a fail.
CODE-4: The renderer components are defined at module scope, or otherwise kept referentially stable
        across renders. Defining a renderer component inline inside the parent component's render
        body — so that a new component type is created on every render — is a fail.
CODE-5: The button handlers reach the component's functions through props, `context`, or a stable
        reference, and receive the correct row's data.

# Browser checks

BROWSER-1: The grid is visible and shows the employee records.
BROWSER-2: The salary column shows bars of visibly different lengths, with the longest bar on the
           highest salary, and the number is readable on top of each bar.
BROWSER-3: The final column shows Edit and Archive buttons on every row.
BROWSER-4: Clicking Edit on a specific row logs a message identifying that employee, and clicking
           Archive does likewise.
BROWSER-5: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
