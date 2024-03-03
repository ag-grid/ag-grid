---
title: "Chart Events"
enterprise: true
---

There are several events which are raised at different points in the lifecycle of a chart.

## ChartCreated

The `ChartCreated` event is raised whenever a chart is first created.

<interface-documentation interfaceName='ChartCreated' ></interface-documentation>

## ChartRangeSelectionChanged

This is raised any time that the data range used to render the chart from is changed, e.g. by using the range selection handle or by making changes in the Data tab of the configuration sidebar. This event contains a `cellRange` object that gives you information about the range, allowing you to recreate the chart.

<interface-documentation interfaceName='ChartRangeSelectionChanged' ></interface-documentation>

## ChartOptionsChanged

Formatting changes made by users through the Format Panel will raise the `ChartOptionsChanged` event:

<interface-documentation interfaceName='ChartOptionsChanged' ></interface-documentation>


Here the `chartThemeName` will be set to the name of the currently selected theme, which will be either
one of the [Provided Themes](/integrated-charts-customisation/#provided-themes) or
a [Custom Theme](/integrated-charts-customisation/#custom-chart-themes) if used.

## ChartDestroyed

This is raised when a chart is destroyed.

<interface-documentation interfaceName='ChartDestroyed' ></interface-documentation>

## Example: Chart Events

The following example demonstrates when the described events occur by writing to the console whenever they are triggered. Try the following:

- Create a chart from selection, for example, select a few cells in the "Month" and "Sunshine" columns and right-click to "Chart Range" as a "Line" chart. Notice that a "Created chart with ID id-xxxxxxxxxxxxx" message has been logged to the console.

- Shrink or expand the selection by a few cells to see the "Changed range selection of chart with ID id-xxxxxxxxxxxx" logged.

- Click the [Chart Tool Panels Button](/integrated-charts-chart-tool-panels) inside the chart dialog to show chart settings and switch to a column chart. Notice that a "Changed options of chart with ID id-xxxxxxxxxxxxx" message has been logged to the console.

- Close the chart dialog to see the "Destroyed chart with ID id-xxxxxxxxxxx" message logged.

<grid-example title='Events' name='events' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

## Event Driven Chart Updates 

The following example updates the chart when `ChartRangeSelectionChanged` events are raised. Note that charts can be 
updated using the following Grid API method:

<api-documentation source='grid-api/api.json' section='charts' names='["updateChart"]'></api-documentation>

Try changing the chart cell range in the grid and notice the subtitle is updated with chart range info.

<grid-example title='Event Driven Chart Updates' name='event-driven-chart-updates' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts-enterprise"], "exampleHeight": 710 }'></grid-example>

## Standalone Chart Events

It is possible to subscribe to the [AG Charts Events](https://charts.ag-grid.com/react/events/) using the theme based configuration 
via the `chartThemeOverrides` grid option:

<snippet>
| const gridOptions = { 
|   chartThemeOverrides: {
|     common: {
|       legend: {
|         listeners: {
|           legendItemClick: (e) => console.log('legendItemClick', e)
|         }
|       },
|       listeners: {
|         seriesNodeClick: (e) => console.log('seriesNodeClick', e)
|       }
|     }
|   }
| }
</snippet>

<note>
Note that the `chartThemeOverrides` grid option maps to [AG Charts Theme Overrides](https://charts.ag-grid.com/themes-api/#reference-AgChartTheme-overrides).
</note>

The example below demonstrates Standalone Charts Events subscription:

- Click on the bars in the series and observe that the `seriesNodeClick` listener emits a console message.
- Click on a legend item and observe that the `legendItemClick` listener emits a console message.

<grid-example title='Subscribing to Standalone Charts Events' name='standalone-events' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts-enterprise"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Time Series](/integrated-charts-time-series/).
