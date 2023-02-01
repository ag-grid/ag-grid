---
title: "Download"
---

Saving chart images by API call.

## Download API

We expose the API for triggering download via the `AgChart` class:

<api-documentation source='charts-api/doc-interfaces.AUTO.json' section="AgChart" names='["download"]' config='{ "showSnippets": false, "lookupRoot": "charts-api", "suppressTypes": ["AgChartInstance", "AgChartOptions", "DeepPartial"] }'></api-documentation>

[[only-react]]
| The `AgChartInstance` can be obtained using a React `Ref` to our `<AgChartsReact />` tag, which
| exposes a `chart` property.

[[only-angular]]
| The `AgChartInstance` can be obtained using an Angular `@ViewChild` decorator to reference our `AgChartsAngular` tag, which
| exposes a `chart` property.

[[only-vue]]
| The `AgChartInstance` can be obtained using the Vue `$refs` component property to reference our `AgChartsVue` tag, which
| exposes a `chart` property.

 This example demonstrates:
 - How to obtain a reference to an `AgChartInstance`.
 - How to use `AgChart.download()` to initiate a chart image download.

 <chart-example title='Download via AgChart API' name='download' type='generated'></chart-example>
 