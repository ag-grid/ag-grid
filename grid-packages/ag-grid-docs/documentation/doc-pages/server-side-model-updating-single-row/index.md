---
title: "SSRM - Single Row Updates"
---

You can update a single row by using the row node `updateData` or `setData` functions.

<api-documentation source='row-object/resources/methods.json' section='rowNodeMethods' names='["updateData", "setData"]'></api-documentation>

## Updating Rows Example

The example below demonstrates a basic example, using the API's `forEachNode` function to iterate over all loaded nodes, and updating their version.

- **Set Data:** Sets the row data using `setData` and the grid refreshes the row, notably the cells won't flash with `enableCellChangeFlash`.

- **Update Data:** Updates the row data using `updateData` and the grid refreshes the row, notably the cells do flash with `enableCellChangeFlash`.

<grid-example title='Updating All Rows' name='updating-all-rows' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Single Row Updates

The following code snippet outlines the general approach, to iterate through all loaded row nodes and then update them directly using `rowNode.updateData(data)`:

<snippet>
|gridOptions.api.forEachNode(rowNode => {
|    if (idsToUpdate.indexOf(rowNode.data.id) >= 0) {
|        // arbitrarily update some data
|        const updated = rowNode.data;
|        updated.gold += 1;
|
|        // directly update data in rowNode
|        rowNode.updateData(updated);
|    }
|});
</snippet>

[[note]]
| Setting row data will NOT change the row node ID, so if you are using `getRowId()`
| and the data changes such that the ID will be different, the `rowNode` will not have its ID updated.

The example below shows this in action, note the following:

- The **Update Selected Rows** button will update the row version directly on the selected row nodes.

<grid-example title='Updating Selected Rows' name='updating-selected-row' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>