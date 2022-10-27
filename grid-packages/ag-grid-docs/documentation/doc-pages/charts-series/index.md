---
title: "Series"
---

**Chart Series** represent a single or multiple data sets to be plotted on a chart.
Each chart type ([Line](/charts-line-series/), [Bar](/charts-bar-series/), [Pie](/charts-pie-series/) etc.) can have its own series' options, but there are a few common properties.

## Type

AG Charts supports many chart types, like [Line](/charts-line-series/), [Bar](/charts-bar-series/), [Pie](/charts-pie-series/) and many others.

```js
series: [{
    type: 'pie',
}]
```

Some series types can be [combined on the same chart](/charts-combination-series/).
Please see the [Options Reference](/charts-api/) for the most up to date list of available chart types.

## Data

By default the series is using the data from `chart.data` property.
But `series.data` property lets series to have its own data.

```js
series: [{
    data: [
        { name: 'Apples', count: 10 },
        { name: 'Oranges', count: 10 },
    ],
}]
```

The data should be an array of objects.
Properties like `xKey`, `yKey`, `angleKey` and others specify the data items' properties to be used as values for chart's dimensions.

See the list of other available properties in the [API reference](#reference-AgBaseSeriesOptions-title).
To learn more about constructing charts, please read the documentation for other chart types.

## API Reference

<interface-documentation interfaceName='AgBaseSeriesOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false }'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Line Series](/charts-line-series/).
