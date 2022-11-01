---
title: "Series"
---

Chart series represent data sets to be plotted on a chart. Each series type
([Line](/charts-line-series/), [Bar](/charts-bar-series/), [Pie](/charts-pie-series/) etc.) have
series-specific options, but there are some common options between them.

## Type

Every series configuration requires a `type` to declare how the data set should be rendered:

```js
series: [{
    type: 'pie',
}]
```

Cartesian series types can be [combined on the same chart](/charts-combination-series/).
See the [Options Reference](/charts-api/) for the complete list of available series types.

## Data

By default each series is based on data from the root-level `data` option. It is also possible for
each series to declare its own data:

```js
series: [{
    data: [
        { name: 'Apples', count: 10 },
        { name: 'Oranges', count: 10 },
    ],
}]
```

The data should be an array of objects. Common options like `xKey`, `yKey`, `angleKey` specify
the properties to use to read the data-set for the series.

See other available options in the [API reference](#api-reference).

## API Reference

<interface-documentation interfaceName='AgBaseSeriesOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false }'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Line Series](/charts-line-series/).
