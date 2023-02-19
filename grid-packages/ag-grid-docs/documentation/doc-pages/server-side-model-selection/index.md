---
title: "SSRM Row Selection"
enterprise: true
---

Selecting rows and groups in the Server-Side Row Model is supported.
Just set the property `rowSelection` to either `'single'` or `'multiple'` as with any other row model.

## Enabling Row Selection

Row selection can be enabled in the grid by setting the `rowSelection` property to `single` or `multiple`. The below example demonstrates this property configured as `multiple`, note the following:

- **Single 'Click' Selection** - when you click on a leaf level row, the row is selected.
- **Multiple 'Shift-Click' Selections** - select a leaf row (single click) and then 'shift-click' another leaf row to select all rows between that range.

<grid-example title='Click Selection' name='click-selection' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| Performing multiple row selections using 'shift-click' will only work if every row in the range has been successfully loaded.

## Checkbox Selection

Checkboxes can be enabled on any column by setting `checkboxSelection: true` in the column defs. To enable a checkbox on a group column,
see the snippet on the [Row Selection](/javascript-data-grid/row-selection/#example-groups--checkbox-selection-with-unselectable-leaf-nodes) page.

The following example demonstrates checkbox selection with the SSRM. Note the following;

- Checkbox selection on the group column allowing selection of any group after 2004.
- Checkbox selection on the group sport column. Selection is again restricted to rows after 2004 only via `gridOptions.isRowSelectable(rowNode)` callback.

<api-documentation source='grid-options/properties.json' section='selection' names='["isRowSelectable"]' ></api-documentation>

<grid-example title='Checkbox Example' name='checkbox' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Select-all

The select-all checkbox can be enabled by setting `headerCheckboxSelection: true` on any column. This checkbox will toggle the selection state of every node loaded into the grid.

The following example demonstrates select-all with the SSRM. Note the following;

- Selecting the header checkbox selects every node in the grid.
- Deselecting one node puts the checkbox into an indeterminate state, clicking this again asserts every node is selected.

<grid-example title='Select-All Example' name='select-all' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| When using select-all, you should **not** use the api functions `getSelectedNodes()` or `getSelectedRows()`. See the API section for suggested alternatives.

## Groups Select Children

The grid can be configured to select children with their parents. This can be enabled by setting the grid property `groupSelectsChildren: true`.

The following example demonstrates `groupSelectsChildren` with the SSRM. Note the following;

- Selecting the `United States` group selects all of its children.
- Deselecting `United States` &rarr; `2004` also deselects all of its children, and puts the `United States` row in an indeterminate state.

<grid-example title='Group Selects Children Example' name='group-selects-children' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| When using `groupSelectsChildren`, you should **not** use the api functions `getSelectedNodes()` or `getSelectedRows()`. See the API section for suggested alternatives.

## Selection API

The below API functions exist for the Server-Side Row Model when using selection. Unlike the Client-Side Row Model, they provide and retrieve a set of rules to determine the selected rows. This is because the grid is not necessarily aware of all of the rows in the grid, and so cannot work exclusively with IDs.

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["getServerSideSelectionState", "setServerSideSelectionState"]' ></api-documentation>

### API Selection

The below snippet demonstrates how to set all nodes as selected, except for the row which has the ID `United States`, and the row with the ID `United States2004`.

<snippet spaceBetweenProperties="true">
gridOptions.api.setServerSideSelectionState({
    selectAll: true,
    toggledNodes: ['United States', 'United States2004'],
});
</snippet>

In the example below, note the following;
 - The above snippet has been included inside of the `firstDataRendered` callback, which sets the initial selection state.
 - The `Save Selection` button has been configured to store the result of `api.getServerSideSelectionState()`, it also logs the saved state to the console when clicked.
 - The `Load Selection` button can subsequently re-apply the previously saved selection rules using `api.setServerSideSelectionState(state)`.

<grid-example title='API Select-All Example' name='api-select-all' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

### Group Selects Children API Selection

The below snippet demonstrates how to set all nodes as selected, except for the row which has the ID `United States`, and its child row with the ID `United States2004`.

<snippet spaceBetweenProperties="true">
params.api.setServerSideSelectionState({
    // this root level config can be used to determine a global select-all
    selectAllChildren: true,
    // all of the top level group nodes which do not conform with the select all value will have an entry here
    // including indeterminate nodes
    toggledNodes: [{
        // as this is a group node with toggledNodes, this node will be marked as indeterminate
        nodeId: 'United States',
        // selectAllChildren can be used to determine whether this groups children are all selected
        selectAllChildren: false,
        toggledNodes: [{
            // this group node has no toggledNodes, and so it will respect its own `selectAllChildren` property along
            // with its descendants.
            nodeId: 'United States2004',
            selectAllChildren: true,
        }],
    }],
});
</snippet>

In the example below, note the following;
 - The above snippet has been included inside of the `firstDataRendered` callback, which sets the initial selection state.
 - The `Save Selection` button has been configured to store the result of `api.getServerSideSelectionState()`, it also logs the saved state to the console when clicked.
 - The `Load Selection` button can subsequently re-apply the previously saved selection rules using `api.setServerSideSelectionState(state)`.


<grid-example title='API Group Selects Children Example' name='api-group-selects-children' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

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

