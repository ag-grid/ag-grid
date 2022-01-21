---
title: "Excel Export - Columns"
enterprise: true
---

Excel Export allows you to select which columns get exported to Excel.

By default, all the currently visible columns in the grid are included in the Excel export. However, you can easily control which specific columns are exported to the Excel file.

## Column Headers

By default column headers and group column headers are included in the Excel export. However, you can suppress the export for column header rows using the `skipColumnGroupHeaders` and `skipColumnHeaders` properties to `true`.

Note the following:

- By default, all grouped column header rows and the column header row are exported.
- Group Headers will be skipped if Skip Column Group Headers is checked.
- Normal headers will be skipped if Skip Column Headers is checked.

<grid-example title='Excel Export - Column Headers' name='excel-export-column-headers' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu"], "exampleHeight": 815 }'></grid-example>

## Hidden Columns

By default, hidden columns are not included in the export. If you need all columns to be exported even if they're currently hidden in the grid, set the allColumns property to true.

Note the following:

- By default, **only visible columns will be exported**. The bronze, silver and gold columns will not.
- If `All Columns` is checked, the bronze, silver and gold columns will be included in the exported file.

<grid-example title='Excel Export - Hidden Columns' name='excel-export-hidden-columns' type='generated' options='{ "enterprise": true, "modules": ["clientside", "csv", "excel", "menu"], "exampleHeight": 815 }'></grid-example>

## Next Up

Continue to the next section: [Data Types](../excel-export-data-types/).