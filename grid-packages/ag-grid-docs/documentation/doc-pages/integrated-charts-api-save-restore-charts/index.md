---
title: "Save / Restore Charts"
enterprise: true
---

This section shows how the Grid API can be used to save and restore charts.

## Saving / Restoring Charts

The example below demonstrates how you can save and then later restore a chart. You can make changes to the chart type, theme, data and formatting options and note how the restored chart looks the same as the chart that was saved.

- Create a range chart from the grid, which will be shown in a container below the grid.
- Change the chart type, theme, data and/or formatting in order to see the changes restored later.
- Click "Save chart" to persist a model of the visible chart into a local variable. An alert will be shown to confirm that this has happened.
- Click "Clear chart" to destroy the existing chart.
- Click "Restore chart" to restore the previously saved chart.

<grid-example title='Saving and Restoring Charts' name='saving-and-restoring-charts' type='generated' options='{ "exampleHeight": 800, "enterprise": true, "modules": ["clientside", "menu", "charts"] }'></grid-example>

## API Reference

A chart model that represent all the state information about the rendered charts can be obtained using `getChartModels()`. These models are returned in a format that can be easily used with the other API methods to later restore the chart.

<api-documentation source='grid-api/api.json' section='charts' names='["getChartModels"]'></api-documentation>
<interface-documentation interfaceName="ChartModel"></interface-documentation>

These models can then be supplied to the following grid api method to restore the charts:

<api-documentation source='grid-api/api.json' section='charts' names='["restoreChart"]'></api-documentation>

Note that an optional `chartContainer` can be specified when restoring a chart.


## Next Up

Continue to the next section to learn about: [Downloading Chart Image](/integrated-charts-api-downloading-image/).


