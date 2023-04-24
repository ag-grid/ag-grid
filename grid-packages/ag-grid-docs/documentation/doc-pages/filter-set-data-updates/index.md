---
title: "Set Filter - Data Updates"
enterprise: true
---

This section describes how changing data through [Cell Editing](/cell-editing/) and the application [Updating Data](/data-update/) impacts the Set Filter's values. This is only applicable when the Set Filter is taking its values from the grid's data.

## Row / Cell Updates

Row / Cell updates refers to any of the following:

- All edits via the grid's UI such as [Cell Editing](/cell-editing/) and [Clipboard Operations](/clipboard/).
- Using the grid's [Single Row / Cell Update API](/data-update-single-row-cell/) i.e. `rowNode.setData(data)` and `rowNode.setDataValue(col,value)` API methods.

Filter Values will be refreshed when data is updated through any of these methods.

Here are the rules that determine how Filter Values are selected:

- **Filter Inactive**: Before the update 'all' values in the filter were selected (as the filter was inactive). The filter list will be updated reflecting the data change and all values will remain selected leaving the filter inactive
- **Filter Active**: Before the update 'some' values in the filter were selected (as the filter was active). The filter list will be updated reflecting the data change, however previous selections will remain intact. If the update resulted in a new filter value, the new filter value will not be selected.

Cell editing does not re-execute filtering by default, so the row will not be filtered out even though the value in the cell is not selected in the filter. This default behaviour mimics how Excel works.

To execute filtering on cell edits, listen to `CellValueChanged` events and trigger filtering as shown below:

<api-documentation source='grid-events/events.json' section='editing' names='["cellValueChanged"]'></api-documentation>

<snippet>
const gridOptions = {
    onCellValueChanged: params => {
        // trigger filtering on cell edits
        params.api.onFilterChanged();
    }
}
</snippet>

The following example demonstrates Cell Editing with the Set Filter. Try the following:

**Without selecting any Filter Values:**

- Change (Cell Edit) a `'B'` cell value to `'X'` and note it gets added to the filter list and is **selected**.

**Click 'Reset' and deselect 'C' in the Filter List:**

- Change (Cell Edit) a `'B'` cell value to `'X'` and notice it gets added to the Filter List but it is **not selected**.
- Note that although `'X'` is not selected in the filter the row still appears in the grid. This is because grid filtering is not triggered for cell edits.

<grid-example title='Cell Editing Updates' name='cell-editing-updates' type='generated' options='{ "enterprise": true, "exampleHeight": 480, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Transaction Updates

Transaction Updates refers to any of the following:


- Updating data via [Transactions](/data-update-transactions/) API.
- Updating data via [Async Transactions](/data-update-high-frequency/) API.
- Changes to Row Data and providing [Row ID](/row-ids/) (as this uses Transactions underneath the hood).

Filter values are refreshed when data is updated using any of these methods.

Here are the rules that determine how filter values are selected:

- **Filter Inactive**: Before the update 'all' values in the filter were selected (as the filter was inactive). The filter list will be updated reflecting the data change and all values will remain selected leaving the filter inactive.

- **Filter Active**: Before the update 'some' values in the filter were selected (as the filter was active). The filter list will be updated reflecting the data change, however previous selections will remain intact. If the update resulted in a new filter value, the new filter value will not be selected.

Unlike [Cell Editing](#row--cell-updates), transaction updates will execute filtering in the grid.

The following example demonstrates these rules. Try the following:

**Without selecting any filter values:**

- Click **Update First Displayed Row**: this calls `api.applyTransaction()` and updates the value in the first row. Note `'AX'` now appears in the filter list and is **selected**.
- Click **Add New 'D' Row**: this calls `api.applyTransaction()` and adds a new row to the grid. Note `'D'` has been added to the filter list and is **selected**.

**Click 'Reset' and deselect 'C' in the Filter List:**

- Click **Update First Displayed Row**: this calls `api.applyTransaction()` and updates the value in the first row. Note `'AX'` now appears in the filter list and is **not selected**.
- Note that as `'AX'` is unselected in the filter list it has also been filtered out of the grid. This is because transaction updates also triggers grid filtering.
- Click **Add New 'D' Row**: this calls `api.applyTransaction()` and adds a new row to the grid. Note `'D'` has been added to the filter list and is **not selected**.

<grid-example title='Transaction Updates' name='transaction-updates' type='generated' options='{ "enterprise": true, "exampleHeight": 480, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Setting New Data

When `api.setRowData(data)` is called existing filter selections are kept when new rows are added. However it is possible to clear filter selections using: `api.setFilterModel([])`.

The following example demonstrates how `api.setRowData(data)` affects filter selections. Try the following:

- Deselect value 'B' from the set filter list and click the **Set New Data** button which calls `api.setRowData(newData)` to add new data with extra rows to the grid.

- Notice 'B' remains deselected after new data is supplied to the grid.

- Clicking **Reset** invokes `api.setRowData(origData)` to restore the original data but also clears any selections using `api.setFilterModel([])`.

<grid-example title='Setting New Data' name='setting-new-data' type='generated' options='{ "enterprise": true, "exampleHeight": 500, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Next Up

Continue to the next section to learn about the [Tree List](/filter-set-tree-list/).

