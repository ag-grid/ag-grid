---
title: "Charts Tool Panel API"
enterprise: true
---

This section shows how to open and close the Charts Tool Panel via the Grid API.

## Opening and closing the Charts Tool Panel via Grid API

<api-documentation source='grid-api/api.json' section='charts' names='["openChartsToolPanel", "closeChartsToolPanel"]'></api-documentation>

The example below demonstrates how you can open and close the Charts Tool Panel.

- Click **Open Charts Tool Panel** to open the default `Settings` tab via `openChartsToolPanel()`
- Click **Open Charts Tool Panel Format tab** to open the `Format` tab via `openChartsToolPanel()`
- Click **Close Charts Tool Panel** to close via `closeChartsToolPanel()`

<grid-example title='Open/Close Chart Tool Panel' name='charts-tool-panel-api' type='generated' options='{ "exampleHeight": 800, "enterprise": true, "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Chart Customisation](/integrated-charts-customisation/).


