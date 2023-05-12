---
title: "Axis Domain"
---

The axis domain is the extent of displayed values along the axis.

For a continuous axis, such as the [Number](../axes-types/#number) or [Time](../axes-types/#time) axis, the domain is calculated automatically from the minimum and maximum values of the data.

For the [Category](../axes-types/#category) axis, the domain consists of the discrete values in the data.

## Nice Domain

By default, a continuous axis is extended to have start and stop values that are visually pleasing, intuitive, and aligned with the tick interval. This makes the axis more user-friendly, and the plotted data is easier to analyse and understand.

To prevent this and use the exact data domain as the axis domain, set the `axis.nice` property to `false`:

```js
axes: [
  {
    type: "number",
    position: "left",
    nice: false, // Use the exact data domain as the axis domain
  },
]
```

The `axis.nice` configuration is demonstrated in the example below. Use the button to toggle the `nice` property. Note that:

- When `nice` is set to `false`, the axis ranges from the minimum data value of `1.87` to the maximum data value of `88.07`.
- When `nice` is set to `true`, the axis domain is extended to nice round numbers, starting from `0` and stopping at `100`.

<chart-example title='Number Axis Nice' name='axis-nice' type='generated'></chart-example>

## Domain Min & Max

The domain of a continuous axis can be configured explicitly by using the `axis.min` and `axis.max` properties.

```js
axes: [
  {
    type: "number",
    position: "left",
    min: -50,
    max: 150,
  },
]
```

The example below shows how to use the `axis.min` and `axis.max` configurations.

Use the buttons to set a specific domain minimum and maximum, or use the reset button to apply the automatically calculated domain.

<chart-example title='Number Axis Min & Max' name='axis-min-max' type='generated'></chart-example>

<note>
|When [Tick Values](../axes-ticks/#tick-values) are configured, the axis domain will be determined based on the values provided. In this case, `axis.nice`, `axis.min`, and `axis.max` will be ignored, and the domain will be extended as needed to accommodate the tick values.
|
| If the axis options have been configured with the [Tick Interval](../axes-ticks/#tick-interval) or [Tick Min / Max Spacing](../axes-ticks/#tick-min--max-spacing) properties, they take priority over the `axis.min` and `axis.max` properties.
| To enforce the axis domain minimum and maximum configurations while also respecting the [Tick Placement](../axes-ticks/#tick-placement) configurations, set the `axis.nice` property to `false`.
</note>

## Next Up

Continue to the next section to learn about [Axis Labels](/charts-axes-labels/).
