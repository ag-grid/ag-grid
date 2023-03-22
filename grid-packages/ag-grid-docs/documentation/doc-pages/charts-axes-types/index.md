---
title: "Axis Types"
---

This section covers the different axis types.

A chart uses axes to plot data such as categories and values by converting them to screen coordinates. Since any point on the screen is an `(x, y)` pair of coordinates, a chart needs two orthogonal axes to plot the data &mdash; a horizontal axis to determine the `x` position of a point and a vertical axis to determine the `y` position. Axes also show ticks, labels and grid lines to help the user navigate a chart.

The charting library supports four axis types:

- [Category](#category-axis)
- [Number](#number-axis)
- [Log](#log-axis)
- [Time](#time-axis)

Each type is tailored to be used with certain types of data. An axis can be positioned to any side of a chart &mdash; `'top'`, `'right'`, `'bottom'`, or `'left'`. Just like with series, the axes can be specified by setting the corresponding `axes` array property of a chart.

[[note]]
| Axes are only supported in <a href="https://en.wikipedia.org/wiki/Cartesian_coordinate_system" target="blank">cartesian</a> charts, not <a href="https://en.wikipedia.org/wiki/Polar_coordinate_system" target="blank">polar</a>. For example, you can't use axes with pie series.

## Category Axis

The category axis is meant to be used with relatively small datasets of discrete values or categories, such as sales per product, person or quarter, where _product_, _person_ and _quarter_ are categories.

The category axis attempts to render a [tick](#axis-ticks), a [label](#axis-labels) and a [grid line](#axis-grid-lines) for each category, and spaces out all ticks evenly.

The category axis is used as the x-axis by default, positioned at the bottom of a chart.

The simplest category axis config looks like this:

```js
{
    type: 'category',
    position: 'bottom'
}
```

## Number Axis

The number axis is meant to be used as a value axis. While categories are spaced out evenly, the distance between values depends on their magnitude.

Instead of using one tick per value, the number axis will determine the range of all values, round it up and try to segment the rounded range with evenly spaced ticks.

The number axis is used as the y-axis by default, positioned to the left a chart.

Here's the simplest number axis config:

```js
{
    type: 'number',
    position: 'left'
}
```

## Log Axis

If the range of values is very wide, the `log` axis can be used instead of the `number` axis.
For example, because the `number` axis uses a linear scale, same changes in magnitude result in the
same pixel distance.

The `log` axis uses a log scale, where same _percentage_ changes in magnitude result in the same pixel distance.
In other words, the pixel distance between 10 and 100, and 100 and 1000 will be the same because both ranges
represent the same percentage increase. Whereas, if the `number` axis was used, the second distance would be
10 times larger than the first.

The above property of the log axis can also be useful in financial charts. For example, if your rate of
return on an investment stays consistent over time, the investment value chart will look like a straight line.

By default, if the data domain has `5` or more orders of magnitude, the `log` axis attempts to render `5` ticks. Otherwise, `10` ticks (the logarithm base) is rendered per order of magnitude. For example a data domain of `[1, 100]` with `2` orders of magnitude, will show `1`, `2`, `3`, `4`,`5`, `6`, `7`, `8`, `9`, `10`, `20`, `30`, `40`, `50`, `60`, `70`, `80`, `90`, `100`.

Depending on the data domain and chart size, using a larger value for the `tick: { minSpacing: xxx }` config might be necessary to reduce the number of ticks.

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

All of the above points are demonstrated by the example below.

### Example: Number Axis vs Log Axis

<chart-example title='Number Axis vs Log Axis' name='number-vs-log' type='generated'></chart-example>

[[note]]
| The domain of a log axis should be strictly positive or strictly negative (because there's no power you can raise a number to that will yield zero). For that reason, any non-conforming domain will be clipped to conformity. For example, `[0, 10]` will be clipped to  `[1, 10]`. If the data domain crosses `0`, for example `[-10, 5]`, no data will be rendered. It is often desirable to set the `min` or `max` property of the axis manually. In this case it can be `max: -1`.
## Time Axis

The time axis is similar to the number axis in the sense that it is also used to plot continuous values. The time axis can even be used with numeric data (in addition to `Date` objects), but the numbers will be interpreted as Unix timestamps. The time axis differs from the number axis in tick segmentation and label formatting. For example, you could choose to place a tick every 5 minutes, every month, or every Friday.

The time axis also supports specifier strings to control the way time values are presented as labels. For example, the `%H:%M:%S` specifier string will instruct the axis to format a time value like `new Date('Tue Feb 04 202 15:08:03')` or `1580828883000` as `'15:08:03'`. Time axes are typically used as x-axes and placed at the bottom of a chart. The simplest time axis config looks like this:

```js
{
    type: 'time',
    position: 'bottom'
}
```

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).