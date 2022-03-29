---
title: "SSRM Row Selection"
enterprise: true
---

Selecting rows and groups in the Server-Side Row Model is supported.
Just set the property `rowSelection` to either `'single'` or `'multiple'` as with any other row model.

## Example: Click Selection

The example below shows both simple 'click' selection and multiple 'shift-click' selections.

- **Single 'Click' Selection** - when you click on a leaf level row, the row is selected.
- **Multiple 'Shift-Click' Selections** - select a leaf row (single click) and then 'shift-click' another leaf row within the same group to select all rows between that range.

<grid-example title='Click Selection' name='click-selection' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| Performing multiple row selections using 'shift-click' has the following restrictions:
|
| 1. Only works across rows that share the same parent.
| 1. Only works for rows that are loaded (e.g. a large range selection may span rows that are not loaded).


## Example: Checkbox Selection

Below shows another example using checkbox selection. The example shows checkboxes on the groups and a regular column.
This is for comparison in the example only. Normal applications generally have the checkbox on one column or the groups.

- Checkbox selection on the group column allowing selection of any row.
- Checkbox selection on the group sport column. Selection is restricted to leaf-level rows only via `gridOptions.isRowSelectable(rowNode)` callback.

<api-documentation source='grid-options/properties.json' section='selection' names='["isRowSelectable"]' ></api-documentation>

<grid-example title='Checkbox Example' name='checkbox' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Providing Row IDs

Row Selection in the Server-side Row Model requires unique Row IDs in order to correctly identify selected rows across
data loads. For example, if a sort is applied which results in new rows loaded, the grid needs to locate the previously
selected rows.

Row IDs are provided by the application using the `getRowId()` callback:

<api-documentation source='grid-options/properties.json' section='rowModels' names='["getRowId"]' ></api-documentation>

When implementing `getRowId()` you must ensure the rows have unique Row IDs across the entire data set. Using an ID that
is provided in the data such as a database Primary Key would be ideal.

### Supplying Unique Group IDs

When grouping there may not be an easy way to get unique Row IDs from the data for group levels. This is because a group
row doesn't always correspond to one Row in the store. 

To handle this scenario, the grid provides `parentKeys` and `level` properties in the `GetRowIdParams` supplied to `getRowId()`.

These can be used to create unique group id's as shown below:

<snippet suppressFrameworkContext=true>
|const gridOptions = {
|    getRowId: params => { 
|        // if leaf level, we have ID
|        if (params.data.id!=null) {
|            return params.data.id;
|        }
|        
|        // this array will contain items that will compose the unique key
|        var parts = [];
|
|        // if parent groups, add the value for the parent group
|        if (params.parentKeys){
|            parts.push(...params.parentKeys);
|        }
|        
|        // it we are a group, add the value for this level's group
|        var rowGroupCols = params.columnApi.getRowGroupColumns();
|        var thisGroupCol = rowGroupCols[params.level];
|        if (thisGroupCol) {
|            parts.push(params.data[thisGroupCol.getColDef().field]);
|        }
|        
|        return parts.join('-');
|    }
|}
</snippet>

The following example uses the `getRowId()` implementation shown above. Note the following:

- The **Row ID** column displays the id for the current row.
- Row IDs are deterministic, i.e. sorting on the **Gold** column reorders rows, but each row maintains its unique Row ID.
- Selected Rows remain selected after new rows are loaded, i.e. after sorting on the **Gold** column.

<grid-example title='Unique Group Ids' name='unique-group-ids' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Selecting Group Nodes

Group nodes can be selected along with non-group nodes.

It is not possible to select all items in a group by selecting the group. When NOT using the Server-Side
Row Model (e.g. if using the default Client-side Row Model) it is possible to do this by setting
`groupSelectsChildren=true`. This is not possible in the Server-Side Row Model because the children
for a group may not be loaded into the grid. Without all the children loaded, it is not possible to select them all.

Selecting a group where it selects all children is not supported out-of-the-box, this is something you will need to 
implement within the application as it will require selecting rows that are not yet loaded into the grid, probably 
not even loaded into the client.

## Next Up

Continue to the next section to learn how to [Change Columns](/server-side-model-changing-columns/).

