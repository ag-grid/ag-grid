---
title: "Formatters"
---

Formatters allow individual item customisation based on the data they represent.

Please use the [API reference](/charts-api/) to learn more about the formatters, the inputs they receive and the attributes they allow to customize.

## Marker Formatter

Applies to _series with markers_, such as `line`, `scatter` and `area`, where each data point is represented by a marker that can be of any shape.

If we take a stacked area series where we want the markers of the second sub-series to be larger than default size, we could use the following formatter function:

```js
function formatter({ yKey, size }) {
  return { size: yKey === "electric" ? 12 : size }
}

series: [
  {
    type: "area",
    xKey: "quarter",
    yKey: "petrol",
    stacked: true,
    marker: { formatter },
  },
  {
    type: "area",
    xKey: "quarter",
    yKey: "electric",
    stacked: true,
    marker: { formatter },
  },
]
```

<chart-example title='Marker Formatter' name='marker-formatter' type='generated'></chart-example>

## Series Item Formatter

Applies to _series without markers_, such as `bar` and `pie`, where each data point is represented by a series item with a fixed shape, for example a rectangle or a pie sector

If we have a list of values by country presented via bar series and want the bar for a particular country to stand out, we could use the following formatter function:

```js
function formatter(params) {
  return {
    fill:
      params.datum[params.xKey] === "UK"
        ? params.highlighted
          ? "lime"
          : "red"
        : params.fill,
  }
}

series: [
  {
    type: "column",
    xKey: "country",
    yKey: "gdp",
    formatter,
  },
]
```

<chart-example title='Series Formatter' name='series-formatter' type='generated'></chart-example>

## Legend Item Label Formatter

Applies to all series types. This formatter allows adjustment of the text label used for the legend
item corresponding to a series

<chart-example title='Legend Item Label Formatter' name='legend-item-formatter' type='generated'></chart-example>

## Next Up

Continue to the next section to learn about [tooltips](/charts-tooltips/).
