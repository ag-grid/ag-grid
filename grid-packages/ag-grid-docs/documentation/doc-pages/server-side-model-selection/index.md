---
title: "SSRM Row Selection"
enterprise: true
---

Selecting rows and groups in the Server-Side Row Model is supported.
Just set the property `rowSelection` to either `'single'` or `'multiple'` as with any other row model.

## Example: Click Selection

The example below shows both simple 'click' selection as well as multiple 'shift-click' selections.

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

<api-documentation source='grid-callbacks/callbacks.json' section='callbacks' names='["isRowSelectable"]' ></api-documentation>

<grid-example title='Checkbox Example' name='checkbox' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## Providing Node IDs

For selection to work with Server-Side Row Model, you must provide Row ID's. This is done using the using the `getRowKey()` callback.

Without Row ID's provided, the grid would have no way of identifying Rows across loads. For example if a Sort is applied after a selection is made, which resulted in the rows getting reloaded, the grid needs to identify which rows to keep selection on in the new Row order.

When implementing `getRowKey()` you must ensure the rows have unique IDs across the entire data set. This means all the groups and all leaf-level nodes must have unique IDs, even if the leaves are not part of the same group.

## Selecting Group Nodes

Group nodes can be selected along with non-group nodes.

It is not possible to select all items in a group by selecting the group. When NOT using the Server-Side
Row Model (e.g. if using the default Client-side Row Model) it is possible to do this by setting
`groupSelectsChildren=true`. This is not possible in the Server-Side Row Model because the children
for a group may not be loaded into the grid. Without all the children loaded, it is not possible to select them all.

If you want selecting a group to also select children, this is something you will need to implement within the
application as it will require selecting rows that are not yet loaded into the grid, probably not even loaded
into the client.

## Next Up

Continue to the next section to learn how to [Change Columns](/server-side-model-changing-columns/).

