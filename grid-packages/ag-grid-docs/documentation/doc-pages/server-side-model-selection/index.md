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
- The selected rows are preserved when the grid is sorted or filtered and are displayed as selected when scrolled into view.  Select a row, apply a column filter so that the selected row is in the filter results and it will appear as selected in the filter results. If a selected row doesn’t match the applied filter, it will still be selected when the filter is removed.

<grid-example title='Click Selection' name='click-selection' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Checkbox Selection

Checkboxes can be enabled on any column by setting `checkboxSelection: true` in the column defs. To enable a checkbox on a group column,
see the snippet on the [Row Selection](/javascript-data-grid/row-selection/#example-groups--checkbox-selection-with-unselectable-leaf-nodes) page.

The following example demonstrates checkbox selection with the SSRM. Note the following;

- Checkbox selection on the group column allowing selection of any group after 2004.
- Checkbox selection on the group sport column. Selection is again restricted to rows after 2004 only via `gridOptions.isRowSelectable(rowNode)` callback.

<api-documentation source='grid-options/properties.json' section='selection' names='["isRowSelectable"]' ></api-documentation>

<grid-example title='Checkbox Selection' name='checkbox' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Header Checkbox Selection

The header select-all checkbox can be enabled by setting `headerCheckboxSelection: true` on any column. This checkbox will toggle the selection state of every node loaded into the grid.

The following example demonstrates select-all with the SSRM. Note the following;

- Selecting the header checkbox selects every row in the grid, even rows not matching the currently applied column filter (if one is applied). Setting `headerCheckboxSelectionFilteredOnly=true` or  `headerCheckboxSelectionCurrentPageOnly=true` is not supported when using the server-side row model.
- Deselecting one row puts the header checkbox into an indeterminate state, clicking this again asserts every row is selected.

<grid-example title='Header Checkbox Selection' name='select-all' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| When using header checkbox selection with the server-side row model, you should **not** use the api functions `getSelectedNodes()` or `getSelectedRows()`. See the [Selection API](/server-side-model-selection/#selection-api) section below for suggested alternatives.

## Group Selection

The grid can be configured to select children with their parents. This can be enabled by setting the grid property `groupSelectsChildren: true`.

The following example demonstrates `groupSelectsChildren` with the SSRM. Note the following;

- Selecting the `United States` group selects all of its children.
- Deselecting `United States` &rarr; `2004` also deselects all of its children, and puts the `United States` row in an indeterminate state.
- Changing the row group columns resets the selection state.

<grid-example title='Group Selection' name='group-selects-children' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

[[note]]
| When using group selection with the server-side row model, you should **not** use the api functions `getSelectedNodes()` or `getSelectedRows()`. See the [Selection API](/server-side-model-selection/#selection-api) section below for suggested alternatives.

### Transactions

When adding a new row via transaction, the new row will be treated as if it conforms to the parents selection. Therefore, if the parent row was selected the new row will be treated as selected upon creation. For indeterminate groups, this will follow the last non-indeterminate state. Note the following:

- When clicking the `Add new Aggressive` button, the new row is unselected
- After selecting the `Aggressive` group, new rows created by the `Add new Aggressive` button will be selected.
- After toggling one of the child rows of the `Aggressive` group, new rows follow the groups previous selection state.

<grid-example title='Transactions Example' name='group-selects-children-transactions' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Selection API

The following API functions exist for the Server-Side Row Model when using [Row Selection](/row-selection/#grid-selection-api). These can be used to get the currently selected rows and nodes if all of the selected rows have been loaded by the grid. These cannot be used while using `groupSelectsChildren` or when any select all functionality is required.

<api-documentation source='grid-api/api.json' section='selection' names='["getSelectedNodes", "getSelectedRows"]' ></api-documentation>

When using selection where all selected rows may not have been loaded, it is instead advised to use `api.getServerSideSelectionState` and `api.setServerSideSelectionState`, as these functions can be used to identify selected rows without having ever loaded the rows.

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

<grid-example title='Select All API' name='api-select-all' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

### Group Selection API

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


<grid-example title='Group Selection API' name='api-group-selects-children' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Tree Data
Row selection is also supported when using tree data. See this documented on the [SSRM Tree Data](/server-side-model-tree-data/#selection-with-tree-data) page.

## Next Up

Continue to the next section to learn how to [Change Columns](/server-side-model-changing-columns/).

