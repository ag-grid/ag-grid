---
title: "Sparklines - Area Sparkline"
enterprise: true
---

In this section we will discuss how to create and customise Area Sparklines.

## Area Sparklines

To create area sparklines in the grid:
 - Add `agSparklineCellRenderer` and `sparklineOptions` in the column configuration.
 - Set the `type` property in `sparklineOptions` to `'area'`. If the `'area'` type is omitted, the default line sparklines will be created.

This is shown in the below snippet:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    // Specify the type as 'area'.
                    type: 'area',
                    // Other area sparkline options go here.
                },
            },
        },
        // other column definitions ...
    ],
};
</snippet>

An area sparkline is similar to a line sparkline in that it consists of markers to represent the data points and a line connecting them.
Additionally, the area sparkline has a colored area between the data points and the horizontal x-axis line.

As such, here are the area sparkline attributes which can be cutomised:
- [Line](/sparklines-area-sparkline/#customising-the-line) - customised using `line` options.
- [Markers](/sparklines-area-sparkline/#customising-the-markers) - customised using `marker` and `highlightStyle` options.
- [Fill](/sparklines-area-sparkline/#customising-the-area-fill) - customised using the `fill` property in `sparklineOptions`.
- [Axis Style](/sparklines-area-sparkline/#customising-the-axis-line) - customised using the `axis` options.
- [Padding](/sparklines-area-sparkline/#customising-the-padding) - customised using `padding` options.

More advanced customisation options are discussed in isolation on the following pages:
- [Tooltips](/sparklines-tooltips/) - configuration of tooltips using `tooltip` options.
- [Special Points](/sparklines-special-points/) - customisation of individual points of interest using a `formatter`.
- [Axis Types](/sparklines-axis-types/) - supported x-axis types and configuration via `axis` options.

## Customising The Line

To apply custom `stroke` and `strokeWidth` attributes to the line, set these properties under `line` options as shown:

```js
sparklineOptions: {
    type: 'area',
    // Customise the line path in the area sparkline.
    line: {
        stroke: 'orange',
        strokeWidth: 2
    },
}
```

The result of the above configuration is dipslayed here.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Line default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-line.png" alt="Line customisation" width="250px" constrained="true">Custom line</image-caption>
</div>

## Customising The Markers

The markers are enabled by default but the size has been set to `0`, making them invisible.

The `size` property in the `highlightStyle` options is `6` pixels by default, allowing the markers to become visible when in the highlighted state.

These formats can all be modified to your liking by setting the `marker` and `highlightStyle` options as demonstated here.

```js
sparklineOptions: {
    type: 'area',
    marker: {
        size: 3,
        // Optional - marker shape is 'circle' by default.
        shape: 'circle',
        fill: 'green',
        stroke: 'green',
        strokeWidth: '2'
    },
    highlightStyle: {
        size: 10,
        fill: 'cyan',
        stroke: 'cyan',
    },
}
```

- In the snippet above, we have configured the marker size to be `3`px in the un-highlighted normal state, and `10`px in the highlighted state.
- Note that the fill and stroke are also different depending on the highlighted state of the marker.

Here is the result of the configuration shown in the above snippet.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Marker default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-marker.png" alt="Marker customisation" width="250px" constrained="true">Custom marker</image-caption>
    <image-caption src="resources/custom-highlighted-marker.png" alt="Marker customisation for highlighted state" width="250px" constrained="true">Custom highlighted marker</image-caption>
</div>

## Customising the Area Fill

To change the color of the area between the data points to the horizontal axis line, add the `fill` property to `sparklineOptions` as shown here.

```js
sparklineOptions: {
    type: 'area',
    // Colorize the area between the points to the axis line.
    fill: 'lavender',
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Area fill default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-fill.png" alt="Area fill customisation" width="250px" constrained="true">Custom fill</image-caption>
</div>

The given `fill` string can be in one of the following formats:
- \#rgb - Short Hex Code
- \#rrggbb - Hex Code
- rgb(r, g, b) - RGB Absolute
- rgba(r, g, b, a) - RGB with an alpha channel
- CSS color keyword - such as 'aqua', 'orange', etc.

## Customising the Axis Line

By default, an x-axis line is displayed, this can be modified using the `axis` options.

Here is a snippet to demonstrate axis formatting.

```js
sparklineOptions: {
    type: 'area',
    // Format the x-axis line.
    axis: {
        stroke: 'coral',
        strokeWidth: 2
    },
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Axis line default" width="250px" constrained="true">Default axis</image-caption>
    <image-caption src="resources/custom-axis.png" alt="Axis line customisation" width="250px" constrained="true">Custom axis</image-caption>
</div>

[[note]]
| It is possible to remove the x-axis entirely by setting the axis `strokeWidth` to `0`.


## Customising the Padding

To add extra space around the sparklines, custom `padding` options can be applied in the following way.

```js
sparklineOptions: {
    type: 'area',
    // Adjust the padding around the sparklines.
    padding: {
        top: 10,
        right: 5,
        bottom: 10,
        left: 5
    },
}
```

- The `top`, `right`, `bottom` and `left` properties are all optional and can be modified independently.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default-padding.png" alt="Padding default" width="250px" constrained="true">Default padding</image-caption>
    <image-caption src="resources/custom-padding.png" alt="Padding customisation" width="250px" constrained="true">Custom padding</image-caption>
</div>


### Example: Customising the Area Sparklines
Here is an example to further demonstrate how area sparklines can be configured.

- The `sparklineOptions` object contains the properties that get applied to the area, the line and every marker.

<grid-example title='Area Sparkline' name='area-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces

The interfaces for the available options are as follows:

### AreaSparklineOptions

<interface-documentation interfaceName='AreaSparklineOptions' ></interface-documentation>

## Next Up

Continue to the next section to learn about the: [Column Sparklines](/sparklines-column-sparkline/).
