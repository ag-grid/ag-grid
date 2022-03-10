---
title: "Combination Charts"
---

AG Charts supports a range of different combination charts as outlined below.

A combination chart combines two or more series types. Combo charts represent different datasets which share a common variable, for example, a common category axis, allowing for flexible data visualisation.

In many cases, combination charts are chosen to validate relationships between different variables, analyse trends and identify outliers as they combine the benefits of different chart types.


## Combination of series types

The cartesian series types including `column`, `bar`, `line`, `area` and `scatter` series can be combined. These include both grouped and stacked column and area series.

Combination charts are created the same way as charts with a single series type, by configuring the chart options.

The `type` property must be specified explicitly on each individual series object in the `series` options array as shown in the example snippet below.

```js
series: [
    {
      type: "column", // render columns for the "men" variable
      xKey: "year",
      yKey: "men",
      //...other series options
    },
    {
      type: "line", // render lines for the "adults" variable
      xKey: "year",
      yKey: "adults",
      //...other series options
    },
]
```
The above snippet demonstrates the config required for a combination chart consisting of a `column` and `line` series.
Note that just like `type`, `data` can also be configured on a per series basis, which is convenient if the series data is coming from different sources.

Two common combinations can be seen in the example below by clicking the buttons.

Note that:
- The series will be rendered and overlaid on each other based on the order they are specified in the `series` array.
- This example reorders the `series` config to ensure the `area` series are placed behind the `column` series, for better visibility of the columns.
- A [secondary axis](../axes/#multiple-axes-in-a-single-direction) in the Y direction has been added as values across the `portions` series and the rest of the series differ in magnitudes.
- You can inspect the different `series` configurations logged to the console when you switch chart series types.

<chart-example title='Combination Charts' name='combination' type='generated'></chart-example>

## Next Up

Continue to the next section to learn about [layout](../layout/).
