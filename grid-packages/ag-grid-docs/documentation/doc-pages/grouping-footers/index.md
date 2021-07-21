---
title: "Row Grouping - Group Footers"
enterprise: true
---

This sections shows how to add group footers showing totals for each group level.

If you want to include a footer with each group, set the property `groupIncludeFooter` to true. The footer is displayed as the last line of the group when the group is expanded - it is not displayed when the group is collapsed.

The footer by default will display the word 'Total' followed by the group key. If this is not what you want, then use
the `footerValueGetter` option. The following shows two ways for achieving the same, one using a function, one
using an expression.

<snippet>
const gridOptions = {
    columnDefs: [
        // Option 1: use a function to return a footer value
        {
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                footerValueGetter: params =>  {
                    return 'Total (' + params.value + ')';
                },
            }
        },
        // Option 2: use an expression to return a footer value - gives same result
        {
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                footerValueGetter: '"Total (" + x + ")"'
            }
        }
    ]
}
</snippet>

When showing the groups in one column, the aggregation data is displayed in the group header when collapsed and only in the footer when expanded (ie it moves from the header to the footer). To have different rendering, provide a custom `groupInnerCellRenderer`, where the renderer can check if it's a header or footer.

It is also possible to include a 'grand' total footer for all groups using the property `groupIncludeTotalFooter`. This property can be used along side `groupIncludeFooter` to produce totals at all group levels or used independently.

The example below uses [aggregation](/aggregation/) which is explained in the next section but included here as footer rows only make sense when used with aggregation. In this example notice:

- `gridOptions.groupIncludeFooter = true` -  includes group totals within each group level.
- `gridOptions.groupIncludeTotalFooter = true` -  includes a 'grand' total across all groups.

<grid-example title='Group Footers' name='grouping-footers' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

[[note]]
| Group footers are a UI concept only in the grid. It is the grids way of showing aggregated data (which belongs
| to the group) appearing after the group's children. Because the footer is a UI concept only, the following
| should be noted: <br/>
| - It is not possible to select footer nodes. Footer rows appear selected when the group is selected.
| - Footer rows are not parted of the iterated set when the api method `api.forEachNode()` is called.
| - Footer nodes are not exported to CSV or Excel.
| - If a Footer cell is copied to the clipboard, the word "Total" will not be included. Eg where the group for "Sales" would say "Total Sales", only "Sales" will go to the clipboard. This is because the word "Total" is not actually part of the data, it's something the grid rendering puts in.
