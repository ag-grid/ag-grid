---
title: "Row Grouping - Group Footers"
enterprise: true
---

This section shows how to add group footers to show group level totals.

## Enabling Group Footers

If you want to include a footer with each group, set the property `groupIncludeFooter` to true. It is also possible to 
include a 'grand' total footer for all groups using the property `groupIncludeTotalFooter`.

<snippet>
const gridOptions = {
    // adds subtotals
    groupIncludeFooter: true,
    // includes grand total
    groupIncludeTotalFooter: true,
}
</snippet>

Note that these properties can be used together to produce totals across all group levels.

The following example demonstrates these properties. Note the following:

- Expanding groups reveals subtotal footers as `groupIncludeFooter = true`.
- A grand total footer is shown as the `groupIncludeTotalFooter = true`.
- The medal totals are [aggregated](/aggregation/) via the `aggFunc: 'sum'` column property.

<grid-example title='Enabling Group Footers' name='enabling-group-footers' type='generated' options='{ "enterprise": true, "exampleHeight": 503, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Customising Footer Values

By default, the footer will display the word 'Total' followed by the group key. However, this can be changed using the
`footerValueGetter` supplied to the [Group Cell Renderer](/group-cell-renderer/) params as shown below: 
 
<snippet>
const gridOptions = {
    autoGroupColumnDef: { 
        cellRendererParams: {
            footerValueGetter: params =>  {
                const isRootLevel = params.node.level === -1;
                if (isRootLevel) {
                    return 'Grand Total';
                }
                return `Sub Total (${params.value})`;
            },
        }
    },
}
</snippet>

Note in the snippet above that the `footerValueGetter` contains special handling to display Subtotals and Grand Totals
differently. This is demonstrated in the example below.

<grid-example title='Customising Footer Values' name='customising-footer-values' type='generated' options='{ "enterprise": true, "exampleHeight": 503, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Customising Footer Cells

In most cases [Customising Footer Values](../grouping-footers/#customising-footer-values) is sufficient, however it is
also possible to customise the footer cell using the `innerCellRenderer` supplied to the 
[Group Cell Renderer](/group-cell-renderer/) params as shown below:

In the example below the `innerRenderer` contains special handling to display Grand Total, Subtotal and
non-footer cells differently.

<grid-example title='Customising Footer Cells' name='customising-footer-cells' type='mixed' options='{ "enterprise": true, "exampleHeight": 503, "modules": ["clientside", "rowgrouping"] }'></grid-example>

[[note]]
| It is also possible to customise footer cells using: `cellRendererParams.innerRendererSelector`. For more details see the [Group Cell Renderer](/group-cell-renderer/) section.

## Group Footer Limitations

Group footers are a UI concept only in the grid. It is the grids way of showing aggregated data (which belongs to the 
group) appearing after the group's children. Because the footer is a UI concept only, the following should be noted:

 - It is not possible to select footer nodes. Footer rows appear selected when the group is selected.
 - Footer rows are not part of the iterated set when the api method `api.forEachNode()` is called.
 - Footer nodes are not exported to CSV or Excel.
 - If a Footer cell is copied to the clipboard, the word "Total" will not be included. Eg where the group for "Sales" would say "Total Sales", only "Sales" will go to the clipboard. This is because the word "Total" is not actually part of the data, it's something the grid rendering puts in.

## Next Up

Continue to the next section to learn about [Opening Groups](../grouping-opening-groups/).
