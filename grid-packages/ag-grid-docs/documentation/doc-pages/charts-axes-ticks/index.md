---
title: "Axes"
---

This section axis ticks.

Axis ticks are displayed at intervals along each axis, and are also used to determine the position and frequency of the axis labels and grid lines.

## Tick Placement

Category axes show a tick for every category. Number and time axes will display around 5 ticks depending on the available space.

It is possible to customise or override this default behaviour by using one of the following options.

- [Min and Max Spacing](#tick-min-and-max-spacing) - used to control the pixel gap between ticks
- [Interval](#tick-interval) - used to place a tick at regular intervals
- [Values](#tick-values) - used to place a tick at specified values

## Tick Min and Max Spacing

`tick.minSpacing` and `tick.maxSpaxing` modify the default behaviour by specifying the approximate
minimum and maximum pixel gap which should be present between ticks. One or both options can be
provided. An appropriate number of ticks will be generated to satisfy the provided `tick.minSpacing`
and `tick.maxSpacing` constraints. This number will vary depending on the rendered size of the chart.

```js
tick: {
  minSpacing: 50,
  maxSpacing: 200,
}
```

## Tick Interval

`tick.interval` is the exact step value between ticks, specified in the units of the axis.

For `number` axes, the interval property should be a `number`. A tick will be shown every `interval` value in the axis
range. For example, an interval of `30` will show `0`, `30`, `60`, `90` etc.

```js
tick: {
  interval: 30,
}
```

For `log` axes, the `interval` property should be a `number`. This is used to step the exponent that the logarithm base
is raised to. For example an interval of `2` will show `10^0`, `10^2`, `10^4` etc.

For `time` axes the `interval` property should be a time interval such as `time.month`, to show a tick every month, or 
an interval derived from one of the predefined intervals, such as `time.month.every(3)`.

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
{
  type: 'time',
          tick: {
    interval: time.month.every(2)
  }
}
```

<chart-example title='Time Axis Label Format' name='time-axis-label-format' type='generated'></chart-example>

## Tick Values

`tick.values` can be used to configure the exact array of tick values to display. This should either be an array of `number`, `date` or `string` values depending on the axis type.

These values will also be used as the tick labels unless a `label.format` or `label.formatter` is configured.

```js
tick: {
  values: [-50, -25, 0, 25, 50],
}
```

## Example: Axis Tick Placement

The example below demonstrates how the `tick.minSpacing`, `tick.maxSpacing`, `tick.interval` and `tick.values` properties can be used to control the placement of the ticks.

- There are buttons at the top to change between the different options.
- There is a grab handle in the bottom right to allow resizing of the chart to see how the ticks change with available space.

<chart-example title='Axis Tick Placement' name='axis-tick-placement' type='generated'></chart-example>

## Tick Styling

The `width`, `size` and `color` of chart axis ticks can be configured as explained in the [API reference](#reference-AgNumberAxisOptions-tick) below. These configs apply to all axis types.

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).