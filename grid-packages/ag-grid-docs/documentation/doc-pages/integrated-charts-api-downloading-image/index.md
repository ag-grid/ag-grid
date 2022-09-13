---
title: "Downloading Chart Image"
enterprise: true
---

This section shows how to download the chart image though via the Grid API.

It is possible to retrieve a base64 encoded image rendered from the chart using the `getChartImageDataURL(params)` API. This API returns a string containing the requested data URL which is ideal for saving to a database and downloading the chart image.

<api-documentation source='grid-api/api.json' section='charts' names='["getChartImageDataURL"]'></api-documentation>

It is also possible to download the chart image using custom dimensions.

<api-documentation source='grid-api/api.json' section='charts' names='["downloadChart"]'></api-documentation>

The example below demonstrates how you can retrieve images rendered from the chart in multiple formats.

- Click "Download chart PNG" to download a PNG format image.
- Click "Download chart JPEG" to download a JPEG format image.
- Click "Download 800x500 chart" to download a custom size image.
- Click "Open PNG" to open a PNG format image of the chart in a new window.
- Click "Open JPEG" to open a JPEG format image of the chart in a new window.

<grid-example title='Downloading Chart Image' name='downloading-chart-image' type='generated' options='{ "exampleHeight": 800, "enterprise": true, "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Chart Customisation](/integrated-charts-customisation/).


