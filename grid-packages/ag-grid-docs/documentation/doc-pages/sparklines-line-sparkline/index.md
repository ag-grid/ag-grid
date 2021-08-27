---
title: "Sparklines - Line Sparkline"
enterprise: true
---

This section introduces the Line Sparkline

## Line Sparklines

To create line sparklines in the grid, `agSparklineCellRenderer` component can be provided along with `LineSparklineOptions` as shown below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'results',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    line: {
                        stroke: 'skyblue',
                    },
                    marker: {
                        shape: 'diamond',
                        size: '3'
                    },
                    highlightStyle: {
                        size: 5,
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the `sparklineOptions` provided in the `cellRendererParams` property is of type `LineSparklineOptions`.

This is an example to further demonstarate how line sparklines can be configured and customised to your liking or branding by using the available options to add styles.

- The `sparklineOptions` object is a way to define properties that get applied to the line and every marker. In this example, the shape of every marker is set to `diamond`.
- Refer to the [LineSparklineOptions](/sparklines-line-sparkline/#linesparklineoptions) interface for the attributes which can be customised in a line sparkline.
- The formatter callback function is used to override the default property values for individual markers based on the data they represent.
- The formatter callback function is passed `MarkerFormatterParams` which provides information about the data associated with each Marker. This function should return an object of type `MarkerFormat`.
- Here, when the marker is not hovered over, if the y value of the data point is less than 0, the fill and stroke are set to `green`, otherwise they are set to `skyblue`.
- See the [MarkerFormat](/sparklines-line-sparkline/#markerformat) interface for the attributes which can be customised using this formatter.


<grid-example title='Line Sparkline' name='line-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces
The interfacs for the available options is as follows:

### LineSparklineOptions:

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='LineSparklineOptions'></api-documentation>

### Padding:

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='Padding'></api-documentation>

### SparklineLine:

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='SparklineLine'></api-documentation>

### SparklineMarker:

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='SparklineMarker'></api-documentation>

### HighlightStyle:

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='HighlightStyle'></api-documentation>

### MarkerFormat:

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='MarkerFormat'></api-documentation>


## Next Up

Continue to the next section to learn about the: [Area Sparklines](/sparklines-area-sparkline/).
