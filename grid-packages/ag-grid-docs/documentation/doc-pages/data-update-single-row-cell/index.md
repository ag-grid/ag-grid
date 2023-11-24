---
title: "Client-Side Data - Single Row / Cell Updates"
---

You can target updates to a single row or cell. Updating a single row means asking the grid to replace the data item for one specific row. Updating a cell means keeping the data item but asking the grid to replace one attribute of that data item.

Both single row and single cell updates are done by first getting a reference to the row's Row Node and then using the relevant Row Node API method. See [Accessing Data](/accessing-data/) on how to access Row Nodes.
Once you have access to the required Row Node, you update its data with the following Row Node API methods:

<api-documentation source='row-object/resources/reference.json' section='data' names='["setData", "updateData", "setDataValue"]'></api-documentation>

## View Refresh

After calling `rowNode.setData`, `rowNode.updateData` or `rowNode.setDataValue` the grid's view will automatically refresh to reflect the change. There is no need to manually request a refresh.

The main difference between `setData` and `updateData` is that `setData` will always refresh every cell, whereas `updateData` will only refresh cells whose values have changed. Additionally, `setData` will not cause changed cells to flash when `enableCellChangeFlash = true`.

## Sort / Filter / Group Refresh

After calling `rowNode.setData`, `rowNode.updateData` or `rowNode.setDataValue` the grid will not update to reflect a change in sorting, filtering or grouping.

To have the grid update its sort, filter or grouping call the Grid API `refreshClientSideRowModel()`.

If you want the grid to automatically update sorting, filter or grouping then you should consider using [Transaction Updates](/data-update-transactions/).

## Updating Rows / Cells Example

The example below demonstrates the following:

- **Set Price on Toyota:** The price value is updated on the Toyota row and the grid refreshes the cell.

- **Set Data on Ford:** The entire data is set on the Ford row and the grid refreshes the entire row. Updated cells do not flash (even though `enableCellChangeFlash = true`).

- **Update Data on Ford:** The entire data is updated on the Ford row and the grid refreshes the changed values in the row. Updated cells flash (as `enableCellChangeFlash = true`).

- **Sort:** Re-runs the sort in the Client-Side Row Model - to see this in action, sort the data first, then edit the data so the sort is broken, then hit this button to fix the sort.

- **Filter:** Re-runs the filter in the Client-Side Row Model - to see this in action, filter the data first, then
        edit the data so the filter is broken (i.e. a row is present that should not be present), then hit this button to fix the filter.

<grid-example title='Updating Row Nodes' name='updating-row-nodes' type='generated'></grid-example>

