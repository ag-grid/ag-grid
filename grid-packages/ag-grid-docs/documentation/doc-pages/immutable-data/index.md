---
title: "Client-Side Data - Immutable Data"
---

In some applications it's desirable to bind the grid's `rowData` property to an immutable store such that the grid's data is kept in sync with the store.

Under normal operation when new data is set into the grid (e.g. the `rowData` bound property is updated with new data) the grid assumes the new data is a brand new set of data. It is common for applications to desire this behaviour. However as explained in [Setting Fresh Row Data](/data-update/#setting-fresh-row-data) this can be undesirable as grid state (selected rows etc.) is lost.

For most applications, using grid [Transaction Updates](/data-update-transactions/) are what you should do if you want to make changes to the dataset rather than replace it. However this is not in line with how applications based on immutable stores desire to work.

In applications using immutable stores (e.g. React and Redux) it could be desirable to treat changes to the bound `rowData` as updates to the current dataset rather than a brand new dataset. The grid has a mode of operation where it does exactly this. It works out what rows are added, removed and updated when new row data is provided by inspecting the new row data. This mode is called Immutable Data Mode and is enabled by setting the property `immutableData=true`.

## How It Works

When in Immutable Data Mode, the grid assumes it is fed with data from an immutable store where the following is true about the data:


- Changes to a single row data item results in a new row data item object instance.
- Any changes within the list or row data results in a new list.

For the Immutable Data Mode to work, you must be providing IDs for the row nodes as explained in [Application Assigned IDs](/row-object/#application-assigned-ids).

The grid works out what changes need to be applied to the grid using the following rules:

- **IF** the ID for the new item doesn't have a corresponding item already in the grid **THEN** it's added as a new row to the grid.

- **IF** the ID for the new item does have a corresponding item in the grid **THEN** compare the object references. If the object references are different, the row is updated with the new data, otherwise it's assumed the data is the same as the already present data.

- **IF** there are items in the grid for which there are no corresponding items in the new data, **THEN** those rows are removed.

- Lastly the rows in the grid are sorted to match the order in the newly provided list.

## Example: Immutable Store

The example below shows an immutable store in action. The example keeps a store of data locally. Each time the user does an update, the local store is replaced with a new store with the next data, and then `api.setRowData(store)` is called. This results in the grid updating the current data rather than replacing because we have set `immutableData=true`.

If using bound properties with a framework, map the store to the `rowData` property instead of calling `api.setRowData(data)`.
 
The example demonstrates the following:


- **Reverse**: Reverses the order of the items.

- **Append Items**: Adds five items to the end.

- **Prepend Items**: Adds five items to the start.

- Note that if a grid sort is applied, the grid sorting order gets preference to the order of the data in the provided list.

- **Remove Selected**: Removes the selected items. Try selecting multiple rows (<kbd>Ctrl</kbd> + click for multiple, or <kbd>Shift</kbd> + click for range) and remove multiple rows at the same time. Notice how the remaining rows animate to new positions.

- **Update Prices**: Updates all the prices. Try ordering by price and notice the order change as the prices change. Also try highlighting a range on prices and see the aggregations appear in the status bar. As you update the prices, the aggregation values recalculate.

- **Turn Grouping On / Off**: To turn grouping by symbol on and off.

- **Group Selected A / B / C**: With grouping on, hit the buttons A, B and C to move selected items to that group. Notice how the rows animate to the new position.
 
<grid-example title='Simple Immutable Store' name='simple-immutable-store' type='mixed' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Example: Immutable Store - Large Dataset

Below is a dataset with over 11,000 rows with Row Grouping and Aggregation over three columns. As far as Client-Side Row Data goes, this is a fairly complex grid. From the example, note the following:

- Property `immutableData=true` to put the grid into Immutable Data Mode.
- Selecting the Update button updates a range of the data.
- Note that all grid state (row and range selections, filters, sorting etc.) remain after updates are applied.

<grid-example title='Complex Immutable Store' name='complex-immutable-store' type='mixed' options='{ "enterprise": true, "exampleHeight": 590, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Comparison to Transaction Updates

When in Immutable Data Mode and the grid receives new data, it creates a [Transaction Update](/data-update-transactions/) underneath the hood. In other words, once the grid has worked out what rows have been added, updated and removed, it then creates a transaction with these details and applies it. This means all the operational benefits to Transaction Updates equally apply to Immutable Data Mode.

There are however some difference with Immutable Data Mode and Transaction Updates which are as follows:

- When in Immutable Data Mode, the grid stores the data in the same order as the data was provided. For example if you provide a new list with data added in the middle of the list, the grid will also put the data into the middle of the list rather than just appending to the end. This decides the order of data when there is no grid sort applied. If this is not required by your application, then you can suppress this behaviour for a performance boost by setting `suppressMaintainUnsortedOrder=true`.

- There is no equivalent of [Async Transactions](/data-update-high-frequency/) when it comes to Immutable Data Mode. If you want a grid that manages high frequency data changes, it is advised to not use Immutable Data Mode and use [Async Transactions](/data-update-high-frequency/) instead.

