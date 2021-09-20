---
title: "Sparklines Overview"
enterprise: true
---

This section introduces the grid's built-in Sparklines - mini charts that are optimised for grid cells that can be used
to provide insights into data trends at a glance. These sparklines can be fully customised for application requirements.

<image-caption src="sparklines-overview/resources/sparklines-overview.png" alt="Sparkline Overview" maxWidth="80%" constrained="true" centered="true"></image-caption>

## Enabling Sparklines

To enable sparklines on a particular column, add the `agSparklineCellRenderer` as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: { 
                    // Optional - 'line' is the default
                    type: 'line' 
                },
            },
        },
        // other column definitions ...
    ],
}
</snippet>

<grid-example title='Enabling Sparklines' name='enabling-sparklines' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Sparkline Customisation

There are currently three available sparkline types: line, area and column. Depending on the type, different visualisation to the cell value will be given.


## Next Up

Continue to the next section to learn about the: [Line Sparkline](/sparklines-line-sparkline/).
