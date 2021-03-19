---
title: "Excel Export - Master Detail"
enterprise: true
---

## Exporting to a Single Sheet

By default, exporting the master grid will just export the master rows. If you want to export detail rows, you can configure the `getCustomContentBelowRow` callback to generate a representation of the detail row that will be inserted below the master rows in the in the export. See the [export documentation](/export/) for more details.

There is an important difference between rendering and exporting Master / Detail content. When you expand a master row in the UI, a new instance of the Grid is created to render the detail, meaning that you have the full power of the Grid to sort, filter and format the detail data.

When exporting, the original data object representing the row is passed to `getCustomContentBelowRow` which returns styled content to be inserted into the export. No instance of the Grid is created. This means that export performance is good even with large Master / Detail data sets. However, if your `detailGridOptions` contains value getters, value formatters, sorting, filtering etc, and you want these to appear in the export, they must be applied by `getCustomContentBelowRow`.

[[note]]
| Since detail grids are full Grid instances, triggering an export through the right-click context menu on
| a detail grid will do a normal export for the detail grid only. If this is not appropriate for your application
| you can disable the export item in the context menu, or replace it with a custom item that triggers an export on
| the master grid.

The example below demonstrate how both master and detail data can be exported.

<grid-example title='Exporting Master / Detail Data' name='single-sheet' type='generated' options='{ "enterprise": true, "exampleHeight": 550, "modules": ["clientside", "masterdetail", "menu", "columnpanel", "clipboard", "excel"] }'></grid-example>

##  Exporting to multiple Sheets

Note the following:

- The `Master Detail` data is only available for `expanded` nodes, for more info see [Detail Grids](/master-detail-grids/).
- The `RowBuffer` was set to **100** so all Detail Grids would be available.
- The `Detail Grids` get exported into different sheets.

<grid-example title='Excel Export - Multiple Sheets with Master Detail' name='multiple-sheets' type='generated' options='{ "enterprise": true }'></grid-example>
