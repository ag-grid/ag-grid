---
title: "Updating Column Definitions"
---

The section [Column Definitions](/column-definitions/) explained how to configure columns. It is possible to change the
configuration of the Columns after they are initially set. This section goes through how to update Column Definitions.

## Adding & Removing Columns {#adding-removing-columns}

It is possible to add and remove columns by updating the list of Column Definitions provided to the grid.

When new columns are set, the grid will compare with current columns and work out which columns are old (to be removed),
new (new columns created) or kept.

The example below demonstrates adding and removing columns from a grid. Note the following:

- Selecting the buttons to toggle between including or excluding the medal columns.

<grid-example title='Add & Remove Columns' name='add-remove-columns' type='mixed' options='{ "modules": true }'></grid-example>

In the example above, note that any state applied to any column (e.g. sort, filter, width, column position) will be kept
if the column still exists after the new definitions are applied. For example try the following:

- Resize Country column. Note changing columns doesn't impact its width.
- Move Country column. Note changing columns doesn't impact its position.
- Sort Country column. Note changing columns doesn't impact its sort.

## Updating Column Definitions {#changing-column-definition}

All properties of a column definition can be updated. For example if you want to change the Header Name of a column, you
update the `headerName` on the Column Definition and then set the list of Column Definitions into the grid again.

It is not possible to update the Column Definition of just one column in isolation. Only a new set of Column Definitions
can be applied.

The example below demonstrates updating column definitions to change how columns are configured. Note the following:

- All Columns are provided with just the `field` attribute set on the Column Definition.
- 'Set Header Names' and 'Remove Header Names' sets and then subsequently removes the `headerName` attribute on all
Columns.
- 'Set Value Formatter' and 'Remove Value Formatter' sets and then subsequently removes the `valueFormatter` attribute
on all Columns.
- Headers refresh whenever new columns are set. However cells do not refresh, thus a call to
`api.refreshCells({ force: true })` is required. The refresh is forced so cells will be refreshed even though the
underlying value for that cell hasn't changed.
- Note that any resizing, reordering, sorting etc of the Columns is kept intact between updates to the Column Definitions.

<grid-example title='Updating Column Definition' name='update-column-definition' type='mixed' options='{ "modules": true }'></grid-example>

## Changing Column State

Parts of the Column Definitions represent Column State. Column State is stateful information and represents changing
values of the grid.

All stateful attributes of Column Definitions are as follows:

| Stateful Attribute | Initial Attribute | Description |
|-|-|-|
| width | initialWidth | Width of the column. |
| flex | initialFlex | The flex value for setting this column's width. |
| hide | initialHide | Whether this column should be hidden. |
| pinned | initialPinned | Whether this column should be pinned. |
| sort | initialSort | The sort to apply to this column. |
| sortIndex | initialSortIndex | The order to apply sorting, if multi column sorting. |
| rowGroup | initialRowGroup | Whether this column should be a row group. |
| rowGroupIndex | initialRowGroupIndex | Whether this column should be a row group and in what order. |
| pivot | initialPivot | If this column should be a pivot. |
| pivotIndex | initialPivotIndex | Whether this column should be a pivot and in what order. |
| aggFunc | initialAggFunc | The function to aggregate this column by if row grouping or pivoting. |

[[note]]
| If you are interested in changing Column State only and not the other parts of the column definitions, then consider
| working with the [Column State](/column-state/) API instead.
|
| Column State is provided as part of Column Definitions to enable these properties to be reactive. Some developers wish
| to update Column Definitions and expect the grid to respond. Other developers may find this non-intuitive and will
| prefer interacting with [Column State](/column-state/) directly.

The **Initial Attribute** will be used only when the **Column is Created** only. The **Stateful Attribute** will be used
when the **Column is Created or Updated**.

<snippet suppressFrameworkContext=true>
const gridOptions = {
    columnDefs: [
        // using initial values, get applied when Column is created
        { field: 'country', initialWidth: 200, initialPinned: 'left' },
        // using stateful values, get applied when Column is created or updated
        { field: 'country', width: 200, pinned: 'left' }
    ]
}
</snippet>

The example below shows Column Definitions using **initial attributes**. Note the following:

- The `initialWidth`, `initialSort` and `initialPinned` is applied only when the columns are created.
- If you update the width, sort or pinned of a column by interacting with the grid's UI and then hit 'Set Columns with
Initials', the columns state will not change.
- Removing the columns first and then setting them again will use the initial values again.

<grid-example title='Updating Column Initial Attributes' name='changing-default' type='mixed' options='{ "modules": true }'></grid-example>

The following example shows Column Definitions using **stateful attributes**. Note the following:

- The `width`, `sort` and `pinned` stateful attributes are applied whenever Column Definitions are set.
- If you update the width, sort or pinned of a column by interacting with the grid's UI and then hit 'Set Columns with
State', the columns state will change and the changes made via the UI will be lost.
- Note the `defaultColDef` is used to remove state. For example `sort=null` is set so that any sorting the user might of
done on another column is cleared down. Otherwise the grid would see the `sort` attribute as `undefined` which means the
state should not be changed.

<grid-example title='Updating Column State' name='changing-state' type='mixed' options='{ "modules": true }'></grid-example>

## **null** vs **undefined**

When a stateful attribute is set to `undefined` the grid ignores the attribute.

When a stateful attribute is set to `null` the grid clears the attribute.

For example the setting `pinned=null` will clear pinning on a column whereas `pinned=undefined` means the grid will
leave pinned state as it is for that column.

If you don't want to upset any column state (e.g. if you don't want to undo any change the user has made to the columns
via the grid's UI, such as applying a sort by clicking on a header, or dragging a column's width) then do not set the
state attributes as by default they will be `undefined`.

## Applying Column Order

When Column Definitions are provided for existing Columns, the order of the Columns inside the grid is not changed to
match the order of the newly provided Column Definitions. This is by design so that any reordering of the columns a user
does to the grid is not lost when the Column Definitions get updated.

If the desired behaviour is that Columns should be ordered to match the new set of Column Definitions, set the grid
property `applyColumnDefOrder=true`.

The example below demonstrates applying the Column Definitions order to the grid Columns after new Column Definitions
are set. Both buttons Medals First and Medals Last set the same Columns but in a different order.

<grid-example title='Column Definition Order' name='col-def-order' type='mixed' options='{ "modules": true }'></grid-example>

## Matching Columns

When a new Column Definition is passed to the grid, the grid needs to work out if it's an update of a Column or a new
Column.

Most of the time the `field` attribute to match the Column. However `field` is both an optional and non-unique
attribute, e.g. a `valueGetter` could be used instead of field, or two columns could share the same field.

Given the `field` is not a unique identifier, the grid uses the following rules to match columns:

1. If `colId` provided, match using `colId`
1. Otherwise if `field` provided, match using `field`
1. Otherwise match using object equality on Column Definition instance

In other words, to have the grid correctly match Columns make sure each Column has either a `field` or `colId`.

The example below demonstrates the different matching strategies. Note the following:

- All columns, with the exception of Country, are matched correctly. This means any column width, sort, position etc
will be kept between changes to the columns. Country will have its state reset, as it will be treated as a new column
each time.
- Athlete column is matched by object equality as the same column definition instance is provided to the grid each time.
- Age column is matched by `colId`. The `colId` is needed as the column has no `field` attribute.
- All other columns except Country are matched using the `field` attribute.
- Country column is not matched as it's a different object instance and has not `colId` or `field` attributes.

<grid-example title='Matching Columns' name='matching-columns' type='mixed' options='{ "modules": true }'></grid-example>

## Column Events

Column Events will get raised when setting new Column Definitions that update the current Columns. For example
`columnPinned` event will get raised if applying the state results in a column getting pinned or unpinned.

The example below demonstrates events getting raised based on Column Definition changes. The example logs event
information to the console, so best open the example in a new tab and observe the dev console.

<grid-example title='Column Events' name='column-events' type='mixed' options='{ "enterprise": true }'></grid-example>

## Refreshing Headers

If you are creating your own [Header Components](/component-header/) then you will need to be aware of
how Header Components are refreshed.

All Header Components that still exist after the new Column Definitions are applied (in other words, the Column still
exists after the update, it was not removed) will have its `refresh` method called.

It is up to the Header Component to update based on any changes it may find in the Column Definition.

The example below demonstrates refreshing of the headers. Note the following:

- Each column is configured to use a custom Header Component.
- The Header Component logs to the console when its methods `init`, `refresh` and `destroy` are called.
- Toggling between 'Upper Header Names' and 'Lower Header Names' causes the Header Component to refresh. The Header
Component refreshes itself and returns `true`.
- Toggling between 'Filter On' and 'Filter Off' causes the Header Component to refresh. The Header Component returns
`false` which results in the component getting destroyed and recreated.
- Toggling between 'Resize On' and 'Resize Off' causes the Header Component to refresh. However there is no change to
the Header Component as it doesn't depend on resize - the resize UI is provided by the grid.

<grid-example title='Refresh Headers' name='refresh-headers' type='mixed'></grid-example>

## Column Definition Retrieval

There will be times where you'll want to retrieve the current Column Definition in order to perhaps persist them, or
perhaps retrieve, alter and then re-apply the modified columns.

The current column definitions can be retrieved with `getColumnDefs`:

[[only-javascript]]
| ```js
| gridOptions.api.getColumnDefs();
| ```

[[only-angular-or-vue]]
| ```js
| this.gridApi.getColumnDefs();
| ```

[[only-react]]
| ```js
| gridApi.getColumnDefs();
| ```

## Column Groups

Column Groups can be updated in the same way as Columns, you just update the Column Group Definition. For expandable
groups, to have open / closed state to be maintained, you need to assign `groupId` in the Column Group Definition.

<snippet suppressFrameworkContext=true>
const gridOptions = {
    columnDefs: [
        {
            headerName: 'Group A',
            groupId: 'groupA',
            children: [
                { field: 'name' },
                { field: 'age', columnGroupShow: 'open' }
            ]
        }
    ]
}
</snippet>

In the example below, note the following:
1. Clicking the top buttons alternatives the columns from two sets of definitions.
1. Column Group A - `groupId` is provided, so expand / collapse is preserved. The Header Name also changes.
1. Column Group B - `groupId` is NOT provided, so expand / collapse is lost, group always closes when updates happen.
1. Column Group C - `groupId` is provided, so expand / collapse is preserved. Child columns are changed.

<grid-example title='Column Groups' name='column-groups' type='mixed' options='{ "modules": true }'></grid-example>
