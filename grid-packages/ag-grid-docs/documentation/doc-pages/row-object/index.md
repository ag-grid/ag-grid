---
title: "Row Object (aka Row Node)"
---

A Row Node represents one row of data. The Row Node will contain a reference to the data item your application provided as well as other runtime information about the row. The Row Node contains attributes, methods and emits events. Additional attributes are used if the Row Node is a group.

<api-documentation source='reference.json'></api-documentation>

## Row Node Events

All events fired by the `rowNode` are synchronous (events are normally asynchronous). The grid is also listening for these events internally. This means that when you receive an event, the grid  may still have some work to do (e.g. if `rowTop` changed, the grid UI may still have to update to reflect this change). It is also best you do not call any grid API functions while receiving events from the `rowNode` (as the grid is still processing). Instead, it is best to put your logic into a timeout and call the grid in another VM tick.

When adding event listeners to a row, they will stay with the row until the row is destroyed. This means if the row is taken out of memory (pagination or virtual paging) then the listener will be removed. Likewise, if you set new data into the grid, all listeners on the old data will be removed.

Be careful when adding listeners to `rowNodes` in cell renderers that you remove the listener when the rendered row is destroyed due to row virtualisation. You can cater for this as follows:

```js
var renderer = function(params) {
    // add listener
    var selectionChangedCallback = function () {
        // some logic on selection changed here
        console.log('node selected = ' + params.node.isSelected());
    };

    params.node.addEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);

    // remove listener on destroy
    params.addRenderedRowEventListener('renderedRowRemoved', function() {
        params.node.removeEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
    }

    return params.value;
}
```

## Row Node IDs

Each Row Node is identified by a unique ID. The ID of the Row Node is used by the grid to identify the row and can be 
used by your application to look up the Row Node using the grid API `getRowNode(id)`.

### Grid Assigned IDs

By default IDs are assigned by the grid when data is set into the grid. The grid uses a sequence starting at 0 and 
incrementing by 1 to assign row IDs, so if for example there are three rows they will have IDs of `0`, `1` and `2`. 
The row ID is constant for as long as the data item lives in the grid.

When using [Row Grouping](/grouping/) the grid assigns IDs to the row groups as the row groups are created. It uses 
another sequence again starting at 0 and incrementing by 1 and also prefixes the sequence number with `row-group-`. 
So if for example there are three groups they will have IDs of `row-group-0`, `row-group-1` and `row-group-2`. If the 
groups are destroyed (eg the user removes the grouping) and recreated again (the user groups by a column) then new ID's 
will be created e.g. `row-group-3`, `row-group-4` and `row-group-5`. As with normal rows, the ID's for group rows do 
not change for as long as the row group exists, however removing and re-adding the grouping will result in new row 
group ID's even if the row group represents the same group as before.

### Application Assigned IDs

In some applications it is useful to tell the grid what IDs to use for particular rows. For example, if you are showing 
employees, you could configure the grid to use the Employee ID as the row node ID. That would then enable the grid 
API `getRowNode(id)` to be called with the Employee ID.

To get the grid to use application assigned IDs, implement the grid callback `getRowNodeId()`. The callback should 
return the ID for a particular piece of row data. For example, the following code snippet returns the value of 
attribute `'employeeId'` for the supplied data item:

<snippet>
const gridOptions = {
    getRowNodeId: (data) => data.employeeId
}
</snippet>

When providing IDs the following rules must be obeyed:

1. IDs must be unique
1. IDs must not change

If the attribute you are intending to use as an ID is either not unique or changes, it will cause unspecified behaviour in the grid. In other words, don't use a field that is not unique or can change.

If using [Row Grouping](/grouping/), the grid will always assign IDs for the group level (as there is not a one-to-one mapping with application-supplied row data). The callback `getRowNodeId()` is only used for non-group level rows.
