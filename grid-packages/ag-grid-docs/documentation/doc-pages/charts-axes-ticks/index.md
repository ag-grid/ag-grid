---
title: "Axis Ticks"
---
Axis ticks are markers placed at regular intervals along each axis, and are also used to determine where and how often to show the axis labels and grid lines.

[[note]]
| Category axes show a tick for every category. Number and time axes will display around 5 ticks depending on the available space.

## Tick Placement

Tick placement can be customised by using one of the following strategies:

- [Tick Interval](#tick-interval) - used to place a tick at regular intervals
- [Tick Values](#tick-values) - used to place a tick at specified values
- [Min / Max Spacing](#tick-min--max-spacing) - used to control the pixel gap between ticks

### Tick Interval

The `tick.interval` defines the exact step value between ticks, expressed in the units of the respective axis.

For [Number Axes](/charts-axes-types/#number), the interval property should be a number. Ticks will be displayed at every interval
value within the axis range. For instance, with an interval of `5`, the ticks will appear at `0`, `5`, `10`, and so on.

```js
tick: {
    interval: 5,
}
```

The following example demonstrates how to specify the tick interval on a number axis:

<chart-example title='Number Axis Tick Interval' name='axis-tick-interval' type='generated'></chart-example>

For [Log Axes](/charts-axes-types/#log) the interval attribute should be assigned a numerical value. This number increments 
the exponent to which the base of the logarithm is elevated. For instance, an interval of `2` will display values like
`10^0`, `10^2`, `10^4`, and so on.

For [Time Axes](/charts-axes-types/#time) the interval property should represent a time interval, such as `time.month`, which 
displays a tick every month. You can also utilise an interval based on predefined time intervals, like `time.month.every(3)`, 
to customise the frequency of the ticks.

```js
tick: {
    interval: time.month,
}
```

Other available `time` intervals are: `year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`. There are also some UTC time intervals available: `utcYear`, `utcMonth`, `utcDay`, `utcYear`, `utcMinute`.

If the `interval` property of a time axis is set to a `number`, this will be interpreted as milliseconds.

[[note]]
| If the configured `interval` results in too many ticks given the data domain and chart size, it will be ignored and the default tick behaviour will be applied.

The example below demonstrates the usage of time intervals:
- `time.month` will produce monthly ticks.
- `time.month.every(2)` will generate ticks for every second month.

```js
tick: {
    interval: time.month.every(2)
}
```

<chart-example title='Time Axis Tick Interval' name='time-axis-label-format' type='generated'></chart-example>

### Tick Values

The `tick.values` property allows you to specify the precise array of tick values to display. Depending on the axis type, 
this should be an array consisting of numbers, dates, or string values.

```js
tick: {
    values: [50, 88, 100],
}
```

Note that these values might not be displayed when a `label.format` or `label.formatter` is also used.

The following example demonstrates how to specify exact tick values:

<chart-example title='Tick Values' name='axis-tick-values' type='generated'></chart-example>

### Tick Min / Max Spacing

The `tick.minSpacing` and `tick.maxSpacing` options alter the default behavior by defining the approximate minimum and
maximum pixel gaps that should exist between ticks. You can provide one or both options as needed. An appropriate number
of ticks will be generated to meet the specified `tick.minSpacing` and `tick.maxSpacing` constraints taking the rendered
size of the chart into account. A sample configuration is shown below:

```js
tick: {
    minSpacing: 50,
    maxSpacing: 200,
}
```

The following example demonstrates how to specify min / max tick spacing. Note the following:

- There is a button at the top of the chart to apply min / max spacing.
- There is a grab handle in the bottom right to allow resizing of the chart to see how the ticks change with available space.

<chart-example title='Min / Max Spacing' name='axis-tick-min-max-spacing' type='generated'></chart-example>

## Next Up

Continue to the next section to learn about [Axis Labels](/charts-axes-labels/).