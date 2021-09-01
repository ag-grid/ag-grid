---
title: "Sparklines - Column Sparkline"
enterprise: true
---

This section introduces the Column Sparkline

## Column Sparklines

To create column sparklines in the grid, `agSparklineCellRenderer` component can be provided along with `ColumnSparklineOptions` as shown below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'results',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    strokeWidth: 1,
                    paddingInner: 0.7,
                    paddingOuter: 0.3,
                    formatter: formatter,
                    highlightStyle: {
                        strokeWidth: 1,
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the `sparklineOptions` provided in the `cellRendererParams` property is of type `ColumnSparklineOptions`.

This is an example to further demonstrate how column sparklines can be configured and customised to your liking or branding by using the available options to add styles.

- The `sparklineOptions` object contains the properties that get applied to every column. In this example, strokeWidth of every column is set to `1`.
- Refer to the [ColumnSparklineOptions](/sparklines-column-sparkline/#columnsparklineoptions) interface for the attributes which can be customised in a column sparkline.
- The formatter callback function is used to override the default property values for individual columns based on the data they represent.
- The formatter callback function is passed `ColumnFormatterParams` which provides information about the data associated with each column. This function should return an object of type `ColumnFormat`.
- Here, when the column is not highlighted, if the y value of the item is less than 0, the fill is set to red, otherwise it is set to lime green.
- When the column is highlighted, if the y value of the item is less than 0, the fill is set to magenta, otherwise it is set to cyan.
- See the [ColumnFormat](/sparklines-column-sparkline/#columnformat) interface for the attributes which can be customised using this formatter.


<grid-example title='Column Sparkline' name='column-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces
The interfaces for the available options are as follows:

### ColumnSparklineOptions

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='ColumnSparklineOptions'></api-documentation>

### Padding

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='Padding'></api-documentation>

### SparklineAxisOptions

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='SparklineAxisOptions'></api-documentation>

### HighlightStyle

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='HighlightStyle'></api-documentation>

### ColumnFormat

<api-documentation source='sparklines-column-sparkline/resources/column-sparkline-api.json' section='ColumnFormat'></api-documentation>


## Next Up

Continue to the next section to learn about the: [Data Updates](/sparklines-data-updates/).
