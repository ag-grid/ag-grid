# Prompt

Add a button that downloads what is currently shown in the table as an Excel file, keeping whatever
sorting and filtering the user has applied, and with the revenue column formatted as currency in the
spreadsheet.

# Code checks

CODE-1: The export uses the grid's Excel export capability: the `ExcelExportModule` is registered
        (individually or via an enterprise bundle) and the grid API's `exportDataAsExcel` is called.
CODE-2: Exporting CSV and naming the file `.xlsx` is a fail. Registering only `CsvExportModule` for
        this requirement is a fail.
CODE-3: Building the file by hand from `rowData`, or installing a third-party spreadsheet library,
        is a fail.
CODE-4: The currency formatting is applied through the Excel export's own styling options, not by
        converting the revenue values to strings before export.

# Browser checks

BROWSER-1: The grid is visible and shows the sales records.
BROWSER-2: A download button is visible.
BROWSER-3: A download button is visible and clicking it downloads a file with an .xlsx extension.
BROWSER-4: Apply a sort and a filter, then export again, and confirm the download is triggered
           without a console error.
BROWSER-5: Check the browser console. Aside from AG Grid enterprise licence messages, there must be
           no errors and no warnings — in particular no AG Grid deprecation warnings and no missing-
           module errors.
