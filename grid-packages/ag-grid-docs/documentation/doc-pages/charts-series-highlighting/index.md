---
title: "Series Highlighting"
---

In data-rich charts with multiple overlapping series it might be difficult to tell one series from another
when hovering a series data point or a legend item. To make the hovered series stand out, we
can highlight it, while dimming other chart series at the same time.

<chart-example title='Overlapping Series' name='lines' type='generated'></chart-example>

## Customising Series Highlighting

By default, only item highlighting is activated. Series highlighting, as shown in the sample above, can be activated by modifying the default `highlightStyle`.

Each chart series has a `highlightStyle` config with the following default values:

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

The highlighted series item can be a bar or column segment, a pie or doughnut sector,
or a marker in series with markers such as line, area, or scatter and bubble series.

In order to activate series highlighting, replace the default highlight style shown above with the custom one shown below:

```js
highlightStyle: {
    item: {
      fill: 'red',
      stroke: 'maroon',
      strokeWidth: 4
    },
    series: {
        dimOpacity: 0.2,
        strokeWidth: 2
    }
}
```

This custom highlightStyle is applied to the column series in the example below. Note the following:

- When a series item (column segment) is hovered, it gets highlighted using the style in the `highlightStyle.item` configuration.
  Also, the segments belonging to all other stack levels are dimmed, and only segments
  from the stack level that the highlighted segment belongs to remain unaffected.
- At the same time the segments from the highlighted stack level (subseries) get the `strokeWidth` of `2`,
  while the currently hovered segment gets a `strokeWidth` of `4`.
- When a legend item (representing a stack level) is hovered, the rest of the stack levels in the series are dimmed,
  but this time with no column segment item highlighted because none is hovered.

<chart-example title='Column Series with Custom Highlight Style' name='basic-column' type='generated'></chart-example>

## Series Highlighting with Multiple Series

Let's take a look at the pie chart configuration now, which is going to be slightly different. Note the following:

- We are using the same data set for the pie chart example as for the column chart example, but because the pie series are not stacked,
  we need 4 different pie series - one for each quarter - to render the whole data set.
- If the series are missing the `title` config, we will have legend items that are indistinguishable from those of other series,
  because each series legend items will be: `Coffee`, `Tea`, `Milk`. This is why in order to make legend items unique we use the name of the quarter
  in the series `title` config.
- Since we have multiple pie series, we have to modify the `highlightStyle` of every single series;
  in this example we are using the same `highlightStyle` for all 4 of them, but they could also be unique.

<chart-example title='Pie Series with Custom Highlight Style' name='basic-pie' type='generated'></chart-example>

## Series Highlighting via Chart Themes

The example above provides a separate `highlightStyle` for each pie series config.
The highlight style can be provided in a chart theme just once to be used by all pie series, as illustrated by the example below:

<chart-example title='Pie Series with Custom Highlight Style Theme' name='basic-pie-theme' type='generated'></chart-example>
