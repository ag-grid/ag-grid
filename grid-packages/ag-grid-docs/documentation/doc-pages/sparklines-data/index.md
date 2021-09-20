---
title: "Sparklines - Data"
enterprise: true
---

This section covers the formats of data supported by the sparklines

## Sparklines Data

By default, the `agSparklineCellRenderer` sets the sparkline data to the row data for the specific column. The data array can consist of numbers, tuples or complex objects.

``` ts
type Data = number[] | [XValueType, number][] | object[];

type XValueType = number | string | Date | { toString: () => string };
```

In all formats, the y values should be `number` values as they are plotted using the number axis on a continuous scale.

If present, the x values can be of types `number`, `string`, `Date` or objects with a `toString` method.


If the data provided is an array of numbers (`number[]`), each number will be a y-value with the corresponding index being the x-value. In this case the x values are plotted using the default category axis, i.e. the data points will be evenly spaced out along the x-axis.

Otherwise, if the data is an array of tuples or complex objects, the x values will be pulled from the data. By default, the category axis will be used to plot the x-values, but, the type of axis can be configured via the axis options. See [Axis Types](/sparklines-axis-types/) for a more details on configuring the x-axis type.

### Data Formats
## Array of numbers

The simplest data format supported by the sparkline is the `number[]` format. This does not require any further configuration, simply provide the array of numbers to the grid for that specific field or format the data using the `valueGetter` property to return an array of numbers for each cell in the sparkline column, `agSparklineCellRenderer` will take care of the rest.

The numbers in the data array correspond to y-values. y-values are always rendered using the continuous scale.
The x-value for each data point will be the index of the value in the data array, plotted using the category axis.

This is demonstated in the simple example below, where the 'Rate of Change' column contains the sparkline cell renderer. Note that the data for the `rateOfChange` field in the data.js file is a `number[]`.

<grid-example title='Sparkline Data' name='sparkline-data-number-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Array of tuples

Another supported format is the tuples array. In this format, each tuple in the array can contain two values, x and y. At index 0 will be the x value and index 1, the y value. The y should be a `number` value whereas the x can be a `number`, `string`, `Date` or an object with a `toString` method.

Note in the data.js file, the data for the `rateOfChange` field is of type `[Date, number][]`, where the x value is a `Date` object. The data for this field is automatically supplied to the sparkline via the `agSparklineCellRenderer`.

Though the default category axis would be valid, the x-axis has been configured to be of type `time` to depict a more meaningful data trend as the x-values are `Date` objects.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    axis: {
                        type: 'time'
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

<grid-example title='Sparkline Data' name='sparkline-data-tuple-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Array of objects

Providing data as an array of objects requires xKey and yKey to be configured in the options.

In the example below, the data is an array of objects with the `xVal` and `yVal` keys. These keys can be any string value as long as they are specified in the options object.

By default, the xKey and yKey are `'x'` and `'y'` respectively, so data objects with the `'x'` and `'y'` keys would work fine without explicit configuration.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'line',
                    xKey: 'xVal',
                    yKey: 'yVal',
                    axis : {
                        type: 'number'
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

Here, the x-values are numbers so the x-axis type is set to `number`.

<grid-example title='Sparkline Data' name='sparkline-data-object-array' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Next Up

Continue to the next section to learn about the: [Axis Types](/sparklines-axis-types/).
