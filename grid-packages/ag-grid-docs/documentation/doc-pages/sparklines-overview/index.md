---
title: "Sparklines Overview"
enterprise: true
---

This section introduces the grid's built-in Sparklines - mini charts that are optimised for grid cells that can be used
to provide insights into data trends at a glance. These sparklines can be fully customised to application's requirements.

<image-caption src="sparklines-overview/resources/sparklines-overview.png" alt="Sparkline Overview" maxWidth="80%" constrained="true" centered="true"></image-caption>

## Enabling Sparklines

To enable sparklines on a particular column, add the `agSparklineCellRenderer` as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'change',
            cellRenderer: 'agSparklineCellRenderer',
        },
        // other column definitions ...
    ],
}
</snippet>

Note in the snippet above that specifying an `agSparklineCellRenderer` will display the data using the default `line` sparkline.

The following example shows the minimum configuration required to display data in a sparkline. Note the following:

- The **Change** column is configured to use an `agSparklineCellRenderer`.
- No sparkline options are supplied to the `agSparklineCellRenderer` so the default [Line Sparkline](/sparklines-line-customisation/) is used.
- An array of numbers is supplied as data to the **Change** column, which means no [Data Mapping](/sparklines-data/) is required.

<grid-example title='Enabling Sparklines' name='enabling-sparklines' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Sparkline Customisation

The default Sparkline options act as a good starting point for most applications, however sparklines can be fully
customised by overriding the default sparkline options.

Sparklines are customised by supplying `sparklineOptions` to the `cellRendererParams` on the Sparkline Cell Renderer
as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    // Sparkline customisation goes here.
                }
            },
        },
        // other column definitions ...
    ],
}
</snippet>

Each Sparkline type contains specific `sparklineOptions` that can be overridden and are covered in the following sections:

- [Area Customisation](/sparklines-area-customisation)
- [Bar Customisation](/sparklines-bar-customisation)
- [Column Customisation](/sparklines-column-customisation)
- [Line Customisation](/sparklines-line-customisation/)

The following sections are relevant to all sparkline types:

- [Sparkline Data](/sparklines-data/) - compares the different data formats that can be supplied to sparklines.
- [Axis Types](/sparklines-axis-types/) - compares the different axis types available to sparklines.
- [Sparkline Tooltips](/sparklines-tooltips/) - covers the various ways sparkline tooltips can be customised.
- [Points of Interest](/sparklines-points-of-interest/) - shows how points of interest can be formatted on sparklines.

## Next Up

Continue to the next section to learn about: [Area Customisation](/sparklines-area-customisation/).
