---
title: "Sparklines - Area Customisation"
enterprise: true
---

This sections shows how Area Sparklines can be customised by overriding the default area options.

The following [Area Sparkline Options](/sparklines-area-customisation/#areasparklineoptions) can be used to customise Area Sparklines:

- [Area Line Options](/sparklines-area-customisation/#area-line-options)
- [Marker Options](/sparklines-area-customisation/#marker-options)
- [Area Fill Options](/sparklines-area-customisation/#area-fill-options)
- [Axis Line Options](/sparklines-area-customisation/#axis-line-options)
- [Sparkline Padding Options](/sparklines-area-customisation/#sparkline-padding-options)

Also see [Additional Customisations](/sparklines-area-customisation/#additional-customisations) for more advanced
customisations that are common across all sparklines.

The snippet below shows option overrides for the Area Sparkline:

```js
sparklineOptions: {
    type: 'area',
        fill: 'rgba(216, 204, 235, 0.3)',
        line: {
        stroke: 'rgb(119,77,185)',
    },
    highlightStyle: {
        fill: 'rgb(143,185,77)',
    },
    axis: {
        stroke: 'rgb(204, 204, 235)',
    }
}
```

The following example demonstrates the results of the Area Sparkline options above:

<grid-example title='Area Sparkline Customisation' name='area-sparkline-customisation' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Area Line Options

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

The result of the above configuration is displayed here.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Line default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-line.png" alt="Line customisation" width="250px" constrained="true">Custom line</image-caption>
</div>

## Marker Options

The markers are enabled by default but the size has been set to `0`, making them invisible.

The `size` property in the `highlightStyle` options is `6` pixels by default, allowing the markers to become visible when in the highlighted state.

These formats can all be modified to your liking by setting the `marker` and `highlightStyle` options as demonstrated here.

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

## Area Fill Options

To change the color of the area between the data points to the horizontal axis line, add the `fill` property to `sparklineOptions` as shown here.

```js
sparklineOptions: {
    type: 'area',
    fill: 'lavender', // sets the colour between the area line and axis
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Area fill default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-fill.png" alt="Area fill customisation" width="250px" constrained="true">Custom fill</image-caption>
</div>

The given `fill` string can be in one of the following formats:
- `#rgb` - Short Hex Code
- `#rrggbb` - Hex Code
- `rgb(r, g, b)` - RGB Absolute
- `rgba(r, g, b, a)` - RGB with an alpha channel
- CSS color keyword - such as `aqua`, `orange`, etc.

## Axis Line Options

By default, an x-axis line is displayed, this can be modified using the `axis` options.

Here is a snippet to demonstrate axis formatting.

```js
sparklineOptions: {
    type: 'area',
    axis: {
        stroke: 'coral', // sets the x-axis line stroke
        strokeWidth: 3, // sets the x-axis line stroke width
    }
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Axis line default" width="250px" constrained="true">Default axis</image-caption>
    <image-caption src="resources/custom-axis.png" alt="Axis line customisation" width="250px" constrained="true">Custom axis</image-caption>
</div>

[[note]]
| It is possible to remove the x-axis entirely by setting the axis `strokeWidth` to `0`.

## Sparkline Padding Options

To add extra space around the sparklines, custom `padding` options can be applied in the following way.

```js
sparklineOptions: {
    type: 'area',
    // sets the padding around the sparkline
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

## Additional Customisations

More advanced customisations are discussed separately in the following sections:

- [Axis](/sparklines-axis-types/) - configure the x-axis type and appearance via `axis` options.
- [Tooltips](/sparklines-tooltips/) - configure tooltips using `tooltip` options.
- [Special Points](/sparklines-special-points/) - configure individual points of interest using a `formatter`.

## Interfaces

The interfaces for the available options are as follows:

### AreaSparklineOptions

<interface-documentation interfaceName='AreaSparklineOptions' ></interface-documentation>

## Next Up

Continue to the next section to learn about: [Sparkline Data](/sparklines-data/).
