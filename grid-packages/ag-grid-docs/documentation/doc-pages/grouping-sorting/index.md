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

The example below demonstrates how sorting is enabled with [Multiple Group Columns](../grouping-multiple-group-columns/). 
Note that sorting is enabled across all columns, including Row Group Columns, using: `defaultColDef.sortable = true`.

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
            sortable: true,
            sort: 'desc',
        },
    ],
    autoGroupColDef: {
        sortable: true,
        sort: 'asc',
        field: 'month',
        comparator: (a, b) => {
            const months = [
                'January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December',
            ];
            // sorts 'months' in chronological order
            return months.indexOf(a) - months.indexOf(b);
        },
    },
}
</snippet>

In this snippet, sorting applied to the auto column will sort the months using the provided comparator, sorting on the year column will sort the years, which are now row groups. As the auto column sort direction differs from the grouped column the auto column will also display the mixed-sort icon.

The following example demonstrates multi group sorting. Note the following:

- Click the header of the group column to apply a sort, observe how it forces the year column sort to match its sort direction.
- Hold shift and click the header of the year column, observe how the sort direction is now different from the auto column, and the auto column now displays the mixed-sort icon.
- Sort by at least three columns including the year column, observe how row group columns don't receive a sort index. This is because they are always sorted before any other columns.

<grid-example title='Mixed Group Sort' name='mixed-group-sort' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>

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

Continue to the next section to learn about [Filtering Groups](../grouping-filtering/).