---
title: "View Refresh"
---

The grid has change detection. So as long as you are updating the data via the grid's API, the values displayed should be the most recent up to date values.

However sometimes you may be updating the data outside of the grids control. When you give data to the grid, the grid will not make a copy. Thus if you change the value of the data outside of the grid, the grid will also be impacted by that data change.

To deal with the scenario where the row data is changed without the grid being aware, the grid provides the following methods:


- **Refresh Cells**: `api.refreshCells(cellRefreshParams)` - Gets the grid to refresh all cells. Change detection will be used to refresh only cells whose display cell values are out of sync with the actual value. If using a [cellRenderer](/component-cell-renderer/) with a refresh method, the refresh method will get called.

- **Redraw Rows**: `api.redrawRows(redrawRowsParams)` - Removes the rows from the DOM and draws them again from scratch. The cells are created again from scratch. No change detection is done. No refreshing of cells is done.

Your preference should be to use `refreshCells()` over `redrawRows()`. Only use `redrawRows()` if you find `refreshCells()` doesn't suit your needs.

## Refresh Cells

To get the grid to refresh the cells, call `api.refreshCells()`. The interface is as follows:

<api-documentation source='grid-api/api.json' section='refresh' names='["refreshCells"]' ></api-documentation>


Each parameter is optional. The simplest is to call with no parameters which will refresh all cells using [change detection](/change-detection/) (change detection means it will only refresh cells whose values have changed).

### Example Refresh Cells

Below shows calling `api.refreshCells()` with different scenarios using a mixture of the `rowNodes`, `columns` and `force` parameters. From the example, the following can be noted:

- The grid has `enableCellChangeFlash=true`, so cells that are refreshed will be flashed.

- Column A has `suppressCellFlash=true` which means this column is excluded from the flashing.

- The grid has two pinned rows at the top and two pinned rows at the bottom. This is to demonstrate that cell refreshing works for pinned rows also.

- The three buttons each make use of a **scramble** operation. The scramble operation selects 50% of the cells at random and assigns new values to them. This is done outside of the grid so the grid has not been informed of the data changes. Each button then gets the grid to refresh in a different way.

- The **Scramble & Refresh All** button will scramble the data, then call `api.refreshCells()`. You will notice that randomly half the cells will flash as the change detection only update the cells who's underlying values have changed.

- The **Scramble & Refresh Left to Right** button will scramble as before, then call `api.refreshCells({columns})` 5 times, 100ms apart, once for each column. This will show the grid refreshing one column at a time from left to right.

- The **Scramble & Refresh Top to Bottom** button will scramble as before, then call `api.refreshCells({rowNodes})` 20 times, 100ms apart, once for each row (including pinned rows). This will show the grid refreshing one row at a time from top to bottom.

- The checkbox **Force Refresh** impacts how the above three refreshes work. If checked, all the cells will get refreshed regardless of whether they have changes. In other words, change detection will not be used as part of the refresh.

- The checkbox **Suppress Flash** impacts how the above three refreshes work. If checked, flashing will not occur on any cell.

<grid-example title='Refresh Cells' name='refresh-cells' type='generated'></grid-example>

[[note]]
| You may be wondering why would you want to force refresh, what is the point in refreshing a cell that
| has no changes? The answer is to do with cells that don't show underlying data or depend on something other
| than just the underlying data. One example is a cell that might contain action buttons (add, delete, send
| etc) and you might want to disable the action buttons if the logged in user changes role (if roles are tied
| to the functions), or if it's past 5pm and you don't want to allow such operations past a certain time. In
| this case you may wish to update the cells even though the underlying data has not changed.

## Redraw Rows

Redraw rows is a much heavier operation than refreshing cells. If refreshing cells meets your needs, then don't use redraw rows. A row redraw will rip the row out of the DOM and draw it again from scratch.

Use redraw row if you want to create the row again from scratch. This is useful when you have changed property that only gets used when the row is created for the first time such as:


- Whether the row is [fullWidth](/full-width-rows/) or not.
- The cellRenderer used for any cell (as this is specified once when the cell is created).
- You want to specify different styles for the row via the callbacks `getRowStyle()` or `getRowClass()`.

To get the grid to redraw rows, call `api.redrawRows()`. The interface is as follows:

<api-documentation source='grid-api/api.json' section='refresh' names='["redrawRows"]'></api-documentation>

### Example Redraw Nodes

Below shows calling `api.redrawRows()` with different to change the background color of the rows. From the example, the following can be noted:

- The **Redraw All Rows** redraws all the rows using a different background color by calling `api.redrawRows()` with no parameters.
- The **Redraw Top Rows** redraws only the top half of the rows by calling `api.redrawRows({rowNodes})`.

<grid-example title='Redraw Rows' name='redraw-rows' type='generated' options='{ "exampleHeight": 615 }'></grid-example>
