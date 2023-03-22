---
title: "Log Axis"
---

This section covers the Log Axis.

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

<interface-documentation interfaceName='AgLogAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }' exclude='["position", "title", "line", "label", "gridStyle", "keys"]'></interface-documentation>

All of the above points are demonstrated by the example below.

### Example: Number Axis vs Log Axis

<chart-example title='Number Axis vs Log Axis' name='number-vs-log' type='generated'></chart-example>

[[note]]
| The domain of a log axis should be strictly positive or strictly negative (because there's no power you can raise a number to that will yield zero). For that reason, any non-conforming domain will be clipped to conformity. For example, `[0, 10]` will be clipped to  `[1, 10]`. If the data domain crosses `0`, for example `[-10, 5]`, no data will be rendered. It is often desirable to set the `min` or `max` property of the axis manually. In this case it can be `max: -1`.

## Next Up

Continue to the next section to learn about the [Time Axis](/charts-axes-time/).