---
title: "Sparklines - Column Sparkline"
enterprise: true
---

This section introduces the Column Sparkline

## Column Sparklines

To create column sparklines in the grid, add `agSparklineCellRenderer` as well as `ColumnSparklineOptions` as shown below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            headerName: 'Close History',
            minWidth: 250,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    fill: 'rgba(0, 128, 0, 0.3)',
                    stroke: 'rgba(0, 128, 0, 0.3)',
                    highlightStyle: {
                        fill: 'rgb(250, 200, 88)'
                    },
                    paddingInner: 0.6,
                    paddingOuter: 0.1
                },
            },
        }
        // other column definitions ...
    ],
};
</snippet>

This is an example to further demonstrate how column sparklines can be configured and formatted to your liking.

- The `sparklineOptions` object contains the properties that get applied to every column.
- Here, the fill for every column is `rgba(0, 128, 0, 0.3)`.
- By default, an axis line is displayed, this can be modified or removed by setting the axis strokeWidth to `0`.
- The padding between the bars can be adjusted using the `paddingInner` property.
- The padding on the outer edge of the first and last bars can be modified with the `paddingOuter` property.
- Here, when the column is highlighted, the fill is set to `rgb(250, 200, 88)` via the highlightStyle options.

<grid-example title='Column Sparkline' name='column-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

Refer to [ColumnSparklineOptions](/sparklines-column-sparkline/#columnsparklineoptions) interface for all the attributes which can be customised in a column sparkline.
Also see [Special Points](/sparklines-special-points/) for customising individual columns using a formatter.

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

Continue to the next section to learn about the: [Data Formats](/sparklines-data/).
