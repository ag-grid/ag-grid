---
title: "Sparklines - Axis Types"
enterprise: true
---

This section compares the different horizontal axis types that are available to all sparklines. 

When choosing an appropriate axis it is important to consider the data the sparkline is based on, this ensures X values 
are scaled correctly along the x-axis. 

The following axes types are available to all sparklines:

- ***[Category Axis](/sparklines-axis-types/#category-axis)*** - data points are evenly spread along the x-axis.
- ***[Number Axis](/sparklines-axis-types/#number-axis)*** - data is spaced based on the magnitude of the x values.
- ***[Time Axis](/sparklines-axis-types/#time-axis)*** - data is spaced according to the time between data points.

[[note]]
| The Y values supplied in the sparkline data will always be plotted using the [Number Axis](/sparklines-axis-types/#number-axis) on a continuous scale.

## Category Axis

The category axis is used as the x-axis by default. X values will be plotted on a band scale which means the data points
will be evenly spaced out along the horizontal axis. 

The category axis is ideal for small datasets with discrete values or categories.

To configure the axis type, simply add the `type` property to the axis options as shown below.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    axis: {
                        // Optional - 'category' is the default axes
                        type: 'category'
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the x-axis type is set to `category` but this is optional as the x-axis is `category` by default.

The example below demonstrates the category axis used in an area sparklines. Note the following:

- Note in the data.js file, the data for the `rateOfChange` field is of type `[string, number][]`, where x values are type `string`.
- String values are considered as categories as they are not quantitative and thus cannot take on all real values between two particular values.
- A category axis is also suitable for quantitative values which are discrete or fixed.

<grid-example title='Sparkline Category Axis' name='sparkline-category-axis' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Number Axis

The number axis is used as a value axis. When the number axis is used, the horizontal distance between the data points depends on the magnitude of the x values.

For the number axis type, the supplied x values must be `number` values as they will be plotted on a continuous scale with numeric intervals.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    axis: {
                        // set x-axis type to 'number'
                        type: 'number'
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the x-axis type is set to `number`. This is useful in the case where the magnitude of x values must be reflected in the sparkline through the horizontal distance between data points.

The example below shows the area sparklines rendered using a number axis.

- Note in the data.js file, the data for the `rateOfChange` field is of type `[number, number][]`, where x values are type `number`.

<grid-example title='Sparkline Number Axis' name='sparkline-number-axis' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Time Axis

The time axis is similar to the number axis in the sense that it is also used to plot continuous values. It can be used 
for `number` values, which will be interpreted as timestamps derived from Unix time, or `Date` objects.

The following example demonstrates the time axis type.

- Note in the data.js file, the data for the `rateOfChange` field is of type `[Date, number][]`, where x values are `Date` objects.
- Though the default category axis would be valid, the x-axis has been configured to be of type `time` to depict a more meaningful data trend as the х values are `Date` objects.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    axis: {
                        // set x-axis type to 'time'
                        type: 'time'
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

<grid-example title='Sparkline Time Axis' name='sparkline-time-axis' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## SparklineAxisOptions

<api-documentation source='sparklines-axis-types/resources/sparkline-axis-api.json' section='SparklineAxisOptions'></api-documentation>

## Next Up

Continue to the next section to learn about the: [Tooltips](/sparklines-tooltips/).
