---
title: "Row Grouping - Group Rows"
enterprise: true
---

This section covers the Group Rows display type, where group rows are automatically added by the grid containing the 
row groups instead of group columns. This can be preferred if you have a lot of information you want to say about the group.

<image-caption src="grouping-group-rows/resources/group-rows.png" alt="Group Rows" maxWidth="80%" constrained="true" centered="true"></image-caption>

## Enabling Group Rows

To display each row group using group rows set `groupDisplayType = 'groupRows'` as shown below:

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'sport' },
        { field: 'total' }
    ],
    // display each row grouping in group rows
    groupDisplayType: 'groupRows', 
}
</snippet>

In the snippet above, rows will be grouped by `country` and `year` as both column definitions have `rowGroup=true` declared.
These row groups will be displayed using Group Rows as `groupDisplayType = 'groupRows'`.

The example below demonstrates the Group Rows display type. Note the following:

- There are two active row groups as the supplied `country` and `year` column definitions have `rowGroup=true` declared.

- Instead of group columns, the row groups are displayed using full width group rows as `groupDisplayType = 'groupRows'`.

- The `country` and `year` columns are not shown in the grid as `hide=true` is set on their column definitions.

- Styling has been added to the group rows to highlight the different group levels.

<grid-example title='Enabling Group Rows' name='enabling-group-rows' type='mixed' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Group Row Configuration

When using Group Rows, it is possible to change the rendering of the group row. This done by either replacing the 
Cell Renderer with your own [Custom Cell Renderer](/component-cell-renderer/), or configuring the provided 
[Group Cell Renderer](/group-cell-renderer/).

If using Group Rows and no `groupRowRenderer` properties are provided, then the default 
[Group Cell Renderer](/group-cell-renderer/) is used with its default values.
 
<snippet>
const gridOptions = {
    // groups by row - the grid defaults to using the default group cell renderer for the row with default settings.
    groupDisplayType: 'groupRows', 
}
</snippet>

<snippet>
const gridOptions = {
    // identical to above - uses 'agGroupCellRenderer' which is the default, so doesn't change anything.
    groupDisplayType: 'groupRows',
    groupRowRenderer: 'agGroupCellRenderer',
}
</snippet>


### Providing Cell Renderer

To provide your own Cell Renderer, use the grid properties `groupRowRenderer` and `groupRowRendererParams`.

Using your own Cell Renderer hands over rendering of the group row to your custom Cell Renderer. However, that also means
the customer Cell Renderer will also need to provide expand / collapse functionality.

[[only-javascript]]
md-include:group-config-common.md
[[only-angular]]
md-include:group-config-common.md
[[only-react]]
md-include:group-config-common.md
[[only-vue]]
|<snippet>
|const gridOptions = {
|    // configures Group Rows with a customer Cell Renderer
|    groupDisplayType: 'groupRows', 
|    groupRowRenderer: 'myCellRenderer',
|    groupRowRendererParams: {
|        someProp: 'someValue',
|    },
|}
|</snippet>

### Configuring Group Cell Renderer

Configure the default Group Cell Renderer using `groupRowRendererParams`. Full details on what to configure are provided
in the page [Group Cell Renderer](/group-cell-renderer/).

<snippet>
const gridOptions = {
    // use Group Rows and configure the Group Cell Renderer
    groupDisplayType: 'groupRows', 
    groupRowRendererParams: {
        // puts a checkbox onto each group row
        checkbox: true,
        // puts a row dragger onto each group row
        rowDrag: true
    },
}
</snippet>

Below shows an example of aggregation with Group Rows. It also provides an `innerRenderer` to configure what gets 
displaying inside the row groups, however it keeps the Default Group Cell Renderer for its expand / collapse 
functionality. Note the following:

[[only-javascript]]
|- Each group spans the width of the grid.
|- Each group uses a custom Cell Renderer. The cell renderer shows the aggregation data for each medal type.
|- Each medal column is editable, you can change the number of medals for any of the athletes.
|- The column Year has a filter on it.
|- The cell renderer has logic listening for changes to filtering and data cell changes. This means the aggregation data in the full width row is updated if:
|    1. If you edit any cell
|    1. If you filter the data (ie take rows out).
|- The example shows how to use CSS to enable the row hover effect, which is not shown on full width rows by default.
[[only-angular]]
|- Each group spans the width of the grid.
|- Each group uses a custom Cell Renderer. The cell renderer shows the aggregation data for each medal type.
|- Each medal column is editable, you can change the number of medals for any of the athletes.
|- The column Year has a filter on it.
|- Aggregation data in the full width row is updated if:
|    1. If you edit any cell
|    1. If you filter the data (ie take rows out).
|- The example shows how to use CSS to enable the row hover effect, which is not shown on full width rows by default.
[[only-react]]
|- Each group spans the width of the grid.
|- Each group uses a custom Cell Renderer. The cell renderer shows the aggregation data for each medal type.
|- Each medal column is editable, you can change the number of medals for any of the athletes.
|- The column Year has a filter on it.
|- The cell renderer has logic listening for changes to filtering and data cell changes. This means the aggregation data in the full width row is updated if:
|    1. If you edit any cell
|    1. If you filter the data (ie take rows out).
|- The example shows how to use CSS to enable the row hover effect, which is not shown on full width rows by default.
[[only-vue]]
|- Each group spans the width of the grid.
|- Each group uses a custom Cell Renderer. The cell renderer shows the aggregation data for each medal type.
|- Each medal column is editable, you can change the number of medals for any of the athletes.
|- The column Year has a filter on it.
|- The example shows how to use CSS to enable the row hover effect, which is not shown on full width rows by default.

<grid-example title='Full Width Groups Rendering' name='full-width-groups-rendering' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"], "extras": ["fontawesome"] }'></grid-example>

## Sorting Group Rows

To sort a group row, you can apply a sort to the underlying column. In the example below the [Row Group Panel](/grouping-group-panel/) is enabled to demonstrate this. Note the following:

- Clicking on `country` in the row group panel applies a sort to the country row groups.
- Holding the <kbd>Shift</kbd> key down while clicking `year` in the row group panel applies a sort to the year row groups, while maintaining the sort on the country row groups.

<grid-example title='Sorting Group Rows' name='sorting-group-rows' type='mixed' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>



## Next Up

Continue to the next section to learn about the [Custom Group Columns](../grouping-custom-group-columns/) display type.
