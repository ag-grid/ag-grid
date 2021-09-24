---
title: "Sparklines - Column Sparkline"
enterprise: true
---

This section introduces the Column Sparkline

## Column Sparklines

To create column sparklines in the grid:
 - Add `agSparklineCellRenderer` and `sparklineOptions` in the column configuration.
 - Set the `type` property in `sparklineOptions` to `'column'`. If the `'column'` type is omitted, the default line sparklines will be created.

This is shown in the below snippet:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    // Specify the type as 'column'.
                    type: 'column',
                    // Other column sparkline options go here.
                },
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In a column sparkline, each data point is represented by a column. The Column's height reflects the magnitude of the associated Y value.
The columns and their relative positions can be altered to change the visual display of the column sparklines.

The following can be modified to format the column sparklines:
- [Column Fill](/sparklines-column-sparkline/#customising-the-column-fill) - customised using the `fill` property and `highlightStyle` options in `sparklineOptions`.
- [Column Stroke](/sparklines-column-sparkline/#customising-the-column-stroke) - customised using the `stroke` and `strokeWidth` properties as well as `highlightStyle` options.
- [Column Padding](/sparklines-column-sparkline/#customising-the-column-padding) - customised using the `paddingInner` and `paddingOuter` properties in `sparklineOptions`.
- [Axis Style](/sparklines-column-sparkline/#customising-the-axis-line) - customised using `axis` options.
- [Sparkline Padding](/sparklines-column-sparkline/#customising-the-sparkline-padding) - customised using `padding` options.

More advanced customisation options are discussed in isolation on the following pages:
- [Tooltips](/sparklines-tooltips/) - configuration of tooltips using `tooltip` options.
- [Special Points](/sparklines-special-points/) - customisation of individual points of interest using a `formatter`.
- [Axis Types](/sparklines-axis-types/) - supported x-axis types and configuration via `axis` options.

## Customising The Column Fill

To apply a custom color to the columns, set the `fill` property in `sparklineOptions` as shown:

```js
sparklineOptions: {
    type: 'column',
    // Customise the fill of columns.
    fill: '#91cc75',
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Column fill default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-fill.png" alt="Column fill customisation" width="250px" constrained="true">Custom fill</image-caption>
</div>

It is possible to set the fill for the highlighted state of the column by adding `fill` in `highlightStyle` options as follows:

```js
sparklineOptions: {
    type: 'column',
    highlightStyle: {
        // Customise the fill of columns when they are highlighted.
        fill: `orange`
    }
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default-highlighted.png" alt="Highlighted Column fill default" width="250px" constrained="true">Default highlighted fill</image-caption>
    <image-caption src="resources/custom-highlighted-fill.png" alt="Highlighted Column fill customisation" width="250px" constrained="true">Custom highlighted fill</image-caption>
</div>

The given `fill` string can be in one of the following formats:
- \#rgb - Short Hex Code
- \#rrggbb - Hex Code
- rgb(r, g, b) - RGB Absolute
- rgba(r, g, b, a) - RGB with an alpha channel
- CSS color keyword - such as 'aqua', 'orange', etc.

## Customising The Column Stroke

By default, the `strokeWidth` of each column is `0`, so no outline is visible around the columns.

To add a stroke, modify the `strokeWidth` and `stroke` properties as shown below.

```js
sparklineOptions: {
    type: 'column',
    // Set stroke and strokeWidth of columns.
    stroke: '#ec7c7d',
    strokeWidth: '1',
    // Set stroke and strokeWidth of columns when in highlighted state.
    highlightStyle: {
        stroke: '#b5ec7c',
        strokeWidth: 2
    }
}
```

- In the snippet above, we have configured the column stroke to be `1`px in the un-highlighted state, and `2`px in the highlighted state.
- Note that the `stroke` property is also different depending on the highlighted state of the column.

Here is the result of the configuration shown in the above snippet.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Stroke default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-stroke.png" alt="Stroke customisation" width="250px" constrained="true">Custom stroke</image-caption>
    <image-caption src="resources/custom-highlighted-stroke.png" alt="Stroke customisation for highlighted state" width="250px" constrained="true">Custom highlighted stroke</image-caption>
</div>


[[note]]
| If `strokeWidth` is set to a value greater than `1`, it is recommended to set the axis line `stroke` to the same value in order to preserve the alignment of the columns with the x-axis line.

## Customising the Column Padding

The spacing between columns is adjustable via the `paddingInner` property. This property takes values between 0 and 1.

It is a proportion of the “step”, which is the interval between the start of a band and the start of the next band.

Here's an example.

```js
sparklineOptions: {
    type: 'area',
    // Modify the padding between columns.
    paddingInner: 0.1,
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Column padding default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-padding-inner.png" alt="PaddingInner customisation" width="250px" constrained="true">Custom paddingInner</image-caption>
</div>

The padding on the outer edges of the first and last columns can also be adjusted. As with `paddingInner`, this value can be between 0 and 1.

If the value of `paddingOuter` is increased, the x-axis line will stick out more at both ends of the sparkline.

Here's a snippet where the `paddingOuter` is set to `0`.

```js
sparklineOptions: {
    type: 'area',
    // Modify the padding on the outer edge of the first and last columns.
    paddingOuter: 0,
}
```

In this case there will be no gap on either end of the sparkline, i.e. between the axis line start and the first column and the axis line end and the last column.
This is demonstrated below in the middle sparkline.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="column padding default" width="250px" constrained="true">Default</image-caption>
    <image-caption src="resources/custom-padding-outer.png" alt="PaddingOuter customisation" width="250px" constrained="true">No paddingOuter</image-caption>
    <image-caption src="resources/custom-padding-outer-2.png" alt="PaddingOuter customisation" width="250px" constrained="true">Increased paddingOuter</image-caption>
</div>

## Customising the Axis Line

By default, an x-axis line is displayed which can be modified using the `axis` options.

Here is a snippet to demonstrate axis formatting.

```js
sparklineOptions: {
    type: 'column',
    // Format the x-axis line.
    axis: {
        stroke: '#7cecb3',
        strokeWidth: 3
    },
}
```

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/default.png" alt="Axis line default" width="250px" constrained="true">Default axis</image-caption>
    <image-caption src="resources/custom-axis.png" alt="Axis line customisation" width="250px" constrained="true">Custom axis</image-caption>
</div>

[[note]]
| It's possible to remove the x-axis entirely by setting the axis `strokeWidth` to `0`.


## Customising the Sparkline Padding

To add extra space around the sparklines, custom `padding` options can be applied in the following way.

```js
sparklineOptions: {
    type: 'column',
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
    <image-caption src="resources/default-padding.png" alt="Padding customisation" width="250px" constrained="true">Default padding</image-caption>
    <image-caption src="resources/custom-padding.png" alt="Padding customisation" width="250px" constrained="true">Custom padding</image-caption>
</div>


### Example: Customising the column Sparklines

Here is an example to further demonstrate how column sparklines can be configured.

<grid-example title='Column Sparkline' name='column-sparkline' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces
The interfaces for the available options are as follows:

### ColumnSparklineOptions

<interface-documentation interfaceName='ColumnSparklineOptions' ></interface-documentation>

## Next Up

Continue to the next section to learn about the: [Data Formats](/sparklines-data/).
