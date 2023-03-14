---
title: "Overlays"
---

There are some options to display custom HTML over a chart.

## Missing Data Overlay

Sometimes end-users can be confused if a chart doesn't have any content. To help them understand the data is not supplied, a custom HTML message can be provided through `overlays.noData.renderer` function:

```js
overlays: {
    noData: {
        renderer: () => '<i class="no-data">The data is missing</i>'
    },
},
```

### Example: Custom overlay for missing data

<chart-example title='Custom Overlay for Missing Data' name='no-data' type='generated'></chart-example>

## API Reference

<interface-documentation interfaceName='AgChartOverlaysOptions' config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>
