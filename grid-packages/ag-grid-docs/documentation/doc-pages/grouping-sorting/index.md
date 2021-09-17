---
title: "Row Grouping - Sorting Groups"
enterprise: true
---

This section provides details on how to configure and customise how row groups are sorted.

## Enabling Group Sorting

When using [Single Group Column](../grouping-single-group-column/) or [Multiple Group Columns](../grouping-multiple-group-columns/), sorting can be enabled through the `sortable` column property as shown below:    

<snippet>
const gridOptions = { 
    defaultColDef: {
        // enable sorting across all columns - including Row Group Columns
        sortable: true,
    }, 
    autoGroupColumnDef: {
        // enabled sorting on Row Group Columns only 
        sortable: true,        
    },
    // also applies to the 'multipleColumns' display type 
    groupDisplayType: 'singleColumn',
}
</snippet>

It is common to simply define `defaultColDef.sortable = true` across all columns, which includes row group columns. 
However, in cases where it is preferable to define sorting on the Row Group Columns directly, 
`autoGroupColumnDef.sortable = true` can be used.

Sorting is also enabled using the `sortable` column property with [Custom Group Columns](../grouping-custom-group-columns/), as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {   
            cellRenderer: 'agGroupCellRenderer',
            showRowGroup: true,
            // enabled sorting on this Row Group Column only 
            sortable: true,  
        },
    ],
    defaultColDef: {
        // enable sorting across all columns - including Row Group Columns
        sortable: true,
    }, 
    groupDisplayType: 'custom',
};
</snippet>

[[note]]
| When using the [Group Rows Display Type](../grouping-group-rows/) there are no group columns to sort by, however row 
| groups can still be ordered through the [Default Group Order](../grouping-group-order/#default-group-order). 

The example below demonstrates how sorting is enabled with [Multiple Group Columns](../grouping-multiple-group-columns/). 
Note that sorting is enabled across all columns, including Row Group Columns, using: `defaultColDef.sortable = true`.

<grid-example title='Enabling Group Sorting' name='enabling-group-sorting' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Custom Group Sorting

By default, any sort `comparator` defined on a column that is used to group rows by will also be used by the Group Column. 
For example, consider the following column definition:

<api-documentation source='column-properties/properties.json' section='sort' names='["comparator"]'></api-documentation>

<snippet>
|const gridOptions = {
|    columnDefs: [
|        {
|            field: 'month',
|            rowGroup: true,
|            comparator: (a, b) => {
|                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
|                                'August', 'September','October', 'November', 'December'];
|
|                // sorts 'months' in chronological order
|                return months.indexOf(a) - months.indexOf(b);
|            },
|        },
|    ],
|}
</snippet>

As `rowGroup = true` is defined on this column, the supplied `comparator` will be used to sort the `month` column and 
the Group Column.

The following example demonstrates custom group sorting. Note the following:

- The `month` column has a custom sort `comparator` supplied which sorts months in chronological order.
- The 'Group' Column uses the `comparator` defined on the `month` column definition to sort the row groups. 

<grid-example title='Custom Group Sort' name='custom-group-sort' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

[[note]]
| It is also possible to define a comparator that will be used across all group levels using; `autoGroupColumnDef.comparator`.
| This 'shared group comparator' will take precedence over any comparators defined on the underlying columns.

## Maintain Group Order

When sorting on non-group columns it may be desirable to maintain the existing group order. This behaviour can be
enabled through the `groupMaintainOrder` grid option as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'assignee', rowGroup: true, hide: true },
        { field: 'priority', rowGroup: true, hide: true },        
        { field: 'task' },      
    ],
    groupDisplayType: 'multipleColumns',
    // preserves current group order when sorting on non-group columns
    groupMaintainOrder: true,
}
</snippet>

Note that [Group Order](../grouping-group-order/) is not the same as sorting. Maintaining group order will not preserve
active group sorts, just the current order of the groups. However, when sorting on group columns the group order will
be changed based on the sort.

The following example demonstrates how `groupMaintainOrder` works. Note the following:

- `groupMaintainOrder = true` is defined on the grid options supplied to the grid. 
- Clicking on the 'Task' column header only sorts the tasks without reordering the groups.
- Sorting on the 'Assignee' or 'Priority' group column headers will reorder the groups.

<grid-example title='Maintain Group Order' name='maintain-group-order' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Row Group Filtering](../grouping-filtering/).