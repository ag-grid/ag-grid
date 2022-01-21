---
title: "Flashing Cells"
---

The grid can flash cells to highlight data changes. This is a great visual indicator to users of the grid who want data changes to be noticed.

To enable cell flashing on data changes for a particular column, set the attribute `enableCellChangeFlash=true` on the column definition.

You can also explicitly flash cells using the grid API `flashCells(params)`. The params takes a list of columns and rows to flash, the flashDelay and the fadeDelay values e.g. to flash one cell pass in one column and one row that identifies that cell.

<api-documentation source='grid-api/api.json' section='refresh' names='["flashCells"]'></api-documentation>

The example below demonstrates cell flashing. The following can be noted:

- All columns have `enableCellChangeFlash=true` so changes to the columns values will flash.
- Clicking **Update Some Data** will update a bunch of data. The grid will then flash the cells where data has changed.
- Clicking **Flash One Cell** provides the API `flashCells()` with one column and one row to flash one cell.
- Clicking **Flash Two Rows** provides the API `flashCells()` with two row nodes only to flash the two rows.
- Clicking **Flash Two Columns** provides the API `flashCells()` with two columns only to flash the two columns.

<grid-example title='Flashing Data Changes' name='flashing-data-changes' type='generated' options='{  }'></grid-example>

## How Flashing Works

Each time the call value is changed, the grid adds the CSS class `ag-cell-data-changed` for 500ms by default, and then then CSS class `ag-cell-data-changed-animation` for 1,000ms by default. The grid provided themes use this to apply a background color.

If you want to override the flash background color, this has to be done by overriding the relevant CSS class. There are two ways to change how long a cell remains "flashed".

1. Change the `cellFlashDelay` and `cellFadeDelay` configs in the gridOptions
1. When calling `flashCells()`, pass the `flashDelay` and `fadeDelay` values (in milliseconds) as params.

The example below demonstrates flashing delay changes. The following can be noted:


- The `cellFlashDelay` value has been changed to 2000ms, so cells will remain in their "flashed" state for 2 seconds.
- The `cellFadeDelay` value has been changed to 500ms, so the fading animation will happen faster than what it normally would (1 second).
- Clicking **Update Some Data** will update some data to demonstrate the changes mentioned above.
- Clicking **Flash Two Rows** will pass a custom `flashDelay` of 3000ms and a custom `fadeDelay` delay of 2000ms to demonstrate default values can be overridden.

<grid-example title='Changing Flashing Delay' name='flashing-delay-changes' type='generated' options='{  }'></grid-example>

## Filtering & Aggregations

One exception to the above is changes due to filtering. If you are [Row Grouping](/grouping/) the data with [Aggregations](/aggregation/), then the aggregated values will change as filtering adds and removes rows contained within the groups. It typically doesn't make sense to flash these changes when it's due to a filter change, as filtering would impact many (possibly all) cells at once, thus not usefully bringing the users attention to any particular cell. If you do not like this exception and would like to flash changes even when it's the result of a filter change, then set grid property `allowShowChangeAfterFilter=true`.

## Flashing Cells vs Custom Cell Renderers

Flashing cells is a simple and quick way to visually show to the user that the data has changed. It is also possible to have more intelligent animations by putting animations into custom [Cell Renderers](/component-cell-renderer/). Cell Renderers have a `refresh` method that gets called when data changes, allowing custom animations to highlight data changes.


The grid comes with two such Cell Renderers for showing data changes which are detailed in the [Change Cell Renderers](/change-cell-renderers/) section.
