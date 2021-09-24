---
title: "Sparklines - Line Sparkline"
enterprise: true
---

This section discusses how the Line Sparklines can be customised by adding `sparklineOptions` to `cellRendererParams` in the column configuration.

Although the sparklines are designed to look great by default, in some cases, you may wish to change the visual display through the available formatting options. Here's how.

## How to customise Line Sparklines

In order to customise the line sparklines, it is necessary to add `sparklineOptions` in the column definitions.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    // Sparkline customisaion goes here.
                }
            },
        },
        // other column definitions ...
    ],
}
</snippet>

In a Line Sparkline, it is possible to format the following:
- [Line](/sparklines-line-sparkline/#customising-the-line) - customised using `line` options.
- [Markers](/sparklines-line-sparkline/#customising-the-markers) - customised using `marker` and `highlightStyle` options.
- [Padding](/sparklines-line-sparkline/#customising-the-padding) - customised using `padding` options.

More advanced customisation options are discussed in isolation on the following pages:
- [Tooltips](/sparklines-tooltips/) - configuration of tooltips using `tooltip` options.
- [Special Points](/sparklines-special-points/) - customisation of individual points of interest using a `formatter`.
- [Axis](/sparklines-axis-types/) - supported x-axis types and configuration via `axis` options.

## Customising The Line

To apply custom `stroke` and `strokeWidth` attributes to the line, set these properties under `line` options as shown:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    // Customise the line path in the sparkline.
                    line: {
                        stroke: 'orange',
                        strokeWidth: 2
                    }
                    // other sparkline options ...
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

The result of the above configuration is dipslayed here.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Marker customisation" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-line.png" alt="Marker customisation for highlighted state" width="250px" constrained="true">Custom Line</image-caption>
</div>

## Customising The Markers

The markers are enabled by default but the size has been set to `0`, making them invisible.

The `size` property in the `highlightStyle` options is `6` pixels by default, allowing the markers to become visible when in the highlighted state.

These formats can all be modified to your liking by setting the `marker` and `highlightStyle` options as demonstated here.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    marker: {
                        size: 3,
                        shape: 'diamond',
                        fill: 'green',
                        stroke: 'green',
                        strokeWidth: '2'
                    },
                    highlightStyle: {
                        size: 10,
                        fill: 'cyan',
                        stroke: 'cyan',
                    },
                    // other sparkline options ...
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

- In the snippet above, we have configured the marker size to be `3`px in the un-highlighted normal state, and `10`px in the highlighted state.
- Note that the fill and stroke are also different depending on the highlighted state of the marker.

Here is the result of the configuration shown in the above snippet.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Marker customisation" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-marker.png" alt="Marker customisation" width="250px" constrained="true">Custom Marker</image-caption>
    <image-caption src="resources/custom-highlighted-marker.png" alt="Marker customisation for highlighted state" width="250px" constrained="true">Custom Highlighted Marker</image-caption>
</div>

## Customising the Padding

To add extra space around the sparklines, custom `padding` options can be applied in the following way.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    // Adjust the padding around the sparklines
                    padding: {
                        top: 10,
                        right: 5,
                        bottom: 10,
                        left: 5
                    },
                    // other sparkline options ...
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

- The `top`, `right`, `bottom` and `left` properties are all optional and can be modified independently.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default-padding.png" alt="Marker customisation" width="250px" constrained="true">Default Padding</image-caption>
    <image-caption src="resources/custom-padding.png" alt="Marker customisation for highlighted state" width="250px" constrained="true">Custom Padding</image-caption>
</div>

### Example: Customising the Line Sparklines
Here is an example to further demonstrate how line sparklines can be configured.

<grid-example title='Line Sparkline' name='line-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces
The interfaces for the attributes which can be customised in a line sparkline.

### LineSparklineOptions

<interface-documentation interfaceName='LineSparklineOptions' ></interface-documentation>

## Next Up

Continue to the next section to learn about the: [Area Sparklines](/sparklines-area-sparkline/).
