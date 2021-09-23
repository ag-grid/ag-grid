---
title: "Sparklines - Supplying Data"
enterprise: true
---

This section covers the different data formats supported by sparklines.

Sparklines are configured on a per-column basis and are supplied data based on the column configuration just like any 
other grid cell, i.e. columns are configured with a `field` attribute or [Value Getter](/value-getters/).

The data supplied to sparklines can be in the following formats:

- ***[Array of Numbers](/sparklines-data/#array-of-numbers)***
- ***[Array of Tuples](/sparklines-data/#array-of-tuples)***
- ***[Array of Objects](/sparklines-data/#array-of-objects)***

In each of the formats above, Y values must be of type `number`, whereas X values can be a `number`, `string`, `Date` or 
objects with a `toString` method, if they are provided.

## Array of Numbers

The simplest data format supported by the sparkline is the `number[]` format. This does not require any further configuration, simply provide the array of numbers to the grid for that specific field.

Alternatively, `valueGetter` can be added to return an array of numbers for each cell in the sparkline column.

- The numbers in the data array correspond to y-values.
- The x value for each data point will be the index of the value in the data array. For this reason, the data points will be evenly spaced out along the width of the sparkline.

This is demonstated in the simple example below, where the 'Rate of Change' column contains the sparkline cell renderer.
- Note that the data for the `rateOfChange` field in the data.js file is a `number[]`.

<grid-example title='Sparkline Data' name='sparkline-data-number-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Array of Tuples

Another supported format is the tuples array. In this format, each tuple in the array can contain two values, x and y.

- At index 0 will be the x value and index 1, the y value.
- The y value should be a `number` whereas the x can be a `number`, `string`, `Date` or an object with a `toString` method.
- Note in the data.js file, the data for the `rateOfChange` field is of type `[Date, number][]`, where x values are `Date` objects.

<grid-example title='Sparkline Data' name='sparkline-data-tuple-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Array of Objects

Providing data as an array of objects requires `xKey` and `yKey` to be configured in the options.

In the example below,

- The data is an array of objects with the `xVal` and `yVal` keys.
- `xKey` and `yKey` can be any `string` value as long as they are specified in the options.
- By default, the `xKey` and `yKey` are `'x'` and `'y'` respectively, so data objects with `'x'` and `'y'` keys would work fine without further configuration.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    // set xKey and yKey to the keys which can be used to retrieve x and y values from the supplied data
                    xKey: 'xVal',
                    yKey: 'yVal',
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

<grid-example title='Sparkline Data' name='sparkline-data-object-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Value Getter

If the data is not already in the required format, it is possible to provide `valueGetter` in the column definitions to format and supply data to the sparkline column.

The formatted data from `valueGetter` will be supplied to the sparkline automatically by `agSparklineCellRenderer`.

The following example demonstrates how data can be formatted using `valueGetter`.

- In this example, the data for the `rateOfChange` field is an object with `x` and `y` keys, both containing an array of numbers.
- valueGetter is used to format this data into `[number, number][]`, with x at index 0 and y at index 1 in each array.

<grid-example title='Sparkline Data' name='sparkline-data-value-getter' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Next Up

Continue to the next section to learn about the: [Axis Types](/sparklines-axis-types/).
