---
title: "Scatter Series"
---

Scatter charts use two axes to plot `(x,y)` pairs of numeric variables as points at the intersection of `x` and `y`.

[[note]]
| Scatter series configuration is largely the same as line series configuration (please refer to the [line series documentation](/charts-line-series/) to learn more), so here we'll just give some examples and cover only the differences.

## Scatter Plot

Scatter plots are great for identifying the relationship between plotted values, as well as outliers and gaps in the data.

To create a simple scatter chart we need to use series type `'scatter'`. We also have to provide the `xKey` and `yKey` properties. A minimal `'scatter'` series config would therefore look like this:

```js
series: [{
    type: 'scatter',
    xKey: 'time',
    yKey: 'mm',
}]
```

Using this simple series config, we can produce the following chart which plots the mean sea level measured over a few years. The measurements may have a certain degree of variability and error to them, but the overall trend is clear &mdash; the sea level is rising.

<chart-example title='Scatter Chart' name='scatter-chart' type='generated'></chart-example>

## Bubble Chart

A bubble chart is simply a scatter plot where each point has another associated variable that determines the size of a bubble. Instead of having pairs of variables, we now have triples.

To turn a scatter plot into a bubble chart you must provide the `sizeKey` that will be used to fetch the value that will determine the size of each bubble. For the example below we are using the following key configs:

```js
xKey: 'height',
yKey: 'weight',
sizeKey: 'age'
```

Another config we should provide is the `size` of the marker. When the `sizeKey` is specified, the value of `marker.size` config takes on a different meaning &mdash; instead of determining the actual marker size, the `size` config now determines the minimum marker size. The marker also has the `maxSize` config, which only applies when the `sizeKey` is set.

```js
marker: {
    size: 8,       // defaults to 8
    maxSize: 30    // defaults to 30
}
```

So for example, if the `sizeKey` data ranges from `-100` to `200`, the above config means that `-100` will correspond to marker of size `8` (the `size`), `200` to a marker of size `30` (the `maxSize`), and any value between `-100` and `200` will be interpolated to a value between `8` and `30`.

Finally, the bubble chart is so called because the circle is the most common marker `shape` used for this kind of scatter plot, but with AG Charts any other marker `shape` can be used as well.

The example below uses both `'circle'` and `'square'` markers to represent the age of females and males respectively.
- We provide the names of all keys (`xName`, `yName` and `sizeName`) to get nice looking tooltips.
- The series `title` is also provided which is reflected in the legend and displayed as the title in the tooltips.

<chart-example title='Bubble Chart' name='bubble-chart' type='generated'></chart-example>

## Bubble Chart with Labels

Scatter series can be configured to use labels. Unlike other series types where a label is placed
for every data point, scatter series label placement is constrained so that:

- labels don't overlap any markers
- labels don't overlap other labels

If these constraints are not satisfied, a label is not placed.

[[note]]
| Satisfying these constraints is computationally intensive and the complexity rises exponentially with increasing number of data points. Given that label placement might have to happen in real time, for example, when resizing a chart window, it is advised not to enable scatter series labels for data sets with more than a few hundred points.

To enable scatter series labels we have to set the `label.enabled` config of a series to `true` and specify which key should be used to fetch the label values.

```js
labelKey: 'name',
label: {
    enabled: true
}
```

The example below has the above config applied to both series. The label placement algorithm is aware
of all the scatter series in a chart, so labels don't overlap markers and other labels within a single
series nor between different series.

Try opening this example in a larger window to see that more labels are placed as the chart gets bigger.
You can also try changing the size of the markers and the font size of the labels to see how that affects
label placement.

<chart-example title='Bubble Chart with Labels' name='bubble-chart-labels' type='generated'></chart-example>

## API Reference

<interface-documentation interfaceName='AgScatterSeriesOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false }'></interface-documentation>

## Next Up

Continue to the next section to learn about [pie and doughnut series](/charts-pie-series/).
