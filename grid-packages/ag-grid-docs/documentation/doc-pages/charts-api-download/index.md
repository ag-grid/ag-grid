---
title: "Download"
---

Saving chart images by API call.

## Download API

We expose the API for triggering download via the `AgChart` class:

<api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChart" names='["download"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>

 This example demonstrates:
 - How to obtain a reference to an `AgChartInstance`.
 - How to use `AgChart.download()` to initiate a chart image download.

 <chart-example title='Download via AgChart API' name='download' type='generated'></chart-example>
 