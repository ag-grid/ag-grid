---
title: "Downloading Chart Image"
enterprise: true
---

This section shows how to download charts via the Chart Toolbar and Grid API.

## Downloading Charts via Chart Toolbar

Users can use the 'Download Chart' [Chart Toolbar](/integrated-charts-toolbar/) item to download the rendered
chart in the browser.

<div style="display: flex; margin-bottom: 25px; margin-top: 25px; margin-left: 40px;">
    <div style="flex: 1 1 0">
        <img src="resources/chart-toolbar-download.png" alt="Chart Toolbar Download button"/>
    </div>
</div>

Note that the downloaded chart image will be in a `PNG` format.

## Downloading Charts via Grid API

There are 2 ways to download the chart image using the Grid API as shown below:

<api-documentation source='grid-api/api.json' section='charts' names='["getChartImageDataURL", "downloadChart"]'></api-documentation>

The `getChartImageDataURL(params)` API returns a string (base64 encoded) containing the requested data URL which is
ideal for saving to a database and downloading the chart image.

Alternatively you can use the `downloadChart(params)` API which will download the chart image directly in the browser.

The example below demonstrates how you can retrieve images rendered from the chart in multiple formats.

- Click **Download Chart Image (PNG)** to download a PNG format image via `getChartImageDataURL()`
- Click **Download Chart Image (JPG 800x500)** to download a custom size image via `downloadChart()`
- Click **Open Chart Image (JPG)** to open a JPEG format image in a new window via `getChartImageDataURL()`

<grid-example title='Downloading Chart Image' name='downloading-chart-image' type='generated' options='{ "exampleHeight": 800, "enterprise": true, "modules": ["clientside", "menu", "charts"], "myGridReference": 1 }'></grid-example>

## Next Up

Continue to the next section to learn about: [Chart Tool Panel API](/integrated-charts-api-chart-tool-panel/).


