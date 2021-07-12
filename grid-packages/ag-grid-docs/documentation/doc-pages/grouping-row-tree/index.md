---
title: "Row Grouping - Row Tree"
enterprise: true
---
This section shows how row groups can be displayed in a row tree.

<image-caption src="grouping-row-tree/resources/row-tree.png" alt="Rows" centered="true"></image-caption>

## Enabling Row Tree

It is also possible to create one column for each individual group by enabling `groupMultiAutoColumn` grid option as
shown below:
 
This can be preferred if you have a lot of information you want to say about the group.

<snippet spaceBetweenProperties="true" inlineReactProperties="true">
const gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true }, 
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    // display each row grouping in group rows
    treeDisplayType: 'row', 
}
</snippet>


The following example shows the first example in this page, the Auto Column Group example, using full width rows. Note that all that is necessary to achieve this it to add `groupUseEntireRow:true` to your gridOptions

<grid-example title='Row Tree' name='row-tree' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Configuring Full Width Group Rows

When using Full Width Group Rows, it is possible to change the rendering of the group row. This done by either replacing the Cell Renderer with your own [Custom Cell Renderer](/component-cell-renderer/), or configuring the provided [Group Cell Renderer](/group-cell-renderer/).

If using Full Width Group Rows and no `groupRowRenderer` properties are provided, then the default [Group Cell Renderer](/group-cell-renderer/) is used with it's default values.

<snippet>
const gridOptions = {
    // groups by row - the grid defaults to using the default group cell renderer for the row with default settings.
    groupUseEntireRow: true,
}
</snippet>

<snippet>
const gridOptions = {
    // identical to above - uses 'agGroupCellRenderer' which is the default, so doesn't change anything.
    groupUseEntireRow: true,
    groupRowRenderer: 'agGroupCellRenderer',
}
</snippet>


### Providing Cell Renderer

To provide your own Cell Renderer, use the grid properties `groupRowRenderer`, `groupRowRendererFramework` and `groupRowRendererParams`.

Using your own Cell Renderer hands over rendering of the full row to your custom Cell Renderer. However that also means the customer Cell Renderer will also need to provide expand / collapse functionality.

<snippet>
const gridOptions = {
    // configures Full Width rows with a customer Cell Renderer
    groupUseEntireRow: true,
    groupRowRenderer: 'myCellRenderer',
    groupRowRendererParams: {
        someProp: 'someValue',
    },
}
</snippet>

### Configuring Group Cell Renderer

Configure the default Group Cell Renderer using `groupRowRendererParams`. Full details on what to configure are provided in the page
[Group Cell Renderer](/group-cell-renderer/).

<snippet>
const gridOptions = {
    // use Full Width group rows and configure the Group Cell Renderer
    groupUseEntireRow: true,
    groupRowRendererParams: {
        // puts a checkbox onto each group row
        checkbox: true,
        // puts a row dragger onto each group row
        rowDrag: true
    },
}
</snippet>

Below shows an example of aggregating with full width rows for groups. It also provides an `innerRenderer` to configure what gets displaying inside the row groups, however it keeps the Default Group Cell Renderer for it's expand / collapse functionality. The following can be noted:

- Each group spans the width of the grid.
- Each group uses a custom Cell Renderer. The cell renderer shows the aggregation data for each medal type.
- Each medal column is editable, you can change the number of medals for any of the athletes.
- The column Year has a filter on it.
- The cell renderer has logic listening for changes to filtering and data cell changes*. This means the aggregation data in the full with row is updated if:
    1. If you edit any cell
    1. If you filter the data (ie take rows out).

_* This is true for Vanilla Javascript and React. Angular uses data binding and thus the aggregation data updates automatically without needing to listen to events._

<grid-example title='Full Width Groups Rendering' name='full-width-groups-rendering' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"], "extras": ["fontawesome"] }'></grid-example>
