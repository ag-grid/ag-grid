---
title: "Row Grouping - Sorting Groups"
enterprise: true
---

This section provides details on how to configure and customise how row groups are sorted.

## Group Sorting

When using [Single Group Column](../grouping-single-group-column/) or [Multiple Group Columns](../grouping-multiple-group-columns/) sorting is enabled by default. If you wish to disable sorting this can be achieved by setting `sortable = false`. In cases where it is preferable to suppress sorting on the Row Group Columns only `autoGroupColumnDef.sortable = false` can be used.

The example below demonstrates sorting with [Multiple Group Columns](../grouping-multiple-group-columns/). 

<grid-example title='Enabling Group Sorting' name='enabling-group-sorting' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Mixed Group Sorting

By default, columns only apply sorting to their leaf level row data, as such to sort row groups you should apply the sort to the column on which the grouping has been applied.

This creates the side effect that groups can be sorted in multiple directions simultaneously, the group column reflects this by displaying the multi-sort icon when it does not match one or more of the provided columns sort direction.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'year',
            rowGroup: true,
            sort: 'desc',
        },
        {
            field: 'handset',
            rowGroup: true,
            sort: 'asc',
        },
    ],
}
</snippet>

In this snippet, sorting on the year or handset column will sort their respective row groups. As the year and handset column have different sorts applied to them, the group column displays the mixed sort icon.

The following example demonstrates mixed group sorting. Note the following:

- Click the header of the group column to apply a sort, observe how it forces the year and handset columns sort to match.
- Hold shift and click the header of the year column, observe how the sort direction is now different from the auto column, and the auto column now displays the mixed-sort icon.

<grid-example title='Mixed Group Sort' name='mixed-group-sort' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

## Custom Group Sorting

By default, any sort `comparator` defined on a column that is used to group rows by will also be used by the Group Column. 
For example, consider the following column definition:

<api-documentation source='column-properties/properties.json' section='sort' names='["comparator"]'></api-documentation>

<snippet>
| const gridOptions = {
|     columnDefs: [
|         {
|             field: 'month',
|             rowGroup: true,
|             comparator: (a, b) => {
|                 const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
|                                 'August', 'September','October', 'November', 'December'];
| 
|                 // sorts 'months' in chronological order
|                 return months.indexOf(a) - months.indexOf(b);
|             },
|         },
|     ],
| }
</snippet>

As `rowGroup = true` is defined on this column, the supplied `comparator` will be used to sort the `month` column and 
the Group Column.

The following example demonstrates custom group sorting. Note the following:
- The `month` column has a custom sort `comparator` supplied which sorts months in chronological order.
- The 'Group' Column uses the `comparator` defined on the `month` column definition to sort the row groups. 

<grid-example title='Custom Group Sort' name='custom-group-sort' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

<note>
It is also possible to define a comparator that will be used across all group levels using; `autoGroupColumnDef.comparator`.
This 'shared group comparator' will override over any comparators defined on the underlying columns.
</note>

## Maintain Group Order

When sorting on non-group columns it may be desirable to maintain the existing group order. This behaviour can be
enabled through the `groupMaintainOrder` grid option as shown below:

<snippet spaceBetweenProperties="true">
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

Continue to the next section to learn about [Filtering Groups](../grouping-filtering/).