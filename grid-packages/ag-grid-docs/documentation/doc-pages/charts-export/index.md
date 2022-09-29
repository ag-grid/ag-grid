---
title: "Exporting Chart Image"
---

Using the chart factory `download` method, `agCharts.AgChart.download()`, the rendered chart can be exported as an image in the desired format and size.

## Downloading Chart Image Example

The example below demonstrates how you can retrieve images rendered from the chart.

- Click **Download Chart Image (PNG)** to download a PNG (default) format image via `agCharts.AgChart.download()`, passing in the chart instance without any additional download options.
- Click **Download Chart Image (JPG)** to download a JPG format image via `agCharts.AgChart.download()`, passing in the chart instance and an options object with the `fileFormat` property.
- Click **Download Chart Image (PNG 800x500)** to download a custom size image via `agCharts.AgChart.download()`, passing in the chart instance and an options object with the desired `width` and `height`.

<chart-example title='Download Chart Image' name='download-chart-image' type='generated'></chart-example>