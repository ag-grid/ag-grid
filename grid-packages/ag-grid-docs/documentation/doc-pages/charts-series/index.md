---
title: "Series"
---

This section coveres notable series properties available in all series types.

## Series Highlighting

Each chart series has a `highlightStyle` config with default values like this:

```js
highlightStyle: {
    fill: 'yellow',    // series item fill
    stroke: undefined, // series item stroke
    dimOpacity: 1      // whole series opacity when dimmed (other series is hovered)
}
```

The `dimOpacity` config applies to the whole series, when it's not the series being hovered.
The default value of `1` means no dimming is happening when a user hovers various series within a chart.

Where `fill` and `stroke` configs only apply to the individual items within a series.
A series item can be a bar, a column, or a pie sector, or a marker of any shape
for series with markers such as line, area, or scatter series.

Let's try to replace the default highlight style with our custom one:

```js
highlightStyle: {
    fill: 'cyan',
    stroke: 'blue',
    dimOpacity: 0.2
}
```

And let's take a look at what happens when we apply it to the column series in the example below.

Note the following:
- when a series item (column segment) is highlighted, the segments belonging to all
  other stack levels dim, and only segments from the stack level that the highligted
  segment belongs to remain unaffected
- when a legend item is hovered, each representing a stack level, the rest of the
  stack levels in the series dim, but this time with no item highlighted because none
  is being hovered

<chart-example title='Column Series with Custom Highlight Style' name='basic-column' type='generated'></chart-example>

<chart-example title='Pie Series with Custom Highlight Style' name='basic-pie' type='generated'></chart-example>

## Next Up

Continue to the next section to learn about the [chart themes](/charts-themes/).
