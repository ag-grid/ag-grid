---
title: "Sparklines Overview"
enterprise: true
---

This section introduces the grid's built-in Sparklines.

## Enabling Sparklines

To enable sparklines on a particular column, add the `agSparklineCellRenderer` as shown below:

<snippet>
const gridOptions = {
    columnDefs: [ 
        {
            field: 'results',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineType: 'column',
            },
        }, 
        // other column definitions ...
    ],
}
</snippet>

<grid-example title='Enabling Sparklines' name='enabling-sparklines' type='generated' options='{ "enterprise": true, "exampleHeight": 540 }'></grid-example>


## Next Up

Continue to the next section to learn about the: [Range Chart](/integrated-charts-range-chart/).
