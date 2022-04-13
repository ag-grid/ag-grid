---
title: "Sparklines - Bar Customisation"
enterprise: true
---

This section shows how Bar Sparklines can be customised by overriding the default bar options.

The following [Bar Sparkline Options](/sparklines-bar-customisation/#barsparklineoptions) can be used to customise Bar Sparklines:

- [Bar Fill Options](/sparklines-bar-customisation/#bar-fill-options)
- [Bar Stroke Options](/sparklines-bar-customisation/#bar-stroke-options)
- [Bar Padding Options](/sparklines-bar-customisation/#bar-padding-options)
- [Bar Label Options](/sparklines-bar-customisation/#bar-label-options)
- [Axis Line Options](/sparklines-bar-customisation/#axis-line-options)
- [Sparkline Padding Options](/sparklines-bar-customisation/#sparkline-padding-options)

Also see [Additional Customisations](/sparklines-bar-customisation/#additional-customisations) for more advanced
customisations that are common across all sparklines.

The snippet below shows option overrides for the Bar Sparkline:

```js
sparklineOptions: {
    type: 'bar',
    // Optional customisation properties
    fill: '#5470c6',
    stroke: '#91cc75',
    highlightStyle: {
        fill: '#fac858'
    },
    valueAxisDomain: [0, 1]
},
```

In the snippet above, the `valueAxisDomain` property is optional.

`valueAxisDomain` is used to specify the interval within which the data values lie. These boundaries are used to create a scale which will be used to map data values from `0px` to the size of the sparkline.

If the `valueAxisDomain` property is ommitted, the domain will be set to the minmum and maximum values in the provided data, hence it could be different for different sparklines in the grid depending on the provided data.

The following example demonstrates the results of the Bar Sparkline options above:

- Note that `valueAxisDomain` has been set to `[0, 1]`, indicating that the supplied data across all sparklines will contain values from `0` to `1`. This allows easy comparisons across the different sparklines in the grid column as all sparklines will have the same domain.

<grid-example title='Bar Sparkline Customisation' name='bar-sparkline-customisation' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Bar Fill Options

To apply a custom color to the bars, set the `fill` property in `sparklineOptions` as shown:

```js
sparklineOptions: {
    type: 'bar',
    fill: '#91cc75', // sets the bar fill
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Bar fill default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-fill.png" alt="Bar fill customisation" width="250px" constrained="true">Custom fill</image-caption>
</div>

It is possible to set the fill for the highlighted state of the bar by adding `fill` in `highlightStyle` options as follows:

```js
sparklineOptions: {
    type: 'bar',
    highlightStyle: {
        fill: 'orange', // sets the highlighted bar fill
    }
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default-highlighted.png" alt="Highlighted Bar fill default" width="250px" constrained="true">Default highlighted fill</image-caption>
    <image-caption src="resources/custom-highlighted-fill.png" alt="Highlighted Bar fill customisation" width="250px" constrained="true">Custom highlighted fill</image-caption>
</div>

The given `fill` string can be in one of the following formats:
- `#rgb` - Short Hex Code
- `#rrggbb` - Hex Code
- `rgb(r, g, b)` - RGB
- `rgba(r, g, b, a)` - RGB with an alpha channel
- CSS color keyword - such as `aqua`, `orange`, etc.

## Bar Stroke Options

By default, the `strokeWidth` of each bar is `0`, so no outline is visible around the bars.

To add a stroke, modify the `strokeWidth` and `stroke` properties as shown below.

```js
sparklineOptions: {
    type: 'bar',
    stroke: '#ec7c7d', // sets the bar stroke
    strokeWidth: 2, // sets the bar stroke width
    highlightStyle: {
        stroke: '#b5ec7c', // sets the highlighted bar stroke
        strokeWidth: 2, // sets the highlighted bar stroke width
    }
}
```

- In the snippet above, we have configured the bar stroke to be `2`px in the un-highlighted state, and `2`px in the highlighted state.
- Note that the `stroke` property is also different depending on the highlighted state of the bar.

Here is the result of the configuration shown in the above snippet.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Stroke default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-stroke.png" alt="Stroke customisation" width="250px" constrained="true">Custom stroke</image-caption>
    <image-caption src="resources/custom-highlighted-stroke.png" alt="Stroke customisation for highlighted state" width="250px" constrained="true">Custom highlighted stroke</image-caption>
</div>

[[note]]
| If `strokeWidth` is set to a value greater than `1`, it is recommended to set the axis line `strokeWidth` to the same value in order to preserve the alignment of the bars with the x-axis line.

## Bar Padding Options

The spacing between bars is adjustable via the `paddingInner` property. This property takes values between 0 and 1.

It is a proportion of the “step”, which is the interval between the start of a band and the start of the next band.

Here's an example.

```js
sparklineOptions: {
    type: 'bar',
    paddingInner: 0.5, // sets the padding between bars.
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Bar padding default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-padding-inner.png" alt="PaddingInner customisation" width="250px" constrained="true">Custom paddingInner</image-caption>
</div>

The padding on the outer edges of the first and last bars can also be adjusted. As with `paddingInner`, this value can be between 0 and 1.

If the value of `paddingOuter` is increased, the x-axis line will stick out more at both ends of the sparkline.

Here's a snippet where the `paddingOuter` is set to `0`.

```js
sparklineOptions: {
    type: 'bar',
    paddingOuter: 0, // sets the padding on the outer edge of the first and last bars.
}
```

In this case there will be no gap on either end of the sparkline, i.e. between the axis line start and the first bar and the axis line end and the last bar.
This is demonstrated below in the middle sparkline.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="bar padding default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-padding-outer.png" alt="PaddingOuter customisation" width="250px" constrained="true">No paddingOuter</image-caption>
    <image-caption src="resources/custom-padding-outer-2.png" alt="PaddingOuter customisation" width="250px" constrained="true">Increased paddingOuter</image-caption>
</div>

## Bar Label Options

To enable bar labels, set the `enabled` property in `label` options as shown:

```js
sparklineOptions: {
    type: 'bar',
    label: {
        enabled: true // show bar labels
    }
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Bar default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/default-label.png" alt="Bar labels enabled" width="250px" constrained="true">Label enabled</image-caption>
</div>

It is possible to change the text value displayed as the label of individual bars by adding a `formatter` callback function to `label` options as follows:

```js
sparklineOptions: {
    type: 'bar',
    label: {
        enabled: true,
        formatter: labelFormatter
    }
}

function labelFormatter({ value }) {
    return `${value}%`
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Bar default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-label-formatter.png" alt="Bar label text customisation" width="250px" constrained="true">Custom label text</image-caption>
</div>

To customise the label text style, set the style attributes in `label` options as follows:

```js
sparklineOptions: {
    type: 'bar',
    label: {
        enabled: true,
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: 9,
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: 'black',
    }
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Bar default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-label-styles.png" alt="Bar label text style customisation" width="250px" constrained="true">Custom label text styles</image-caption>
</div>


The position of the labels can be specified by setting the `placement` property in `label` options. By default, the labels are positioned at the end of the bars on the inside, i.e. `placement` is set to `insideEnd `. The snippet below shows how the positioning of the label can be modified:

```js
sparklineOptions: {
    type: 'bar',
    label: {
        enabled: true,
        placement: 'center', // positions the labels in the center of the bars
    }
}
```

Label `placement` options include `insideBase`, `center`, `insideEnd` and `outsideEnd`. These are shown in the screenshots below.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/custom-label-placement-insideBase.png" alt="Bar label insideBase placement" width="250px" constrained="true">insideBase</image-caption>
    <image-caption src="resources/custom-label-placement-center.png" alt="Bar label center placement" width="250px" constrained="true">center</image-caption>
</div>
<div style="display: flex; justify-content: center;">
    <image-caption src="resources/custom-label-placement-insideEnd.png" alt="Bar label insideEnd placement" width="250px" constrained="true">insideEnd</image-caption>
    <image-caption src="resources/custom-label-placement-outsideEnd.png" alt="Bar label placement default" width="250px" constrained="true">outsideEnd</image-caption>
</div>

[[note]]
| When configuring labels with placement:`outsideEnd`, it is recommended to add some padding to the sparkline using the `padding` options in order to prevent the labels from being clipped.

## Axis Line Options

By default, an x-axis line is displayed which can be modified using the `axis` options.

Here is a snippet to demonstrate axis formatting.

```js
sparklineOptions: {
    type: 'bar',
    axis: {
        stroke: '#7cecb3', // sets the x-axis line stroke
        strokeWidth: 3, // sets the x-axis line strokeWidth
    },
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Axis line default" width="250px" constrained="true">Default axis line</image-caption>
    <image-caption src="resources/custom-axis.png" alt="Axis line customisation" width="250px" constrained="true">Custom axis line</image-caption>
</div>

[[note]]
| It's possible to remove the x-axis line entirely by setting the axis `strokeWidth` to `0`.

## Sparkline Padding Options

To add extra space around the sparklines, custom `padding` options can be applied in the following way.

```js
sparklineOptions: {
    type: 'bar',
    // sets the padding around the sparklines
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
    <image-caption src="resources/default-padding.png" alt="Padding customisation" width="250px" constrained="true">Default padding</image-caption>
    <image-caption src="resources/custom-padding.png" alt="Padding customisation" width="250px" constrained="true">Custom padding</image-caption>
</div>

## Building Progress Bars

A progress bar can be used to visualise and compare values across multiple sparklines in the grid. It can illustrate values which have a fixed domain such as percentages and scores.

The following example shows how to build progress bars using bar sparklines. Note that:

- In order to display a progress bar in a sparkline, the data array should only contain a single value, more values in the data array will produce additional bars in the same sparkline.
- `valueAxisDomain` has been set to `[0, 100]`, indicating that the supplied data across all sparklines will contain values from `0` to `100`.
- This allows easy comparisons of percentages across the different sparklines in the grid column as all sparklines will have the same domain.
- The `formatter` callback function is used to dynamically set the fill color of each progress bar to different color values based on the data `yValue` .
- Percentage Y values are displayed on the inside end of each bar by configuring `label` options.
- The axis line and padding are removed to allow more space in each cell for the progress bar.

<grid-example title='Bar Sparkline – Progress Bars' name='bar-sparkline-progress-bars' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Additional Customisations

More advanced customisations are discussed separately in the following sections:

- [Axis](/sparklines-axis-types/) - configure the x-axis type via `axis` options.
- [Tooltips](/sparklines-tooltips/) - configure tooltips using `tooltip` options.
- [Points of Interest](/sparklines-points-of-interest/) - configure individual points of interest using a `formatter`.

## Interfaces

### BarSparklineOptions

<interface-documentation interfaceName='BarSparklineOptions' overrideSrc='sparklines-bar-customisation/resources/bar-sparkline-api.json'></interface-documentation>

### SparklineAxisOptions

<api-documentation source='sparklines-bar-customisation/resources/bar-sparkline-api.json' section='SparklineAxisOptions'></api-documentation>

### SparklineLabelOptions

<api-documentation source='sparklines-bar-customisation/resources/bar-sparkline-api.json' section='SparklineLabelOptions'></api-documentation>


## Next Up

Continue to the next section to learn about: [Column Sparkline Customisation](/sparklines-column-customisation/).
