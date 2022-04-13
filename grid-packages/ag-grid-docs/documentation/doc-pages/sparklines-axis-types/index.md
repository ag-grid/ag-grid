---
title: "Sparklines - Axis Types"
enterprise: true
---

This section compares the different horizontal axis types that are available to all sparklines.

In order to select an appropriate sparkline axis type, it is important to consider the data the sparkline is displaying.
This ensures that X values are scaled correctly along the x-axis.

The following axis types are available to all sparklines:

- [Category Axis](/sparklines-axis-types/#category-axis) - data points are evenly spread along the x-axis.
- [Number Axis](/sparklines-axis-types/#number-axis) - data is spaced based on the magnitude of the X values.
- [Time Axis](/sparklines-axis-types/#time-axis) - data is spaced according to the time between data points.

[[note]]
| The Y values supplied in the sparkline data will always be plotted using the [Number Axis](/sparklines-axis-types/#number-axis) on a continuous scale.

Here's an illustration showing how sparklines can look visually different when different axis types are configured.

<div style="display: flex; justify-content: center;">
    <image-caption src="resources/time-axis.png" alt="Time axis" width="250px" constrained="true">Time Axis</image-caption>
    <image-caption src="resources/category-axis.png" alt="Category axis" width="250px" constrained="true">Category Axis</image-caption>
</div>

- Note that the same data is used for both sparklines.
- On the left, X values are plotted using a Time Axis, whereas on the right, X values are plotted using a Category Axis.

## Category Axis

The Category Axis is the default x-axis. X values will be plotted on a band scale which means the data points
will be evenly spaced out along the horizontal axis making it ideal for small datasets with discrete values or
categories.

The Category Axis is configured through the [SparklineAxisOptions](/sparklines-axis-types/#sparklineaxisoptions) as follows:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    axis: {
                        // use Category Axis (Optional)
                        type: 'category'
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the x-axis type is set to `'category'` but this is optional as the x-axis uses the `'category'` axis by default.

The example below demonstrates the Category Axis used in an Area Sparkline. Note the following:

- The **Rate Of Change** column is mapped to data containing an [Array of Tuples](/sparklines-data/#array-of-tuples) of type `[string, number][]`.
- The `string` X values are evenly spaced across the x-axis using a fixed width between each data point.
- The `string` X values are included in the tooltip.

<grid-example title='Sparkline Category Axis' name='sparkline-category-axis' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Number Axis

The Number Axis is used as a value axis. When the Number Axis is used, the horizontal distance between the data points
depends on the magnitude of the X values. X values must be `number` values as they are plotted on a continuous scale
with numeric intervals.

The Number Axis is configured through the [SparklineAxisOptions](/sparklines-axis-types/#sparklineaxisoptions) as follows:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'history',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    axis: {
                        // use Number Axis
                        type: 'number'
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the x-axis type is set to `'number'` to select a Number Axis instead of the default
[Category Axis](/sparklines-axis-types/#category-axis).

The example below demonstrates the Number Axis used in an Area Sparkline. Note the following:

- The **Rate Of Change** column is mapped to data containing an [Array of Tuples](/sparklines-data/#array-of-tuples) of type `[number, number][]`.
- The numeric X values are placed and spread along the x-axis based on the magnitude of the value.
- The numeric X values are included in the tooltip.

<grid-example title='Sparkline Number Axis' name='sparkline-number-axis' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Time Axis

The Time Axis is similar to the [Number Axis](/sparklines-axis-types/#number-axis) in that it is also used
to plot continuous values. X values can be `number` or `Date` objects, where `number` values are interpreted as
timestamps derived from Unix time.

The Time Axis is configured through the [SparklineAxisOptions](/sparklines-axis-types/#sparklineaxisoptions) as follows:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    axis: {
                        // use Time Axis
                        type: 'time'
                    }
                }
            },
        },
        // other column definitions ...
    ],
};
</snippet>

In the snippet above, the x-axis type is set to `'time'` to select a Time Axis instead of the default
[Category Axis](/sparklines-axis-types/#category-axis).

The example below demonstrates the Time Axis used in an Area Sparkline. Note the following:

- The **Rate Of Change** column is mapped to data containing an [Array of Tuples](/sparklines-data/#array-of-tuples) of type `[Date, number][]`.
- The `Date` X values are placed in chronological order and spread along the x-axis based on the time between data points.
- The `Date` X values are included in the tooltip.

<grid-example title='Sparkline Time Axis' name='sparkline-time-axis' type='generated' options='{ "enterprise": true, "exampleHeight": 585, "modules": ["clientside", "sparklines"] }'></grid-example>

## Interfaces

### SparklineAxisOptions

<api-documentation source='sparklines-axis-types/resources/sparkline-axis-api.json' section='SparklineAxisOptions'></api-documentation>

## Next Up

Continue to the next section to learn about: [Sparkline Tooltips](/sparklines-tooltips/).
