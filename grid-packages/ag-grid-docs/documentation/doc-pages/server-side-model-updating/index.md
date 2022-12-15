---
title: "SSRM Updating Data"
enterprise: true
---

It is possible to manage data updates using the Server-Side Row Model (SSRM). The different options for updating are as follows:

- [Single Row](#single-row-updates) - Update Attributes of a Single Row.
- [Transactions](/server-side-model-transactions/) - Add, remove and update rows in the grid.
- [High Frequency](/server-side-model-high-frequency/) - Apply transactions at high speed.

If using Infinite Scroll (`serverSideInfiniteScroll=true`) then [Transactions](/server-side-model-transactions/) and [High Frequency](/server-side-model-high-frequency/) updates are not permitted. The only available option for updating data when using Infinite Scroll is [Single Row Updates](#single-row-updates).

[[note]]
| The reason row inserts and removes are not allowed while using Infinite Scroll is that they impact the block boundaries.
| For example suppose a block of 100 rows is received from the server, and you try to insert 10
| rows into the middle of the block - this would result in 10 rows falling off the end of the block as they
| get pushed out. Similarly, if rows were removed, rows would be missing from the end of the block.
| 
| If you do need to insert or remove rows while using Infinite Scroll, then the update needs to be done on the server and then the grid should be refreshed. The example [Update & Refresh](#update--refresh) below demonstrates this.

If not using Infinite Scroll (`serverSideInfiniteScroll=false`), there are no restrictions, you can use any of the provided ways described here.

## Single Row Updates

The following code snippet outlines the general approach, to iterate through all loaded row nodes and then update them directly using `rowNode.setData(data)`:

<snippet>
|gridOptions.api.forEachNode(rowNode => {
|    if (idsToUpdate.indexOf(rowNode.data.id) >= 0) {
|        // arbitrarily update some data
|        var updated = rowNode.data;
|        updated.gold += 1;
|
|        // directly update data in rowNode
|        rowNode.setData(updated);
|    }
|});
</snippet>

[[note]]
| Setting row data will NOT change the row node ID, so if you are using `getRowId()`
| and the data changes such that the ID will be different, the `rowNode` will not have its ID updated.

The example below shows this in action where the following can be noted:


- **Update Selected Rows** - will update the medal count directly on the row nodes and then invoke the mock server with the updated rows.
- **Refresh** - will clear all loaded data and force a reload. Notice that the previously updated data will be returned from the server.

<grid-example title='Updating Row Data' name='updating-row-data' type='generated' options='{ "enterprise": true, "extras": ["lodash"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Update & Refresh

To add or remove records when using Infinite Scroll, the pattern is to update the original dataset
(typically on the server) and then get the grid to refresh.

The example below shows this in action where the following can be noted:

- The **Add Row** will add a row before the currently selected row.
- The **Remove Row** will remove the currently selected row.
- All operations are done outside the grid and the grid is then told to refresh.

<grid-example title='Server-Side Row Model & CRUD' name='crud' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Next Up

Continue to the next section to learn how to perform [Transactions](/server-side-model-transactions/).

