---
title: "Navigator"
---

The navigator allows to zoom in on a portion of chart's data and then pan around the chart. This is useful in charts with lots of data and real-time charts where one wants to show a slice of time, for example sensor data for the last 20 minutes.

## Showing the Navigator

The navigator is hidden by default, to enable it add the following config to the chart:

```js
navigator: {
    enabled: true
}
```

### Example: Showing the Navigator

<chart-example title='Showing the Navigator' name='navigator' type='generated'></chart-example>

## Setting the Visible Range

By default the navigator shows the whole range of chart's data in the horizontal direction. The two properties that control the range of data to show are `min` and `max`, which default to `0` and `1`, respectively.

The visible range is normalized to the `[0, 1]` interval. For example, to show the last quarter of the chart's data by default we can use the following config:

```js
navigator: {
    min: 0.75,
    max: 1
}
```

Regardless of the initial visible range, the user will be able to adjust the range as they see fit by dragging the range handles inside the navigator.

## Styling the Navigator

The navigator's `height` is configurable and affects chart's layout by leaving more or less vertical space for the series:

```js
navigator: {
    height: 50
}
```

The navigator component has three subcomponents that can be styled independently:

- `mask` - the range mask
- `minHandle` - the min drag handle
- `maxHandle` - the max drag handle

The range mask shows the portion of the range selected, and the drag handles are used to adjust it.

All subcomponent configs are optional too and have default values that make the navigator look good in charts with both light and dark backgrounds.

### Example: Navigator Styling

The example below uses various navigator configs (in a deliberately exaggerated way) to change the following visual attributes of the navigator:

- range mask's fill, fill opacity and stroke width
- fill and stroke colors of handles
- width, height and stroke width of the left handle
- the length of the left handle's grip lines and the distance between them

<chart-example title='Navigator Styling' name='navigator-styling' type='generated'></chart-example>

## API Reference

<interface-documentation interfaceName='AgNavigatorOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn more about [markers](/charts-markers/).
