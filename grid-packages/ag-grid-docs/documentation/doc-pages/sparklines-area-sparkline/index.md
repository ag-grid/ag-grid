---
title: "Sparklines - Area Sparkline"
enterprise: true
---

This section introduces the Area Sparkline

## Area Sparklines

To create area sparklines in the grid, `agSparklineCellRenderer` component can be provided along with `AreaSparklineOptions` as shown below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'results',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                    fill: 'skyblue',
                    line: {
                        stroke: 'pink',
                        strokeWidth: 2
                    },
                    marker: {
                        fill: 'pink',
                        size: 2,
                        stroke: '',
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the `sparklineOptions` provided in the `cellRendererParams` property is of type `AreaSparklineOptions`.

This is an example to further demonstarate how area sparklines can be configured and customised to your liking or branding by using the available options to add styles.

- The `sparklineOptions` object is a way to define properties that get applied to the area, line and every marker. In this example, the shape of every marker is set to `diamond`.
- Refer to the [AreaSparklineOptions](/sparklines-area-sparkline/#areasparklineoptions) interface for the attributes which can be customised in a area sparkline.
- The formatter callback function is used to override the default property values for individual markers based on the data they represent.
- The formatter callback function is passed `MarkerFormatterParams` which provides information about the data associated with each Marker. This function should return an object of type `MarkerFormat`.
- Here, when the marker is not highlighted, the marker size is set to `0`px which means it is not visible.
- When the marker is highlighted, if the y value of the data point is less than 0, the marker size is set to `4`px, otherwise it is set to `6`px.
- See the [MarkerFormat](/sparklines-area-sparkline/#markerformat) interface for the attributes which can be customised using this formatter.


<grid-example title='Area Sparkline' name='area-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces
The interfacs for the available options is as follows:

### AreaSparklineOptions:

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='AreaSparklineOptions'></api-documentation>

### Padding:

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='Padding'></api-documentation>

### SparklineAxisOptions:

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='SparklineAxisOptions'></api-documentation>

### SparklineLine:

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='SparklineLine'></api-documentation>

### SparklineMarker:

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='SparklineMarker'></api-documentation>


### HighlightStyle:

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='HighlightStyle'></api-documentation>

### MarkerFormat:

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='MarkerFormat'></api-documentation>


## Next Up

Continue to the next section to learn about the: [Column Sparklines](/sparklines-column-sparkline/).
