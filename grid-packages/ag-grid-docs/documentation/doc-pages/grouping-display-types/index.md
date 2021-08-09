---
title: "Row Grouping - Display Types"
enterprise: true
---

This section compares the different ways row groups can be displayed in the grid.

The Display Types introduced below are only concerned with how the Row Grouping results are presented in the grid. When using Row 
Grouping, the grid will perform the _GROUP BY_ operations to the 'flat' data provided. 

[[note]]
| If the data supplied to the grid does not need to be grouped by the grid, consider using [Tree Data](../tree-data/) instead.

## Single Group Column 

Row groups are displayed under a single group column. 

<image-caption src="grouping-display-types/resources/single-group-column.png" alt="Single Group Column" maxWidth="70%" constrained="true" centered="true"></image-caption>

As illustrated above, there is a single group column containing the `country` and `year` row groups in a single group hierarchy. 

See the [Single Group Column](../grouping-single-group-column/) section for more details.

## Multiple Group Columns

Separate group columns are used for each column being grouped by.

<image-caption src="grouping-display-types/resources/multiple-group-columns.png" alt="Multiple Group Columns" maxWidth="70%" constrained="true" centered="true"></image-caption>

As illustrated above, the `country` and `year` row groups are displayed under separate group columns.

See the [Multiple Group Columns](../grouping-multiple-group-columns/) section for more details.

## Group Rows

Row groups are displayed in group rows rather than group columns.

<image-caption src="grouping-display-types/resources/group-rows.png" alt="Group Rows" maxWidth="70%" constrained="true" centered="true"></image-caption>

As illustrated above, the `country` and `year` row groups are displayed using Group Rows.

See the [Group Rows](../grouping-group-rows/) section for more details.

## Custom Group Columns

In some rare cases it may be desirable to supply your own custom groups rather than using the provided display types above. 

See the [Custom Group Columns](../grouping-custom-group-columns/) section for more details.

## Next Up

Continue to the next section to learn about the [Single Group Column](../grouping-single-group-column/) display type.
