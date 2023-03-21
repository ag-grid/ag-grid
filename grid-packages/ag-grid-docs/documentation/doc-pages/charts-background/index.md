---
title: "Background"
---

This section describes how to change the background of a chart.

## Background Fill

`background.fill` property accepts a colour string value.

```js
background: {
    fill: 'rgb(63, 127, 255)',
},
```

<chart-example title='Background Fill' name='background-fill' type='generated'></chart-example>

## Background Image

The `url` is required for the background image.

It is positioned in the center by default. The `left`, `top`, `right` and `bottom` properties specify the distance between the chart borders and the image. The `width` and `height` properties override the size of the image.

```js
background: {
    image: {
        url: 'data:image/png;base64,iVBORw0...',
        width: 50,
        height: 50,
        right: 10,
        bottom: 10,
    },
},
```

<chart-example title='Background Image' name='background-image' type='generated'></chart-example>

### API Reference

<interface-documentation interfaceName='AgChartBackground' config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).
