---
title: "Axis Types"
---
The horizontal (X) and vertical (Y) lines in cartesian charts are referred to as chart axes, and they serve to illustrate
the relationships between data points on the graph. This section discusses the different axis types.

## Category

A category axis is used to display distinct categories or groups of data in a chart.

The category axis shows discrete categories or groups of data, unlike the [Number](/charts-axes-types/#number) or
[Time](/charts-axes-types/#time) axes which use a continuous scale. For instance, in a bar chart of sales per product, the
category axis shows the products as different groups, and the number axis displays the corresponding sale value for each group.

If no `axes` are supplied, a category axis will be used as the x-axis by default. However, it can also
be explicitly configured as shown below:

```js
axes: [
    {
        type: 'category',
        position: 'bottom',
    },
]
```

The category axis will attempt to render an [Axis Tick](/charts-axes-ticks/), [Axis Label](/charts-axis-labels/) and
[Grid Line](/charts-axis-grid-lines/) for each category with even spacing.

For a full list of configuration options see [Category Axis Options](#category-axis-options).

## Number

A number axis is used to display continuous numerical values in a chart.

The number axis displays continuous numerical values, unlike the [Category](/charts-axes-types/#category) axis which displays
discrete categories or groups of data. This means that while categories are spaced out evenly, the distance between values
in a number axis will depend on their magnitude.

Instead of using one [Axis Tick](/charts-axes-ticks/) per value, the number axis will determine the range of all values,
round it up and try to segment the rounded range with evenly spaced ticks.

If no `axes` are supplied, a number axis will be used as the y-axis by default. However, it can also be explicitly
configured as shown below:

```js
axes: [
    {
        type: 'number',
        position: 'left',
    },
]
```

For a full list of configuration options see [Number Axis Options](#number-axis-options).

## Time

The time axis is similar to the number axis in the sense that it is also used to plot continuous values. The time axis
can even be used with numeric data (in addition to `Date` objects), but the numbers will be interpreted as Unix timestamps.
The time axis differs from the number axis in tick segmentation and label formatting. For example, you could choose to
place a tick every 5 minutes, every month, or every Friday.

The time axis also supports specifier strings to control the way time values are presented as labels. For example, 
the `%H:%M:%S` specifier string will instruct the axis to format a time value like `new Date('Mon Apr 17 2023 12:43:17')` 
or `1681735397` as `'12:43:17'`. Time axes are typically used as x-axes and placed at the bottom of a chart. The 
simplest time axis config looks like this:

```js
{
    type: 'time',
    position: 'bottom'
}
```

For a full list of configuration options see [Time Axis Options](#time-axis-options).

## Log

If the range of values is very wide, the `log` axis can be used instead of the `number` axis.
For example, because the `number` axis uses a linear scale, same changes in magnitude result in the
same pixel distance.

The `log` axis uses a log scale, where same _percentage_ changes in magnitude result in the same pixel distance.
In other words, the pixel distance between 10 and 100, and 100 and 1000 will be the same because both ranges
represent the same percentage increase. Whereas, if the `number` axis was used, the second distance would be
10 times larger than the first.

The above property of the log axis can also be useful in financial charts. For example, if your rate of
return on an investment stays consistent over time, the investment value chart will look like a straight line.

By default, if the data domain has `5` or more orders of magnitude, the `log` axis attempts to render `5` ticks. Otherwise,
`10` ticks (the logarithm base) is rendered per order of magnitude. For example a data domain of `[1, 100]` with `2` orders
of magnitude, will show `1`, `2`, `3`, `4`,`5`, `6`, `7`, `8`, `9`, `10`, `20`, `30`, `40`, `50`, `60`, `70`, `80`, `90`, `100`.

Depending on the data domain and chart size, using a larger value for the `tick: { minSpacing: xxx }` config might be
necessary to reduce the number of ticks.

```js
{
    type: 'log',
    position: 'left',
    tick: {
      minSpacing: 200,
    }
}
```

The `log` axis uses the common logarithm (base 10) by default. The `base` config allows
you to change the base to any number you like, for example `Math.E` for natural or `2` for binary logarithms:

```js
{
    type: 'log',
    position: 'left',
    base: 2
}
```

For a full list of configuration options see [Log Axis Options](#log-axis-options).

These configurations above are demonstrated in the following example:

<chart-example title='Log Axis' name='number-vs-log' type='generated'></chart-example>

[[note]]
| The domain of a log axis should be strictly positive or strictly negative (because there's no power you can raise a number to that will yield zero). For that reason, any non-conforming domain will be clipped to conformity. For example, `[0, 10]` will be clipped to  `[1, 10]`. If the data domain crosses `0`, for example `[-10, 5]`, no data will be rendered. It is often desirable to set the `min` or `max` property of the axis manually. In this case it can be `max: -1`.

## API Reference

### Category Axis Options
<interface-documentation interfaceName='AgCategoryAxisOptions' overridesrc="charts-api/api.json" exclude='["keys"]' config='{ "description": "", "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

### Number Axis Options
<interface-documentation interfaceName='AgNumberAxisOptions' overridesrc="charts-api/api.json" exclude='["keys"]' config='{ "description": "", "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

### Time Axis Options
<interface-documentation interfaceName='AgTimeAxisOptions' overridesrc="charts-api/api.json" exclude='["keys"]' config='{ "description": "", "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

### Log Axis Options
<interface-documentation interfaceName='AgLogAxisOptions' overridesrc="charts-api/api.json" exclude='["keys"]' config='{ "description": "", "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Axis Ticks](/charts-axes-ticks/).