---
title: "Sparklines - Line Sparkline"
enterprise: true
---

This section introduces the Line Sparkline

## Line Sparklines

To create line sparklines in the grid, add `agSparklineCellRenderer` and `LineSparklineOptions` as shown below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    // The type property is optional as the sparkline type is 'line' by default.
                    type: 'line',
                    line: {
                        stroke: 'rgb(124, 255, 178)',
                        strokeWidth: 2
                    },
                    padding: {
                        top: 5,
                        bottom: 5
                    },
                    marker: {
                        size: 3,
                        shape: 'diamond',
                    },
                    highlightStyle: {
                        size: 10,
                    },
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

This is an example to further demonstrate how line sparklines can be configured.

- The `sparklineOptions` object contains the properties that get applied to the line and every marker globally.
- Here, the shape of every marker is `diamond` and the size is configured to `3` pixels.
- The padding around the sparkline is adjusted using the `padding` property.
- The line path is formatted using the `line` property by adding `stroke` and `strokeWidth`.
- When markers are highlighted, the highlightStyle is applied, in this case, the marker size is increased to `10` pixels for highlighted items.

<grid-example title='Line Sparkline' name='line-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

Refer to the [LineSparklineOptions](/sparklines-line-sparkline/#linesparklineoptions) interface for the attributes which can be customised in a line sparkline.
Also see [Special Points](/sparklines-special-points/) customisation of individual markers using a formatter.

## Interfaces
The interfaces for the available options are as follows:

### LineSparklineOptions

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='LineSparklineOptions'></api-documentation>

### Padding

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='Padding'></api-documentation>

### SparklineLine

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='SparklineLine'></api-documentation>

### SparklineMarker

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='SparklineMarker'></api-documentation>

### HighlightStyle

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='HighlightStyle'></api-documentation>

### MarkerFormat

<api-documentation source='sparklines-line-sparkline/resources/line-sparkline-api.json' section='MarkerFormat'></api-documentation>


## Next Up

Continue to the next section to learn about the: [Area Sparklines](/sparklines-area-sparkline/).
