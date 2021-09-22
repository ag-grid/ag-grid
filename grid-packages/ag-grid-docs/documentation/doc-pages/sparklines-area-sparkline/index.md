---
title: "Sparklines - Area Sparkline"
enterprise: true
---

This section introduces the Area Sparkline

## Area Sparklines

To create area sparklines in the grid, add `agSparklineCellRenderer` along with `AreaSparklineOptions` as shown below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                    fill: 'rgba(216, 204, 235, 0.3)',
                    line: {
                        stroke: 'rgb(119,77,185)'
                    },
                    highlightStyle: {
                        fill: 'rgb(143,185,77)',
                    },
                    axis: {
                        stroke: 'rgb(204, 204, 235)'
                    }
                },
            },
        },
        // other column definitions ...
    ],
};
</snippet>

The below example shows how area sparklines can be customised to your liking or branding by using the available options.

- The `sparklineOptions` object contains the properties that get applied to the area, the line and every marker.
- Here, the fill for the area is configured to `rgba(216, 204, 235, 0.3)`.
- By default, an axis line is displayed, this can be modified or removed by setting the axis `strokeWidth` to `0`.
- `highlightStyle` is applied to a marker if it is highlighted, in this case, the marker will be `rgb(143,185,77)` when highlighted.

<grid-example title='Area Sparkline' name='area-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

Refer to the [AreaSparklineOptions](/sparklines-area-sparkline/#areasparklineoptions) interface for the attributes which can be customised in an area sparkline.
Also See the [Special Points](/sparklines-special-points) for customisation of individual marker attributes using a `formatter`.

## Interfaces
The interfaces for the available options are as follows:
### AreaSparklineOptions

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='AreaSparklineOptions'></api-documentation>

### Padding

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='Padding'></api-documentation>

### SparklineAxisOptions

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='SparklineAxisOptions'></api-documentation>

### SparklineLine

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='SparklineLine'></api-documentation>

### SparklineMarker

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='SparklineMarker'></api-documentation>

### HighlightStyle

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='HighlightStyle'></api-documentation>

### MarkerFormat

<api-documentation source='sparklines-area-sparkline/resources/area-sparkline-api.json' section='MarkerFormat'></api-documentation>


## Next Up

Continue to the next section to learn about the: [Column Sparklines](/sparklines-column-sparkline/).
