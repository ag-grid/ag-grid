---
title: "Scatter Series"
---

Scatter charts use two axes to plot `(x,y)` pairs of numeric variables as points at the intersection of `x` and `y`.

[[note]]
| Scatter series configuration is largely the same as line series configuration (please refer to the [line series documentation](/charts-line-series/) to learn more),so here we'll just give some examples and cover only the differences.

## Scatter Plot

Scatter plots are great for identifying the relationship between plotted values, as well as outliers and gaps in the data.

Here's a simple scatter chart that plots the mean sea level measured over a few years. The measurements may have a certain degree of variability and error to them, but the overall trend is clear &mdash; the sea level is rising.

<chart-example title='Scatter Chart' name='scatter-chart' type='generated'></chart-example>

## Bubble Chart

A bubble chart is simply a scatter plot where each point has another associated variable that determines the size of a bubble. Instead of having pairs of variables, we now have triples.

To turn a scatter plot into a bubble chart you must provide the `sizeKey` that will be used to fetch the value that will determine the size of each bubble. For the example below we are using the following key configs:

```js
xKey: 'height',
yKey: 'weight',
sizeKey: 'age'
```

Another config we should provide is the `size` of the marker. When the `sizeKey` is specified, the value of `marker.size` config takes on a different meaning &mdash; instead of determining the actual marker size, the `size` config now determines the maximum marker size. The marker also has the `minSize` config, which only applies when the `sizeKey` is set.

```js
marker: {
    size: 6,       // defaults to 6
    maxSize: 30    // defaults to 30
}
```

So for example, if the `sizeKey` data ranges from `-100` to `200`, the above config means that `-100` will correspond to marker of size `8` (the `minSize`), `200` to a marker of size `30` (the `size`), and any value between `-100` and `200` will be interpolated to a value between `8` and `30`.

Finally, the bubble chart is so called because the circle is the most common marker type used for this kind of scatter plot, but with AG Charts any other marker shape can be used as well.

The example below uses both `'circle'` and `'square'` markers to represent the age of females and males respectively. We provide the names of all keys to get nice looking tooltips and the `title` of the series to have it reflected in the legend. The series title is shown in the tooltips as well.

<chart-example title='Bubble Chart' name='bubble-chart' type='generated'></chart-example>

## API Reference

<api-documentation source='charts-api/api.json' section='scatter' config='{ "showSnippets": true }'></api-documentation>

## Next Up

Continue to the next section to learn about [pie and doughnut series](/charts-pie-series/).
