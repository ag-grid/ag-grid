---
title: "Combination Charts"
---

A combination chart combines two or more series types allowing for flexible data visualisations. They are ideal for making visual comparisons of different sets of data in a single chart.

## Combination Series Types

It is possible to create Combination Charts using the following series types: `column`, `bar`, `line`, `area` and `scatter`.

Unlike charts with a single series type, the `type` property must be specified explicitly on each individual series object in the `series` options array, as shown below:

```js
series: [
    {
      type: "column", // use 'column' series
      xKey: "year",
      yKey: "men",
      // ...other series options
    },
    {
      type: "line", // use 'line' series
      xKey: "year",
      yKey: "portions",
      // ...other series options
    },
]
```

The snippet above shows the configuration required for a combination chart consisting of a `column` and `line` series.

The example below demonstrates two common combination chart types. You can switch between these two combination chart types using the buttons above the chart. Please note:

- Series are rendered according to the order in which they are added in the `series` array.
- The area and line series are plotted on a [Secondary Axis](../axes/#multiple-axes-in-a-single-direction) with a different scale.
- The `series` configurations are logged in the dev console when switching between combination charts.

<chart-example title='Combination Charts' name='combination' type='generated'></chart-example>