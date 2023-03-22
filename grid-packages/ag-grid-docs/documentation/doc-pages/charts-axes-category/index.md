---
title: "Category Axis"
---

This section covers the Category Axis.

The category axis is meant to be used with relatively small datasets of discrete values or categories, such as sales per product, person or quarter, where _product_, _person_ and _quarter_ are categories.

The category axis attempts to render a [tick](#axis-ticks), a [label](#axis-labels) and a [grid line](#axis-grid-lines) for each category, and spaces out all ticks evenly.

The category axis is used as the x-axis by default, positioned at the bottom of a chart.

The simplest category axis config looks like this:

```js
{
    type: 'category',
    position: 'bottom'
}
```

<interface-documentation interfaceName='AgCategoryAxisOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }' exclude='["position", "title", "line", "label", "gridStyle", "keys"]'></interface-documentation>

## Next Up

Continue to the next section to learn about the [Number Axis](/charts-axes-number/).