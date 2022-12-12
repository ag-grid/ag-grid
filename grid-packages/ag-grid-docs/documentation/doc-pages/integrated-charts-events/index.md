---
title: "Chart Events"
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

- Click the hamburger icon inside the chart dialog to show chart settings and switch to a column chart. Notice that a "Changed options of chart with ID id-xxxxxxxxxxxxx" message has been logged to the console.

- Close the chart dialog to see the "Destroyed chart with ID id-xxxxxxxxxxx" message logged.

<grid-example title='Events' name='events' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Accessing Chart Instance

Charts in the grid are produced by the [Standalone Charts](/charts-overview/) library, which is integrated
directly into the grid for your convenience. In some advanced use cases, you may wish to access the chart
instance that is produced by Standalone Charts, in order to interact with the chart directly.

The chart instance can be obtained from the `chartRef` using the `getChartRef(chartId)` API.

<api-documentation source='grid-api/api.json' section='charts' names='["getChartRef"]'></api-documentation>

Here is the implementation:

```js
function onChartCreated(event) {
    const chartRef = gridOptions.api.getChartRef(event.chartId);
    const chart = chartRef.chart;
}
```
Note in the snippet above, the `chartId` is obtained from the [`ChartCreated`](#chartcreated) event which is supplied to the `onChartCreated` callback. The `chartId` is provided in all chart events.

## Updating Chart Instance

[[only-javascript]]
|The chart instance can be updated using the `AgChart.updateDelta()` method, as described in the [Standalone Charts - Options Reference](/charts-api/#updating-charts-using-partial-options).

[[only-frameworks]]
|The chart instance can be updated using the `AgChart.updateDelta()` method, as described in the [Standalone Charts - Options Reference](/charts-api/#updating-charts-using-partial-options-1).

The example below shows how the chart instance can be used, creating a subtitle and updating
it dynamically as you change the range selection.

<grid-example title='Accessing & Updating Chart Instance' name='accessing-chart-instance' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts"], "enableChartApi": true }'></grid-example>

## Other Resources

To learn about events see [Standalone Chart Events](/charts-events/).
