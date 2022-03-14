---
title: "Formatters"
---

This section explores customization of individual series items and markers based on data they represent.

When it comes to formatters, all series can be divided into two categories:
- _series with markers_, such as `line`, `scatter` and `area`, where each data point is represented by a marker that can be of any shape
- _series without markers_, such as `bar` and `pie`, where each data point is represented by a series item with a fixed shape, for example a rectangle or a pie sector

## Marker formatter example

If we take a stacked area series where we want the markers of the second sub-series to be larger than default size, we could use the following formatter function:

```js
function formatter({ yKey, size }) {
    return { size: yKey === 'electric' ? 12 : size };
}

series: [
    {
        type: 'area',
        xKey: 'quarter',
        yKey: 'petrol',
        stacked: true,
        marker: { formatter },
    },
    {
        type: 'area',
        xKey: 'quarter',
        yKey: 'electric',
        stacked: true,
        marker: { formatter },
    },
]
```

<chart-example title='Marker Formatter' name='marker-formatter' type='generated'></chart-example>

## Series item formatter example

If we have a list of values by country presented via bar series and want the bar for a particular country to stand out, we could use the following formatter function:

```js
type: 'column',
xKey: 'country',
yKey: 'gdp',
formatter: params => ({
    fill: params.datum[params.xKey] === 'UK' ? 'red' : params.fill
    // we can also use `params.datum.country`, but the formatter
    // would have to be updated whenever the `xKey` is changed
})
```

<chart-example title='Series Formatter' name='series-formatter' type='generated'></chart-example>

Please use the [API reference](/charts-api/) to learn more about the marker and series formatters, the inputs they receive and the attributes they allow to customize.

## Next Up

Continue to the next section to learn about [tooltips](/charts-tooltips/).
