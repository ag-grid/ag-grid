---
title: "SSRM Row Selection"
enterprise: true
---

Selecting rows and groups in the Server-Side Row Model is supported.
Just set the property `rowSelection` to either `'single'` or `'multiple'` as with any other row model.

[[note]]
| Server-Side Row Selection requires [Row ID's](/server-side-model-configuration/#providing-row-ids) to be supplied to grid.

## Enabling Row Selection

Row selection can be enabled in the grid by setting the `rowSelection` property to `single` or `multiple`. The below example demonstrates this property configured as `multiple`, note the following:

- Selecting a single row can be achieved by clicking it. Clicking another row selects it and de-selects any other rows.
- Selecting multiple rows can be achieved by holding down <kbd>Ctrl</kbd> and mouse clicking the rows. A range of fully loaded rows can be selected by using <kbd>Shift</kbd>.

<grid-example title='Click Selection' name='click-selection' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Checkbox Selection

Checkboxes can be enabled on any column by setting `checkboxSelection: true` in the column defs. To enable a checkbox on a group column,
see the snippet on the [Row Selection](/javascript-data-grid/row-selection/#example-groups--checkbox-selection-with-unselectable-leaf-nodes) page.

The following example demonstrates checkbox selection with the SSRM. Note the following;

- Checkbox selection on the group column allowing selection of any group after 2004.
- Checkbox selection on the group sport column. Selection is again restricted to rows after 2004 only via `gridOptions.isRowSelectable(rowNode)` callback.

<api-documentation source='grid-options/properties.json' section='selection' names='["isRowSelectable"]' ></api-documentation>

<grid-example title='Checkbox Example' name='checkbox' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Header Checkbox Selection

The header select-all checkbox can be enabled by setting `headerCheckboxSelection: true` on any column. This checkbox will toggle the selection state of every node loaded into the grid.

The following example demonstrates select-all with the SSRM. Note the following;

- Selecting the header checkbox selects every node in the grid.
- Deselecting one node puts the header checkbox into an indeterminate state, clicking this again asserts every node is selected.

<grid-example title='Select-All Example' name='select-all' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| When using select-all, you should **not** use the api functions `getSelectedNodes()` or `getSelectedRows()`. See the API section for suggested alternatives.

## Group Selection

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

## Tree Data
Row selection is also supported when using tree data. See this documented on the [SSRM Tree Data](/server-side-model-tree-data/#selection-with-tree-data) page.

## Next Up

Continue to the next section to learn how to [Change Columns](/server-side-model-changing-columns/).

