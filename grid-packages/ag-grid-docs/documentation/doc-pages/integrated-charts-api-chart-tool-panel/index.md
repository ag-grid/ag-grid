---
title: "Chart Tool Panel API"
enterprise: true
---

This section shows how to open and close the Chart Tool Panel via the Grid API.

## Opening / Closing Chart Tool Panels via Grid API

The Chart Tool Panels can be opened and closed programmatically using the following grid APIs:

<api-documentation source='grid-api/api.json' section='charts' names='["openChartToolPanel", "closeChartToolPanel"]'></api-documentation>

The example below demonstrates how you can open and close Chart Tool Panels.

- Click **Open Chart Tool Panel** to open the default `Settings` tab via `openChartToolPanel()`
- Click **Open Chart Tool Panel Format tab** to open the `Format` tab via `openChartToolPanel()`
- Click **Close Chart Tool Panel** to close via `closeChartToolPanel()`

<grid-example title='Open/Close Chart Tool Panel' name='chart-tool-panel-api' type='generated' options='{ "exampleHeight": 800, "enterprise": true, "modules": ["clientside", "menu", "charts"], "myGridReference": 1 }'></grid-example>

## Next Up

Continue to the next section to learn about: [Chart Customisation](/integrated-charts-customisation/).


