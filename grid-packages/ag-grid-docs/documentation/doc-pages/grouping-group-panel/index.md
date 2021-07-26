---
title: "Row Grouping - Row Group Panel"
enterprise: true
---

## Keeping Columns Visible

By default dragging a column out of the grid will make it hidden and un-grouping a column will make it visible again. This default behaviour can be changed with the following properties:

- `suppressDragLeaveHidesColumns`: When dragging a column out of the grid, eg when dragging a column from the grid to the group drop zone, the column will remain visible.
- `suppressMakeColumnVisibleAfterUnGroup`: When un-grouping, eg when clicking the 'x' on a column in the drop zone, the column will not be made visible.

The default behaviour is more natural for most scenarios as it stops data appearing twice. E.g. if country is displayed in group column, there is no need to display country again in the country column.

The example below demonstrates these two properties. Note the following:

- Columns country and year can be grouped by dragging the column to the group drop zone.
- Grouped columns can be un-grouped by clicking the 'x' on the column in the drop zone.
- The column visibility is not changed while the columns are grouped and un-grouped.
- While dragging the column header over the drop zone, before it is dropped, the column appears translucent to indicate that the grouping has not yet been applied.

<grid-example title='Keep Columns Visible' name='keep-columns-visible' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>
