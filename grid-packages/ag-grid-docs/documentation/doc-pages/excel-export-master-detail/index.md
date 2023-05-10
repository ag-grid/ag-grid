---
title: "Excel Export - Master Detail"
enterprise: true
---

Excel Export provides ways to export Master/Detail grids to Excel.

## Exporting to a Single Sheet

By default, exporting the master grid will only export the master rows. If you want to include detail rows in the export, please use the `getCustomContentBelowRow` callback to generate a representation of the detail row that will be inserted below the master rows in the export.

There is an important difference between rendering and exporting Master / Detail content. When you expand a master row in the UI, a new instance of the Grid is created to render the detail, meaning that you have the full power of the Grid to sort, filter and format the detail data.

When exporting, the original data object representing the row is passed to `getCustomContentBelowRow` which returns styled content to be inserted into the export. In this case no separate instance of the Grid is created for the detail rows. This ensures good export performance even with large Master / Detail data sets. However, if your `detailGridOptions` contains value getters, value formatters, sorting, filtering etc and you want these to appear in the export, they must be applied inside `getCustomContentBelowRow`.

[[note]]
| Since detail grids are full Grid instances, triggering an export through the right-click context menu on
| a detail grid will do a normal export for the detail grid only. If this is not appropriate for your application
| you can disable the export item in the context menu, or replace it with a custom item that triggers an export on
| the master grid.

The example below demonstrates how both the master and detail data can be exported.

<grid-example title='Exporting Master / Detail Data' name='single-sheet' type='generated' options='{ "enterprise": true, "modules": ["clientside", "masterdetail", "menu", "columnpanel", "clipboard", "excel"], "exampleHeight": 550 }'></grid-example>

##  Exporting to Multiple Sheets

Note the following:

- The `Master Detail` data is only available for `expanded` nodes, for more info see [Detail Grids](/master-detail-grids/).
- The `RowBuffer` was set to **100** so all Detail Grids would be available.
- The `Detail Grids` get exported into different sheets.

Note the following:

- In this case we're not using the above approach with `getCustomContentBelowRow`, so the grid will be exported as-is. This means that detail data for a master-level row can be exported only if the master row is expanded. The `groupDefaultExpanded` property is set to 1 to expand the loaded master rows. For more information see [Detail Grids](../master-detail-grids/).

- The `RowBuffer` property is set to 100 to ensure that at least 100 master rows are loaded, so they can be expanded. If you have more than 100 master-level rows, you'll need to set this value accordingly to cover all master rows, so they can be expanded and their detail data can be included in the export.

- Each Detail grid gets exported into a separate sheet in the Excel file

<grid-example title='Excel Export - Multiple Sheets with Master Detail' name='multiple-sheets' type='generated' options='{ "enterprise": true, "modules": ["clientside", "masterdetail", "menu", "columnpanel", "clipboard", "excel"] }'></grid-example>

## Next Up

Continue to the next section: [Page Setup](../excel-export-page-setup/).