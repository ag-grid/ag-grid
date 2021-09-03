---
title: "Sparklines Overview"
enterprise: true
---

This section introduces the grid's built-in Sparklines. A Sparkline is a mini chart in a single grid cell that depicts visual representation of the data. Sparklines are highly impactful as they can provide insight into the data trend at a glance.

Enabling sparklines is simple and straightforward, all that is required is the use of the built-in `agSparklineCellRenderer`. Changes in properties and data are reflected in the sparkline, allowing easy and quick analysis of flucuations in values.

Sparklines are visually appealing and can be formatted according to your liking or branding with the available configuration options.

There are currently three available sparkline types: line, area and column. Depending on the type, different visualisation to the cell value will be given.

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
                    type: 'line'
                }
            },
        },
        // other column definitions ...
    ],
}
</snippet>

<grid-example title='Enabling Sparklines' name='enabling-sparklines' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Next Up

Continue to the next section to learn about the: [Column Sparkline](/column-sparkline/).
