---
title: "Sparklines - Sparkline Data"
enterprise: true
---

This section starts off by comparing the different supported data formats before discussing how data can be formatted
using a [Value Getter](/value-getters/) for sparklines and then shows how data updates are handled.

## Supported Data Formats

Sparklines are configured on a per-column basis and are supplied data based on their column configuration, just like any
other grid cell, i.e. columns are configured with a `field` attribute or [Value Getter](/value-getters/).

The data supplied to sparklines can be in the following formats:

- [Array of Numbers](/sparklines-data/#array-of-numbers)
- [Array of Tuples](/sparklines-data/#array-of-tuples)
- [Array of Objects](/sparklines-data/#array-of-objects)

In each of the formats above, Y values must be of type `number`, whereas X values can be a `number`, `string`, `Date` or
objects with a `toString` method, if they are provided.

It may be necessary to [Format Sparkline Data](/sparklines-data/#formatting-sparkline-data) using Value Getters if the data
supplied to the grid is not in the correct format.

### Array of Numbers

The simplest data format supported by the sparkline is the `number[]` format. This does not require any further
configuration, simply provide the array of numbers to the grid for that specific field.

Alternatively, a `valueGetter` can be added to return an array of numbers for each cell in the sparkline column.

- The numbers in the data array correspond to Y values.
- The X value for each data point will be the index of the value in the data array. For this reason, the data points will be evenly spaced out along the width of the sparkline.

- Note that the data for the `rateOfChange` field in the data.js file is a `number[]`.

<grid-example title='Sparkline Data - Array of Numbers' name='sparkline-data-number-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

### Array of Tuples

Another supported format is the tuples array. In this format, each tuple in the array can contain two values, X and Y.

- At index 0 will be the X value and index 1, the Y value.
- The Y value should be a `number` whereas the X can be a `number`, `string`, `Date` or an object with a `toString` method.
- The `rateOfChange` field is of type `[Date, number][]`, where X values are `Date` objects.

<grid-example title='Sparkline Data - Array of Tuples' name='sparkline-data-tuple-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

### Array of Objects

The sparkline also supports an array of objects as a data format. This requires setting the `xKey` and `yKey` properties in
the `sparklineOptions` to the corresponding property names in the objects you’re providing, as shown in the code snippet below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    // set xKey and yKey to the keys which can be used to retrieve X and Y values from the supplied data
                    xKey: 'xVal',
                    yKey: 'yVal',
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

Note in the example below:

- The data is an array of objects with the `xVal` and `yVal` keys.
- `xKey` and `yKey` can be any `string` value as long as they are specified in the options.
- By default, the `xKey` and `yKey` are `'x'` and `'y'` respectively, so data objects with `'x'` and `'y'` keys would work fine without further configuration.

<grid-example title='Sparkline Data - Array of Objects' name='sparkline-data-object-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Formatting Sparkline Data

If the data is not already in the required format, it is possible to provide `valueGetter` in the column definitions to format and supply data to the sparkline column.

The formatted data from `valueGetter` will be supplied to the sparkline automatically by `agSparklineCellRenderer`.

The following example demonstrates how data can be formatted using `valueGetter`.

- In this example, the data for the `rateOfChange` field is an object with `x` and `y` keys, both containing an array of numbers.
- A `valueGetter` is used to format this data into `[number, number][]`, entering the values for X and Y at each index in two arrays for the `rateOfChange` object.

<grid-example title='Formatting Sparkline Data' name='formatting-sparkline-data' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Missing Data Points

Missing or invalid X and Y values need to be handled differently and are described in the following sections:

### Missing Y values

If the Y value of the data point is `Infinity`, `null`, `undefined`, `NaN`, a `string` or an `object`, i.e. if it's not
a `number`, it will be classified as missing or invalid.

```js
// Missing Y Values
const data = [
    0.17,
    0.20,
    undefined,
    0.39,
    0.26,
    null,
    0.68,
    0.28
];
```

When a data point has a missing or invalid Y value, it will be rendered as a gap, this is illustrated in the images below:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/line-sparkline.png" alt="Line sparkline." width="250px" constrained="true">No missing Y values</image-caption>
    <image-caption src="resources/line-sparkline-invalid-y-values.png" alt="Line sparkline with gaps for invalid Y values." width="250px" constrained="true">Missing Y values</image-caption>
</div>

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/column-sparkline.png" alt="Column Sparkline" width="250px" constrained="true">No missing Y values</image-caption>
    <image-caption src="resources/column-sparkline-invalid-y-values.png" alt="Column sparkline with gaps for invalid Y values" width="250px" constrained="true">Missing Y values</image-caption>
</div>

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/area-sparkline.png" alt="Area Sparkline" width="250px" constrained="true">No missing Y values</image-caption>
    <image-caption src="resources/area-sparkline-invalid-y-values.png" alt="Area sparkline with gaps for invalid Y values" width="250px" constrained="true">Missing Y values</image-caption>
</div>


### Missing X values

If X values are supplied in the sparkline data but are inconsistent with the configured [axis type](/sparklines-axis-types/),
they are considered invalid and will be skipped in the sparkline.

There won't be any gaps, only the data points with valid x values will appear in the sparklines.

For example if the axis is configured to be a [Number Axis](/sparklines-axis-types/#number-axis), but some data points
have X values which are not of type `number`, these values will be considered invalid and will be ignored when the
sparkline is rendered.

```js
// Missing X Values
const data = [
    [2.1, 0.17],
    [2.3, 0.202],
    [undefined, 0.28],
    [2.9, 0.39],
    [3.3, 0.26],
    [null, 0.41],
    [3.9, 0.68],
    [4.3, 0.28],
];
```

The following images show the line, column and area sparklines with 8 complete data points on the left, and on the
right, with 6 valid X values and 2 invalid X values:

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/line-sparkline.png" alt="Line sparkline." width="250px" constrained="true">No missing X values</image-caption>
    <image-caption src="resources/line-sparkline-invalid-x-values.png" alt="Line sparkline with gaps for invalid Y values." width="250px" constrained="true">Missing X values</image-caption>
</div>
<div style="display: flex; justify-content: center;">
    <image-caption src="resources/column-sparkline.png" alt="Column Sparkline" width="250px" constrained="true">No missing X values</image-caption>
    <image-caption src="resources/column-sparkline-invalid-x-values.png" alt="Column sparkline with gaps for invalid Y values" width="250px" constrained="true">Missing X values</image-caption>
</div>
<div style="display: flex; justify-content: center;">
    <image-caption src="resources/area-sparkline.png" alt="Area Sparkline" width="250px" constrained="true">No missing X values</image-caption>
    <image-caption src="resources/area-sparkline-invalid-x-values.png" alt="Area sparkline with gaps for invalid Y values" width="250px" constrained="true">Missing X values</image-caption>
</div>

## Updating Sparkline Data

Updating Sparkline data is no different from updating any other cell data, for more details see
[Updating Data](/data-update/).

The following example demonstrates Sparkline data updates using the [Transaction Update API](/data-update-transactions/#transaction-update-api).

<grid-example title='Sparkline Data Updates' name='sparkline-data-updates' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "modules": ["clientside", "sparklines"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Sparkline Axis Types](/sparklines-axis-types/).
