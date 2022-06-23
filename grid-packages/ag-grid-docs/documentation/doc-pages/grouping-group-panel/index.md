---
title: "Row Grouping - Row Group Panel"
enterprise: true
---
This section covers the Row Group Panel which allows users control which columns the rows are grouped by.   

## Enabling Row Group Panel

To display the row group panel set `rowGroupPanelShow` as shown below:

<snippet spaceBetweenProperties="true">
const gridOptions = { 
    columnDefs: [
        { field: 'country', enableRowGroup: true },
        { field: 'year', enableRowGroup: true }, 
        { field: 'sport', enableRowGroup: true },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    // possible options: 'never', 'always', 'onlyWhenGrouping'
    rowGroupPanelShow: 'always',
}
</snippet>

In the snippet above, the Row Group Panel is configured so that is `'always'` displayed. To only display the Row Group
Panel when there are active row groups use: `'onlyWhenGrouping'`.

Note that `enableRowGroup=true` is only declared on the `country`, `year` and `sport` columns, which means only
these columns can be dragged to the Row Group Panel.

This is demonstrated in the following example, note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- The Row Group Panel is always shown as `rowGroupPanelShow = 'always'`.

- Only the `country`, `year` and `sport` columns can be dragged to the Row Group Panel as they have `enableRowGroup` enabled.

- The columns can be clicked in the Row Group Panel to progress their sort.

<grid-example title='Enabling Row Group Panel' name='row-group-panel' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Keeping Columns Visible

By default, dragging a column out of the grid will make it hidden and un-grouping a column will make it visible again. 
This default behaviour can be changed with the following properties:

- `suppressDragLeaveHidesColumns`: When dragging a column out of the grid, e.g. when dragging a column from the grid to the group drop zone, the column will remain visible.
- `suppressMakeColumnVisibleAfterUnGroup`: When un-grouping, e.g. when clicking the 'x' on a column in the drop zone, the column will not be made visible.
- `suppressRowGroupHidesColumns`: When grouping, when a group is dragged into the group drop zones, the column will not be hidden.

The default behaviour is more natural for most scenarios as it stops data appearing twice, e.g. if country is displayed in the group column,
there is no need to display country again in the country column. However, preventing hiding the grouped columns can allow for a finer control over the group sorting.

The example below demonstrates these two properties. Note the following:

- Columns country and year can be grouped by dragging the column to the group drop zone.
- Grouped columns can be un-grouped by clicking the 'x' on the column in the drop zone.
- The column visibility is not changed while the columns are grouped and un-grouped.
- While dragging the column header over the drop zone, before it is dropped, the column appears translucent to indicate that the grouping has not yet been applied.

<grid-example title='Keep Columns Visible' name='keep-columns-visible' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn how to add [Group Order](../grouping-group-order/).