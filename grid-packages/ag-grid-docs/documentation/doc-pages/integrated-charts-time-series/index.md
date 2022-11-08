---
title: "Time Series"
enterprise: true
---

This section covers how to chart time series data using Integrated Charts.

Integrated Charts supports the charting of time series data using line and area charts when a time axis is chosen instead
of a category or numeric axis.

## Time vs Category Axis

A [Time Axis](/charts-axes/#time-axis) is used to plot continuous date / time values, whereas a
[Category Axis](/charts-axes/#category-axis) is used to plot discrete values or categories.


The example below highlights the differences between time and category axes. Notice that the time axis contains all
    days for the range of values provided, whereas the category axis only shows axis labels for the discrete values
    provide.


<grid-example title='Time vs Category Axis' name='time-vs-category' type='generated' options='{ "exampleHeight": 740, "enterprise": true, "modules": ["clientside", "menu", "charts"], "extras": ["momentjs"] }'></grid-example>

## Time Axis Configuration

Columns that contain date object values will be automatically plotted using a [Time Axis](/charts-axes/#time-axis)
unless it has been explicitly changed through the `chartDataType` column definition property.

Numeric timestamps in a unix format are also allowed, but the column should be explicitly configured to use a time axis
via `chartDataType='time'` on the column definition.

The following snippet shows how different time series values can be configured to enable a time axis:

<snippet>
const gridOptions = {
    columnDefs: [
        // date objects are treated as time by default
        { field: 'someDate' },
        { field: 'someTimestamp', chartDataType: 'time' },
    ],
    rowData: [
        {
            someDate: new Date(2019, 0, 1), // date object
            someTimestamp: 1167609600000, // numeric timestamp (unix format)
        },
        // ... more rows
    ]
}
</snippet>

Notice that no configuration is necessary for date objects but numeric timestamps and calendar date string require
that `chartDataType='time'` is set on the column definitions.

The following example demonstrates how a column containing numeric timestamps can be configured to use a time axis using
the `chartDataType='time'` property on the 'timestamp' column definition:

<grid-example title='Time Axis Configuration' name='time-axis-config' type='generated' options='{ "exampleHeight": 740, "enterprise": true, "modules": ["clientside", "menu", "charts"], "extras": ["momentjs"] }'></grid-example>

## Time Axis Combination Chart

A time axis can also be used in combination charts as shown in the following example.

For more details on how to configure a combination chart, see the [Range Chart API example](/integrated-charts-api-range-chart/#combination-charts).

<grid-example title='Time Axis Combination Chart' name='time-combination-chart' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts", "rowgrouping"], "exampleHeight": 790, "extras": ["momentjs"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Save / Restore Charts](/integrated-charts-api-save-restore-charts/).

