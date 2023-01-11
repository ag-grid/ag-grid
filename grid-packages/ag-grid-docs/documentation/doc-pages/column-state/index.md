---
title: "Column State"
---



[[only-javascript-or-angular-or-vue]]
|Column Definitions contain both stateful and non-stateful attributes. Stateful attributes can have their values changed by the grid (e.g. Column sort can be changed by the user clicking on the column header). Non-stateful attributes do not change from what is set in the Column Definition (e.g. once the Header Name is set as part of a Column Definition, it typically does not change).

[[only-react]]
|<video-section id="d9Kohpbt42M" title="React Column State" header="true">
|Column Definitions contain both stateful and non-stateful attributes. Stateful attributes can have their values changed by the grid (e.g. Column sort can be changed by the user clicking on the column header). Non-stateful attributes do not change from what is set in the Column Definition (e.g. once the Header Name is set as part of a Column Definition, it typically does not change).
|</video-section>

[[note]]
| The DOM also has stateful vs non-stateful attributes. For example consider a DOM element and setting 
| `element.style.width="100px"` will indefinitely set width to 100 pixels, the browser will not change this value. 
| However setting `element.scrollTop=200` will set the scroll position, but the browser can change the scroll
| position further following user interaction, thus scroll position is stateful as the browser can change
| the state.


The full list of stateful attributes of Columns are represented by the `ColumnStateParams` interface:

<interface-documentation interfaceName='ColumnStateParams' ></interface-documentation>

This section details how such state items can be manipulated without having to update Column Definitions.

## Save and Apply State {#save-and-apply}

There are two API methods provided for getting and setting Column State. `columnApi.getColumnState()` gets the current
column state and `columnApi.applyColumnState(params)` sets the column state.

<snippet>
// save the column's state
const savedState = gridOptions.columnApi.getColumnState();
// restore the column state
gridOptions.columnApi.applyColumnState({ state: savedState });
</snippet>

The example below demonstrates saving and restoring column state. Try the following:

1. Click 'Save State' to save the Column State.
1. Change some column state e.g. resize columns, move columns around, apply column sorting or row grouping etc.
1. Click 'Restore State' and the column's state is set back to where it was when you clicked 'Save State'.
1. Click 'Reset State' and the state will go back to what was defined in the Column Definitions.

<grid-example title='Save and Apply State' name='save-apply-state' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "columnpanel"] }'></grid-example>

## Column State Interface

The Column State method interfaces are as follows:

<api-documentation source='column-api/api.json' section='state' names='["getColumnState", "applyColumnState"]'></api-documentation>

## Partial State

It is possible to focus on particular columns and / or particular attributes when getting and / or applying a Column
State. This allows fine grained control over the Column State, e.g. setting what Columns are Pinned, without impacting
any other state attribute.

### Applying Partial State

When applying a Column State, in cases where some state attributes or columns are missing from the Column State,
the following rules apply:

- If a Column State is missing attributes, or attributes are provided as `undefined`, then those missing / undefined
attributes are not updated. For example if a Column has a Column State with just `pinned`, then Pinned is applied to
that Column but other attributes, such as Sort, are left intact.
- When state is applied and there are additional Columns in the grid that do not appear in the provided state, then the
`params.defaultState` is applied to those additional Columns.
- If `params.defaultState` is not provided, then any additional Columns in the grid will not be updated.

Combining these rules together leaves for flexible fine grained state control. Take the following code snippets as
examples:

<snippet>
// Sort Athlete column ascending
gridOptions.columnApi.applyColumnState({
    state: [
        {
            colId: 'athlete',
            sort: 'asc'
        }
    ]
});
// Sort Athlete column ascending and clear sort on all other columns
gridOptions.columnApi.applyColumnState({
    state: [
        {
            colId: 'athlete',
            sort: 'asc'
        }
    ],
    defaultState: {
        // important to say 'null' as undefined means 'do nothing'
        sort: null
    }
});
// Clear sorting on all columns, leave all other attributes untouched
gridOptions.columnApi.applyColumnState({
    defaultState: {
        // important to say 'null' as undefined means 'do nothing'
        sort: null
    }
});
// Clear sorting, row group, pivot and pinned on all columns, leave all other attributes untouched
gridOptions.columnApi.applyColumnState({
    defaultState: {
        // important to say 'null' as undefined means 'do nothing'
        sort: null,
        rowGroup: null,
        pivot: null,
        pinned: null
    }
});
// Order columns, but do nothing else
gridOptions.columnApi.applyColumnState({
    state: [
        { colId: 'athlete' },
        { colId: 'country' },
        { colId: 'age' },
        { colId: 'sport' }
    ],
    applyOrder: true
});
</snippet>

The example below shows some fine grained access to Column State.

<grid-example title='Fine Grained State' name='fine-grained-state' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "columnpanel"] }'></grid-example>

### Saving Partial State

Using the techniques above, it is possible to save and restore a subset of the parameters in the state.
The example below demonstrates this by selectively saving and restoring a) sort state and
b) column visibility and order state.

Note than when saving and restoring Sort state, other state attributes (width, row group, column order etc)
are not impacted.

Likewise when saving and restoring visibility and order, only visibility and order will be impacted when
re-applying the state.

<grid-example title='Selective State' name='selective-state' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "columnpanel"] }'></grid-example>

## Considerations

There are a few items to note on specific state attributes. They are as follows:

### **null** vs **undefined**

For all state attributes, `undefined` means _"do not apply this attribute"_ and `null` means _"clear this attribute"_.

For example setting `sort=null` will clear sort on a column whereas setting
`sort=undefined` will leave whatever sort, if any, that is currently present.

The only exception is with regards to Column Width. For width, both `undefined`
and `null` will skip the attribute. This is because width is mandatory - there
is no such things as a Column with no width.

### Width and Flex

When Flex is active on a Column, the grid ignores the `width` attribute when setting the width.

When `getColumnState()` is called, both `width` and `flex` are returned.
When `applyColumnState()` is called, if `flex` is present then `width` is
ignored.

If you want to restore a Column's width to the exact same pixel width as specified in the Column State,
set `flex=null` for that Column's state to turn Flex off.

### Row Group and Pivot

There are two attributes representing both Row Group and Pivot. First using the boolean attributes
`rowGroup` and `pivot` and then secondly using the index attributes `rowGroupIndex`
and `pivotIndex`.

When `getColumnState()` is called, all of `rowGroup`, `pivot`,
`rowGroupIndex` and `pivotIndex` are returned. When
`applyColumnState()` is called, preference is given to the index variants. For example
if both `rowGroup` and `rowGroupIndex` are present, `rowGroupIndex`
is applied.

## Column Events

Column Events will get raised when applying a Column State as these events would
normally get raised. For example `columnPinned` event will get raised if applying
the state results in a column getting pinned or unpinned.

The example below demonstrates events getting raised based on Column State changes.
The example logs event information to the console, so best open the example in
a new tab and observe the dev console.

<grid-example title='Column Events' name='column-events' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Column Group State

Column Group State is concerned with the state of Column Groups. There is only one state attribute for Column Groups,
which is whether the group is open or closed.

To get the state of Column Groups use the API method `columnApi.getColumnGroupState()`. To
set the Column Group state use the API method `columnApi.setColumnGroupState(stateItems)`.

<api-documentation source='column-api/api.json' section='state' names='["getColumnGroupState", "setColumnGroupState"]' ></api-documentation>

The example below demonstrates getting and setting Column Group State. Note the following:

- Clicking 'Save State' will save the opened / closed state of column groups.
- Clicking 'Restore State' will restore the previously saved state.
- Clicking 'Reset State' will reset the column state to match the Column Definitions,
i.e. all Column Groups will be closed.

<grid-example title='Column Group State' name='column-group-state' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>
