---
title: "Histogram Series"
---

Histograms show the frequency distribution of continuous data. They are a good choice for when the data is larger than could be plotted on a bar chart and can be used to find underlying trends in continuous data.

## Simple Histogram

Histograms require at least one numeric attribute in the data to be specified using the `xKey` property. Data will be distributed into bins according to the `xKey` values.

The simplest configuration for a Histogram Series is shown below:

```js
series: [{
    type: 'histogram'
    xKey: 'age'
}]
```

<chart-example title='Simple Histogram' name='simple' type='generated'></chart-example>

## Bin Count

By default the histogram will split the x domain of the data into around ten regular-width bins, although the exact number generated will vary so that the chart can find round values for the bin boundaries. This is similar to how giving a number of ticks to an axis does not guarantee that exact number of ticks. The number of bins to aim for can be overridden by setting the `binCount` property on a histogram series.

Given enough data, charts with more bins are able to more precisely illustrate underlying trends, but are also more sensitive to random noise.

```js
series: [{
    type: 'histogram'
    xKey: 'age',
    binCount: 20
}]
```

<chart-example title='Larger Bin Count' name='larger-bin-count' type='generated'></chart-example>

## Irregular Intervals

Rather than specify the number of bins, for cases where you know exactly which bins you wish to split your x-axis values into, it is possible to explicitly give the start and end values for each bin. This is given using the `bins` property, and the value should be an array of arrays where each inner array contains the start and end value of a bin. In the example below, the data from the race is split into irregular age categories.

For histogram charts with irregular bins it is usual for the area of the bar, rather than its height, to visually represent the value of each bin. In this way the shape of the underlying curve is maintained over irregular intervals. The `areaPlot` property should be set to `true` to enable this mode.

```js
series: [{
    type: 'histogram'
    xKey: 'age',
    areaPlot: true,
    bins: [[16, 18], [18, 21], [21, 25], [25, 40]]
}]
```

[[warning]]
| Note that if you give the `bins` property you should not also give `binCount`, but if both are present `bins` takes precedence.

<chart-example title='Irregular Intervals' name='irregular-intervals' type='generated'></chart-example>

## XY Histogram

The histograms shown above all contain a single `xKey` with its frequency plotted on the y axis. However it is sometimes useful to visualise an `xKey` and `yKey` using a Histogram.

When using XY Histograms it is also useful to control how bins are aggregated using the `aggregation` series property. The following sections compare the `sum` and `mean` aggregation functions.

### Summing Bins

This is used to show the summing of one column or attribute for each of the bins. When a `yKey` is given, the default behaviour is to plot a total of the `yKey` values. The kind of aggregation to use is controlled by the `series.aggregation` property.

```js
series: [{
    type: 'histogram'
    xKey: 'age',
    yKey: 'winnings',
    aggregation: 'sum'
}]
```

<chart-example title='XY Histogram with Sum Aggregation' name='sum-histogram' type='generated'></chart-example>

### Mean Bins

Showing frequencies or summing up the y-values isn't always the best way to show your data. For data that is not evenly distributed in x, but is relatively uniform in y, a sum plot xy histogram will tend to be dominated by the populations of the x-bins. In the above example you may notice that the prize money distribution very closely follows the age distribution, so that while  potentially useful, the chart does not reveal any new trends in the data. In many cases, plotting the mean of a bin on the y-axis better illustrates an underlying trend in the data:

```js
series: [{
    type: 'histogram'
    xKey: 'age',
    yKey: 'time',
    yName: 'Average Time',
    aggregation: 'total'
}]
```

<chart-example title='XY Histogram with Mean Aggregation' name='mean-histogram' type='generated'></chart-example>

## API Reference

<interface-documentation interfaceName='AgHistogramSeriesOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false }'></interface-documentation>

## Next Up

Continue to the next section to learn about [area series](/charts-area-series/).