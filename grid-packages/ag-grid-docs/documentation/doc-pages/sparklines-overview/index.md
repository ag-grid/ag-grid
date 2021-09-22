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
            field: 'closeHistory',
            cellRenderer: 'agSparklineCellRenderer'
        },
        // other column definitions ...
    ],
}
</snippet>

Note in the snippet above that specifying a `agSparklineCellRenderer` will display the data using the default `line` sparkline.

The following example shows the minimum configuration required to display data in a sparkline. Note the following:

- The **Close History** column is configured to use a `agSparklineCellRenderer`.
- No sparkline options are supplied to the `agSparklineCellRenderer` so the default [Line Sparkline](/sparklines-line-sparkline/) is used.
- An array of numbers is supplied as data to the **Close History** column, which means no [Data Mapping](/sparklines-data/) is required.

<grid-example title='Enabling Sparklines' name='enabling-sparklines' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Sparkline Customisation

The previous examples showed the default line sparkline without any customisations. The following sections provide details
on how to specify and customise the built-in sparklines:  

- ***[Line Sparkline](/sparklines-line-sparkline/)***
- ***[Area Sparkline](/sparklines-area-sparkline/)***
- ***[Column Sparkline](/sparklines-column-sparkline/)***

The following sections are relevant to all sparkline types:

- ***[Supplying Data](/sparklines-data/)*** - compares the different data formats that can be supplied to sparklines.  
- ***[Axes Types](/sparklines-axis-types/)*** - compares the different axes types available to sparklines.
- ***[Sparkline Tooltips](/sparklines-tooltips/)*** - covers the various ways sparkline tooltips can be customised.
- ***[Special Points](sparklines-special-points/)*** - shows how points of interest can be highlighted on sparklines. 

## Next Up

Continue to the next section to learn about the: [Line Sparkline](/sparklines-line-sparkline/).
