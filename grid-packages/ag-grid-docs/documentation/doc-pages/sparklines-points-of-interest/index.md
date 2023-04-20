---
title: "Sparklines - Points of Interest"
enterprise: true
---

This section covers customisation of Sparkline Points of Interest.

Some data points in the sparklines are special and can be emphasised to allow for quick identification and comparisons across the values of a single sparkline or across multiple sparklines of the same type. These include:

- First and Last
- Minimum and Maximum
- Positive and Negative

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/line-sparkline.png" alt="Line sparkline" width="250px" constrained="true">First and last</image-caption>
    <image-caption src="resources/area-sparkline.png" alt="Area sparkline" width="250px" constrained="true">Minimum and Maximum</image-caption>
    <image-caption src="resources/column-sparkline.png" alt="Column sparkline" width="250px" constrained="true">Negative and positive</image-caption>
</div>

These special points can be customised via the `formatter` callback function to make them stand out from the rest of the data points which are using the global styles.
- The formatter is a callback function used to return formatting for individual data points based on the given parameters.
- The formatter receives an input parameter according to the sparkline type.

Below are some examples demonstrating the different formatters for the three sparkline types:

- [Line and Area Sparklines Points of Interest](/sparklines-points-of-interest/#line-and-area-sparklines-points-of-interest)
- [Column and Bar Sparklines Points of Interest](/sparklines-points-of-interest/#column-and-bar-sparklines-points-of-interest)
- [Full Example](/sparklines-points-of-interest/#example-points-of-interest)

## Line and Area Sparklines Points of Interest

In the line and area sparklines, each data point is represented by a marker. To customise the points of interest, the `formatter` function is added to the `marker` options:

```js
sparklineOptions: {
    marker: {
        formatter: markerFormatter, // add formatter to marker options
    },
}
```

The `formatter` callback function will receive an input parameter of type [`markerFormatterParams`](/sparklines-points-of-interest/#markerformatterparams).

The function return type should be [`MarkerFormat`](/sparklines-points-of-interest/#markerformat), allowing the following attributes to be customised:

 - size
 - fill
 - stroke
 - strokeWidth

The following sections outline how the attributes mentioned above can be customised for various special points of interest:

- [First and Last](/sparklines-points-of-interest/#first-and-last)
- [Minimum and Maximum](/sparklines-points-of-interest/#min-and-max)
- [Positive and Negative](/sparklines-points-of-interest/#positive-and-negative)

 ### First and Last

Let's say we have a line sparkline where the markers are all `'skyblue'` but we want to make the first and last markers stand out with a purple `fill` and `stroke` style.

We can do this by adding the following formatter to the `marker` options.

```js
const markerFormatter = (params) => {
    const { first, last } = params;

    return {
        size: first || last ? 5 : 3,
        fill: first || last ? '#9a60b4' : 'skyblue',
        stroke: first || last ? '#9a60b4' : 'skyblue'
    }
}
```

- In the snippet above, `first` and `last` boolean values are extracted from the params object and used to conditionally set the `size`, `fill` and `stroke` of the markers.
- If the given data point is the first or last point i.e. if `first` or `last` is `true`, the `size` of the marker is set to `5`px. All other markers will be `3`px.
- Similar conditional logic is applied to colorise the markers to distinguish the first and last points from the rest.

See the result of adding this formatter in the sparklines on the right below, compared with the ones on the left which are using global styles in `marker` options:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-area-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-area-marker-first-last.png" alt="Area first and last marker customisation" width="250px" constrained="true">Formatted first and last points</image-caption>
</div>

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-line-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-line-marker-first-last.png" alt="Line first and last marker customisation" width="250px" constrained="true">Formatted first and last points</image-caption>
</div>

### Min and Max

Similar to first and last, to emphasise the min and max data points, the `min` and `max` booleans from the formatter params can be used to conditionally style the markers.

```js
const markerFormatter = (params) => {
    const { min, max } = params;

    return {
        size: min || max ? 5 : 3,
        fill: min ? '#ee6666' : max ? '#3ba272' : 'skyBlue',
        stroke: min ? '#ee6666' : max ? '#3ba272' : 'skyBlue',
    }
}
```

- If the data point is a minimum or a maximum point – if `min` or `max` is `true` – the size is set to `5`px, otherwise it is set to`3`px.
- If the marker represents a minimum point, the `fill` and `stroke` are set to red, if the marker represents a maximum point, the `fill` and `stroke` are set to green. Otherwise the fill and stroke are set to sky blue.

See the result of adding this formatter in the sparklines on the right below, compared with the ones on the left which are using global styles in `marker` options:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-area-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-area-marker-min-max.png" alt="Area min and max marker customisation" width="250px" constrained="true">Formatted min and max points</image-caption>
</div>


<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-line-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-line-marker-min-max.png" alt="Line min and max marker customisation" width="250px" constrained="true">Formatted min and max points</image-caption>
</div>


### Positive and Negative

The positive and negative values can be distinguished by adding a `formatter` which returns styles based on the `yValue` of the data point.

This is demonstrated in the snippet below.

```js
const markerFormatter = (params) => {
    const { yValue } = params;

    return {
        // if yValue is negative, the marker should be 'red', otherwise it should be 'green'
        fill: yValue < 0 ? 'red' : 'green',
        stroke: yValue < 0 ? 'red' : 'green'
    }
}
```

See the result of adding this formatter in the sparklines on the right below, compared with the ones on the left which are using global styles in `marker` options:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-area-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-area-marker-positive-negative.png" alt="Area positive and negative marker customisation" width="250px" constrained="true">Formatted positive and negative points</image-caption>
</div>


<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-line-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-line-marker-positive-negative.png" alt="Line positive and negative marker customisation" width="250px" constrained="true">Formatted positive and negative points</image-caption>
</div>


## Column And Bar Sparklines Points of Interest

Bar sparklines are just transposed column sparklines and have the same configuration. This section only covers column sparkline examples but the same applies for bar sparklines.

In the column sparklines, each data point is represented by a rectangle/ column. The `formatter` callback function applies to the individual columns and is added to `sparklineOptions`:

```js
sparklineOptions: {
    type: 'column',
    formatter: columnFormatter, // add formatter to sparklineOptions
}
```

The `formatter` will receive an input parameter with values associated with the data point it represents. The input parameter type is [`columnFormatterParams`](/sparklines-points-of-interest/#columnformatterparams).

The function return type should be [`ColumnFormat`](/sparklines-points-of-interest/#columnformat), allowing these attributes to be customised:

- fill
- stroke
- strokeWidth

The following sections outline how the attributes mentioned above can be customised for various special points of interest:

- [First and Last](/sparklines-points-of-interest/#first-and-last-1)
- [Minimum and Maximum](/sparklines-points-of-interest/#min-and-max-1)
- [Positive and Negative](/sparklines-points-of-interest/#positive-and-negative-1)

 ### First and Last

Let's say we want to make the first and last columns in our column sparklines stand out by styling them differently to the rest of the columns.

We can do this by adding the following formatter to the `sparklineOptions`.

```js
const columnFormatter = (params) => {
    const { first, last } = params;

    return {
        fill: first || last ? '#ea7ccc' : 'skyblue',
        stroke: first || last ? '#ea7ccc' : 'skyblue'
    }
}
```

Here is the result of  adding this formatter compared with setting global styles in `sparklineOptions`:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-column.png" alt="Global styles" width="250px" constrained="true">Global column styles</image-caption>
    <image-caption src="resources/custom-column-first-last.png" alt="Column first and last customisation" width="250px" constrained="true">Formatted first and last points</image-caption>
</div>


### Min and Max

Similar to first and last, to emphasise the min and max data points, the `min` and `max` booleans from the formatter params can be used to conditionally style the markers.

```js
const columnFormatter = (params) => {
    const { min, max } = params;

    return {
        fill: min ? '#ee6666' : max ? '#3ba272' : 'skyBlue',
        stroke: min ? '#ee6666' : max ? '#3ba272' : 'skyBlue',
    }
}
```

Here is the result of adding this formatter compared with setting global styles in `sparklineOptions`:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-column.png" alt="Global styles" width="250px" constrained="true">Global column styles</image-caption>
    <image-caption src="resources/custom-column-min-max.png" alt="Column minimum and maximum customisation" width="250px" constrained="true">Formatted minimum and maximum points</image-caption>
</div>

### Positive and Negative

The positive and negative values can be distinguished by adding a formatter which returns styles based on the `yValue` of the data point.

This is demonstrated in the snippet below.

```js
const columnFormatter = (params) => {
    const { yValue } = params;

    return {
        // if yValue is negative, the column should be dark red, otherwise it should be purple
        fill: yValue < 0 ? '#a90000' : '#5470c6',
        stroke: yValue < 0 ? '#a90000' : '#5470c6'
    }
}
```

Here is the result of adding this formatter compared with setting global styles in `sparklineOptions`:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-column.png" alt="Global styles" width="250px" constrained="true">Global column styles</image-caption>
    <image-caption src="resources/custom-column-positive-negative.png" alt="Column positive and negative customisation" width="250px" constrained="true">Formatted positive and negative points</image-caption>
</div>


## Example: Points of Interest

The example below shows formatting of special points for line, area and column sparklines.

It should be noted that

- The `highlighted` property on the `params` object is used to distinguish between highlighted and un-highlighted states.
- The `formatter` for line and area sparklines is added to the `marker` options
- The `size` property is returned from the area and line formatters to make certain special markers visible and the rest invisible.

<grid-example title='Sparkline Special Points' name='sparkline-special-points' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

[[note]]
| All formatters will receive the highlighted property in the input. If the current data point is highlighted, the highlighted property will be set to true; make sure to check this if you want to differentiate between the highlighted and un-highlighted states when customising the special points.


## Interfaces

### MarkerFormatterParams

<interface-documentation interfaceName='MarkerFormatterParams' ></interface-documentation>

### MarkerFormat

<interface-documentation interfaceName='MarkerFormat' ></interface-documentation>

### ColumnFormatterParams

<interface-documentation interfaceName='ColumnFormatterParams' ></interface-documentation>

### ColumnFormat

<interface-documentation interfaceName='ColumnFormat' ></interface-documentation>
