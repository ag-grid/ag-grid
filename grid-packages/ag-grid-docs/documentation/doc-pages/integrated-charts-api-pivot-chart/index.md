---
title: "Pivot Chart API"
enterprise: true
---

This section shows how Pivot Charts can be created via the Grid API.

## Creating Pivot Charts

Pivot Charts can be created through `gridApi.createPivotChart()` as shown below:

<snippet>
gridOptions.api.createPivotChart({
    chartType: 'groupedColumn',
    // other options...
});
</snippet>

The snippet above creates a Pivot Chart with the `groupedColumn` chart type. For a full list of options see [Pivot Chart API](/integrated-charts-api-pivot-chart/#pivot-chart-api).

The following example demonstrates how Pivot Charts can be created programmatically via `gridApi.createPivotChart()`:  

<grid-example title='Pivot Chart' name='pivot-chart-api' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "rowgrouping", "charts"], "exampleHeight": 900, "myGridReference": 1 }'></grid-example>

## Pivot Chart API

Pivot Charts can be created programmatically using:

<api-documentation source='grid-api/api.json' section='charts' names='["createPivotChart"]'></api-documentation>

<interface-documentation interfaceName='CreatePivotChartParams' overrideSrc='integrated-charts-api-pivot-chart/resources/chart-api.json' ></interface-documentation>

The API returns a `ChartRef` object when a `chartContainer` is provided. This is the same structure
that is provided to the `createChartContainer(chartRef)` callback. The `ChartRef` provides the application
with the `destroyChart()` method that is required when the application wants to dispose the chart.

## Next Up

Continue to the next section to learn about: [Cross Filter API](/integrated-charts-api-cross-filter-chart/).


