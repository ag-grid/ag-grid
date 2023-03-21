---
title: "Overlays"
---

There are some options to display custom HTML over a chart.

## Missing Data Overlay

Sometimes end-users can be confused if a chart doesn't have any content. To help them understand that no data has been supplied, a message is displayed over the chart area.

This message can be customised through `overlays.noData`:

```js
overlays: {
    noData: {
        text: 'Some custom message',
    },
},
```

### Example: Overlay for missing data

<chart-example title='Overlay for Missing Data' name='no-data-plain' type='generated'></chart-example>

## Custom Missing Data Overlay

If finer grained control is required, a renderer can be provided to allow full customisation:

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
