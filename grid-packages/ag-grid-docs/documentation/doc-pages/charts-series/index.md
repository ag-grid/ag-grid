---
title: "Series"
---

This section coveres notable series properties available in all series types.

## Series Highlighting

In data-rich charts with multiple overlapping series it might be difficul to tell one series from another
when hovering a series data point or a legend item. To make the hovered series stand out, we
can highlight it, while dimming other chart series at the same time, as illustrated by the example below.

<chart-example title='Overlapping Series' name='lines' type='generated'></chart-example>

To achieve such functionality each chart series has a `highlightStyle` config with default values like this:

```js
highlightStyle: {
    // Attributes that apply to individual items within a single series.
    // For example, a line series marker nearest to the mouse cursor,
    // or a bar segment under a cursor.
    item: {
        fill: 'yellow',
        stroke: undefined,
        strokeWidth: undefined,
    }
    // Attributes that apply to the whole series containing the highlighted item.
    series: {
        dimOpacity: 1, // series opacity when dimmed (while some other series is hovered)
        strokeWidth: undefined
    }
}
```

Where a series item can be a bar, a column, a pie sector, or a marker of any shape
for series with markers such as line, area, or scatter series.

Let's try to replace the default highlight style with our custom one:

```js
highlightStyle: {
    item: {
      fill: 'cyan',
      stroke: 'blue',
      strokeWidth: 4
    },
    series: {
        dimOpacity: 0.2,
        strokeWidth: 2
    }
}
```

And let's take a look at what happens when we apply it to the column series in the example below.

Note the following:
- when a series item (column segment) is highlighted, the segments belonging to all
  other stack levels dim, and only segments from the stack level that the highligted
  segment belongs to remain unaffected
- at the same time the segments from the highlighted stack level (subseries) get the `strokeWidth` of `2`,
  while the currently hovered segment gets a `strokeWidth` of `4`
- when a legend item (representing a stack level) is hovered, the rest of the
  stack levels in the series dim, but this time with no item highlighted because none
  is being hovered

<chart-example title='Column Series with Custom Highlight Style' name='basic-column' type='generated'></chart-example>

Let's take a look at the pie chart configuration now, which is going to be slightly
different. Notice the following:
- we are using the same data set for the pie chart example as for the column chart example, but because the pie series are not stacked, we need 4 different pie series - one for each quarter - to render the whole data set
- if the series are missing the `title` config, we are going to end up with legend items that are indistinguishable from those of other series, because each series legend items will be: `Coffee`, `Tea`, `Milk`, so we have to specify the name of the quarter in the series `title` to see make legend items unique
- since we have multiple pie series, we have to modify the `highlightStyle` of every single series; in this example we are using the same `highlightStyle` for all 4 of them, but they could also be unique

<chart-example title='Pie Series with Custom Highlight Style' name='basic-pie' type='generated'></chart-example>

An alternative to providing `highlightStyle` inside of each `pie` series config would be specifying the highlight style to be used by all pie series inside of a chart theme, as illustrated by the example below:

<chart-example title='Pie Series with Custom Highlight Style Theme' name='basic-pie-theme' type='generated'></chart-example>

## Next Up

Continue to the next section to learn about the [chart themes](/charts-themes/).
