---
title: "Excel Export - Temp"
enterprise: true
---

## Default Excel Export

The same data that is in the grid gets exported, but none of the GUI representation of the data will be. What this means is:

- The raw values, and not the result of cell renderer will get used, meaning:
    - Value Getters will be used.
    - Cell Renderers will **NOT** be used.
    - Cell Formatters will **NOT** be used (use `processCellCallback` instead).

- Cell styles are not exported by default, see [Export Excel Style](/excel-export-styles/) for a detailed guide on how to export styles.

- If row grouping:

    - All data will be exported regardless of whether groups are open in the UI.
    - By default, group names will be in the format "-> Parent Name -> Child Name" (use `processRowGroupCallback` to change this).
    - Row group footers (`groupIncludeFooter=true`) will **NOT** be exported - this is a GUI addition only.


[[note]]
|1. The column width in Excel will be the same as the actual width of the column in the application at the time that the export happens, or 75px, whichever is wider. "Actual width" may be different from the width in the column definition if column has been resized or uses flex sizing. This can be overridden using the `columnWidth` export parameter.
|
| 1. The data types of your columns are passed to Excel as part of the export so that if you can to work with the data within Excel in the correct format.
|
|1. The cells of the column header groups are merged in the same manner as the group headers in AG Grid.


## Export Column Spanning

<grid-example title='Excel Export - Column Spanning' name='excel-export-column-spanning' type='generated' options='{ "enterprise": true }'></grid-example>


## Export Row Images

<grid-example title='Excel Export - Row Images' name='excel-export-row-images' type='generated' options='{ "enterprise": true }'></grid-example>