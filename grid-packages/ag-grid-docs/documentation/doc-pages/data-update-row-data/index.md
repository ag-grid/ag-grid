---
title: "Updating Row Data"
---

Update the Row Data inside the grid by updating the `rowData` grid property or by calling the grid API `setRowData()`.

The example below shows the data with two sets of data. Clicking the buttons toggles between the data sets. Some rows are common between the dataset, however if any row is selected (by clicking the row), the selection is lost between row updates.

<grid-example title='Simple Row Data' name='simple-row-data' type='generated' options=' { "modules": ["clientside"] }'></grid-example>

The example below is identical to the above except [Row IDs](/row-ids/) are provided via the `getRowId()` callback. This results in Row Selection being maintained across Row Data changes (assuming the Row exists in both sets) and the HTML is not redrawn from scratch, resulting in a Row Animation (`animateRows=true`) of the rows.

[[only-react]]
|[[note]]
|| Provide Row ID's to avoid flicker when refreshing. If you do not provide Row ID's, then the HTML for all Rows is redrawn from scratch.

<grid-example title='Simple Row ID' name='simple-row-id' type='generated' options=' { "modules": ["clientside"] }'></grid-example>

Providing [Row IDs](/row-ids/) allows the grid to work optimally in a few areas which are outlined as follows:


| Function | Row IDs Missing | Row IDs Provided | 
| ----------------------------- | ------------------------- | ------------------------ | 
| Row Selection | Row Selection lost | Row Selection maintained |
| Row Grouping | Row Groups re-created, all open groups closed | Groups kept / updated, open groups stay open |
| Row Refresh | All rows destroyed from the DOM and recreated, flicker may occur | Only changed rows are updated in the DOM |
| Row Animation | No row animation | Moved rows animate to new position |
| Flashing Cells | No flashing available, all cells are created from scratch | Changed values can be flashed to show change |


## Controlling Row Position

The example below shows controlling the grid rows, including it's order, by updating the Row Data.

The example keeps a list of records to mimic data in "a store". Each time the user does an update, the data in the store is copied, so that when Row Data is given to the grid, the grid is presented with different Row Data. This is equivalent to refreshing data from a server, or using an Immutable Data store on the client. 

Note the following.

- **Reverse**: Reverses the order of the items. The rows are moved rather than recreated. No flicker.

- **Append Items**: Adds five items to the end. The rows are moved rather than recreated. No flicker.

- **Prepend Items**: Adds five items to the start. No flicker.

- Note that if a grid sort is applied, the grid sorting order gets preference to the order of the data in the provided list.

- **Remove Selected**: Removes the selected items. Try selecting multiple rows (<kbd>Ctrl</kbd> + click for multiple, or <kbd>Shift</kbd> + click for range) and remove multiple rows at the same time. Notice how the remaining rows animate to new positions.

- **Update Prices**: Updates all the prices. Try ordering by price and notice the order change as the prices change. Also try highlighting a range on prices and see the aggregations appear in the status bar. As you update the prices, the aggregation values recalculate.

- **Turn Grouping On / Off**: To turn grouping by symbol on and off.

- **Group Selected A / B / C**: With grouping on, hit the buttons A, B and C to move selected items to that group. Notice how the rows animate to the new position.
 
<grid-example title='Simple Immutable Store' name='simple-immutable-store' type='mixed' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>



## How It Works

When providing Row IDs, the grid assumes it is fed with data from an immutable store where the following is true about the data:

- Changes to a single row data item results in a new row data item object instance.
- Any changes within the list or row data results in a new list.

The grid works out what changes need to be applied to the grid using the following rules:

- If the ID for the new item doesn't have a corresponding item already in the grid then it's added as a new row to the grid.

- If the ID for the new item does have a corresponding item in the grid then compare the object references. If the object references are different, the row is updated with the new data, otherwise it's assumed the data is the same as the already present data.

- If there are items in the grid for which there are no corresponding items in the new data, then those rows are removed.

- Lastly the rows in the grid are sorted to match the order in the newly provided list.

## Example: Immutable Store - Large Dataset

Below is a dataset with over 11,000 rows with Row Grouping and Aggregation over three columns. As far as Client-Side Row Data goes, this is a fairly complex grid. From the example, note the following:

- Row IDs are provided using the callback `getRowId()`.
- Selecting the Update button updates a range of the data.
- Note that all grid state (row and range selections, filters, sorting etc.) remain after updates are applied.

<grid-example title='Complex Immutable Store' name='complex-immutable-store' type='mixed' options='{ "enterprise": true, "exampleHeight": 590, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Comparison to Transaction Updates

When setting Row Data and not providing Row IDs, the grid rips all data out of the grid and starts from scratch with the new Row Data.

However when providing Row IDs and updating Row Data, the grid creates a [Transaction Update](/data-update-transactions/) underneath the hood. In other words, once the grid has worked out what rows have been added, updated and removed, it then creates a transaction with these details and applies it. This means all the operational benefits to Transaction Updates equally apply to setting Row Data with providing Row IDs.

There are however some differences with updating Row Data (with Row IDs) and Transaction Updates. These differences are as follows:

- When setting Row Data, the grid will have the overhead of identifying what rows are added, removed and updated.

- When setting Row Data, the grid stores the data in the same order as the data was provided. For example if you provide a new list with data added in the middle of the list, the grid will also put the data into the middle of the list rather than just appending to the end. This decides the order of data when there is no grid sort applied. If this is not required by your application, then you can suppress this behaviour for a performance boost by setting `suppressMaintainUnsortedOrder=true`.

- There is no equivalent of [Async Transactions](/data-update-high-frequency/) when it comes to updating Row Data. If you want a grid that manages high frequency data changes, do not update Row Data directly, use [Async Transactions](/data-update-high-frequency/) instead.

For the reasons mentioned above, if you have large data sets (thousands of rows) and are looking for ways to make things go faster, consider using [Transaction Update](/data-update-transactions/).

If you have smaller data sets (hundreds of rows) then everything should work without any noticeable lag.