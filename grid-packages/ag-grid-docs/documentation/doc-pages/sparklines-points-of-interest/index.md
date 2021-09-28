---
title: "Sparklines - Points of Interest"
enterprise: true
---

This section covers Sparkline Points of Interest.

In the line and area sparklines, each data point is represented by a marker. In the column sparkline, each data point is represented by a rectangle.
Some of these data points in the sparklines are special and can be emphasised to make comparisons easier across multiple sparklines of the same type.

Special points include:
- First and Last
- Minimum and Maximum
- Positive and Negative

These points can be customised via the `formatter` callback function to make them stand out from the rest of the normal data points which have global styles.
- The formatter is a callback function used to return formatting for individual data points based on the given parameters.
- It will receive an input according to the sparkline type.

## Line and Area Sparklines Points of Interest

To customise the points of interest in line and area sparklines, the `formatter` function is added to the `marker` options:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    marker: {
                        formatter: markerFormatter, // add markerFormatter to marker options
                    },
                },
            },
        },
        // other column definitions ...
    ],
};
</snippet>

The formatter callback function will receive an input of type [`markerFormatterParams](/sparklines-points-of-interest/#markerformatterparams).

The function return type should be [`MarkerFormat`](/sparklines-points-of-interest/#markerformat), allowing the following attributes to be customised:

 - enabled
 - size
 - fill
 - stroke
 - strokeWidth

 ### First and Last

Let's say we have a line sparkline where the markers are all `skyblue` but we want to make the first and last markers stand out with a purple fill and stroke style.

We can do this by adding the following formatter to the marker options.

<snippet>
|const lineMarkerFormatter = (params) => {
|    const { first, last } = params;
|
|    return {
|        size: first || last ? 5 : 3,
|        fill: first || last ? '#9a60b4' : 'skyblue',
|        stroke: first || last ? '#9a60b4' : 'skyblue'
|    }
|}
</snippet>

Here is the result of the adding this formatter compared with setting global styles in `marker` options:

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

<snippet>
|const lineMarkerFormatter = (params) => {
|    const { min, max } = params;
|
|    return {
|        size: min || max ? 5 : 3,
|        fill: min ? '#ee6666' : max ? '#3ba272' : 'skyBlue',
|        stroke: min ? '#ee6666' : max ? '#3ba272' : 'skyBlue',
|    }
|}
</snippet>

Here's how this looks in the area and line sparklines

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-area-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-area-marker-min-max.png" alt="Area min and max marker customisation" width="250px" constrained="true">Formatted min and max points</image-caption>
</div>


<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-line-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-line-marker-min-max.png" alt="Line min and max marker customisation" width="250px" constrained="true">Formatted min and max points</image-caption>
</div>


### Positive and Negative

The negative and positive values can be distinguished by adding a `formatter` which returns styles based on the `yValue` of the data point.

This is demonstrated in the snippet below.

<snippet>
|const lineMarkerFormatter = (params) => {
|    const { yValue } = params;
|
|    return {
|        // if yValue is negative, the marker should be 'red', otherwise it should be 'green'
|        fill: yValue < 0 ? 'red' : 'green',
|        stroke: yValue < 0 ? 'red' : 'green'
|    }
|}
</snippet>

The following screenshots demonstrate show this

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-area-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-area-marker-positive-negative.png" alt="Area positive and negative marker customisation" width="250px" constrained="true">Formatted positive and negative points</image-caption>
</div>


<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-line-marker.png" alt="Global styles" width="250px" constrained="true">Global marker styles</image-caption>
    <image-caption src="resources/custom-line-marker-positive-negative.png" alt="Line positive and negative marker customisation" width="250px" constrained="true">Formatted positive and negative points</image-caption>
</div>


## Column Sparklines Points of Interest

The `formatter` callback function for column sparklines applies to the individual columns and is added to `sparklineOptions`:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'sparkline',
            headerName: 'Column Sparkline',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    formatter: columnFormatter, // add columnFormatter to sparklineOptions
                },
            },
        },
        // other column definitions ...
    ],
};
</snippet>

The formatter will receive an input with values associated with the data point it represents. The input type is [`columnFormatterParams](/sparklines-points-of-interest/#columnformatterparams).

The function return type should be [`ColumnFormat`](/sparklines-points-of-interest/#columnformat), allowing these attributes to be customised:

- fill
- stroke
- strokeWidth

 ### First and Last

Let's say we want to make the first and last columns in our column sparklines stand out by styling the first and last columns differently.

We can do this by adding the following formatter to the marker options.

<snippet>
|const columnFormatter = (params) => {
|    const { first, last } = params;
|
|    return {
|        fill: first || last ? '#ea7ccc' : 'skyblue',
|        stroke: first || last ? '#ea7ccc' : 'skyblue'
|    }
|}
</snippet>

Here is the result of the adding this formatter compared with setting global styles in `marker` options:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-column.png" alt="Global styles" width="250px" constrained="true">Global column styles</image-caption>
    <image-caption src="resources/custom-column-first-last.png" alt="Column first and last customisation" width="250px" constrained="true">Formatted positive and negative points</image-caption>
</div>


### Min and Max

Similar to first and last, to emphasise the min and max data points, the `min` and `max` booleans from the formatter params can be used to conditionally style the markers.

<snippet>
|const columnFormatter = (params) => {
|    const { min, max } = params;
|
|    return {
|        fill: min ? '#ee6666' : max ? '#3ba272' : 'skyBlue',
|        stroke: min ? '#ee6666' : max ? '#3ba272' : 'skyBlue',
|    }
|}
</snippet>

Here's how this looks in the area and line sparklines

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-column.png" alt="Global styles" width="250px" constrained="true">Global column styles</image-caption>
    <image-caption src="resources/custom-column-min-max.png" alt="Column minimum and maximum customisation" width="250px" constrained="true">Formatted minimum and maximum points</image-caption>
</div>


### Positive and Negative

The negative and positive values can be distinguished by adding a formatter which returns styles based on the `yValue` of the data point.

This is demonstrated in the snippet below.

<snippet>
|const columnFormatter = (params) => {
|    const { yValue } = params;
|
|    return {
|        // if yValue is negative, the column should be 'red', otherwise it should be 'green'
|        fill: yValue < 0 ? 'red' : 'green',
|        stroke: yValue < 0 ? 'red' : 'green'
|    }
|}
</snippet>

The images below show the result of the above formatter.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/global-column.png" alt="Global styles" width="250px" constrained="true">Global column styles</image-caption>
    <image-caption src="resources/custom-column-positive-negative.png" alt="Column positive and negative customisation" width="250px" constrained="true">Formatted positive and negative points</image-caption>
</div>


## Example: Special Points

The example below shows formatting of special points for line, area and column sparklines.

It should be noted that

- The highlighted property on the params is used to distinguish between highlighted and un-highlighted states.
- The formatter for line and area sparklines is added to the marker options
- The size property is returned from the area and line formatters to make certain special markers visible and the rest invisible.

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
