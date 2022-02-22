---
title: "Range Chart API"
enterprise: true
---

This section shows how Range Charts can be created via the Grid API.

## Creating Range Charts

Range Charts can be created through `gridApi.createRangeChart()` as shown below:

<snippet>
gridOptions.api.createRangeChart({
    chartType: 'groupedColumn',
    cellRange: {
        rowStartIndex: 0,
        rowEndIndex: 4,
        columns: ['country', 'gold', 'silver'],
    },
    // other options...
});
</snippet>

The snippet above creates a Range Chart with the `groupedColumn` chart type using data from the first 4 and the `country`,
`gold`, `silver` columns. For a full list of options see [Range Chart API](/integrated-charts-api-range-chart/#range-chart-api).

The following example demonstrates how Range Charts can be created programmatically via `gridApi.createRangeChart()`. Note the following:

- Clicking **'Top 5 Medal Winners'** will chart the first five rows of Gold and Silver medals by Country.
- Clicking **'Bronze Medals by Country'** will chart Bronze by Country using all rows (the provided cell range does not specify rows).
- Note the **'Bronze Medals by Country'** chart is unlinked from the grid as `chartUnlinked=true`. Notice that sorting in the grid does not affect the chart and there is no chart range in the grid.

<grid-example title='Charts in Grid Popup Window' name='chart-api' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts"] }'></grid-example>

## Range Chart Dashboard

The following example passes a [Chart Container](/integrated-charts-container/) to the API to place the chart in a 
location other than the grid's popup window. Note the following:

- The charts are placed in `div` elements outside the grid.
- The two pie charts are showing aggregations rather than charting individual rows.
- Clicking on a chart highlights the range in the grid for which the chart is based.
- The bar chart is sensitive to changes in the rows. For example if you sort, the chart updates to always chart the first five rows.
- All data is editable in the grid. Changes to the grid data is reflected in the charts.
- The two pie charts have legends beneath. This is configured in the `chartThemeOverrides`.

<grid-example title='Charts in Dashboard' name='dashboard' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "charts", "rowgrouping"], "exampleHeight": 700 }'></grid-example>

## Range Chart API

Range Charts can be created programmatically using:

<api-documentation source='grid-api/api.json' section='charts' names='["createRangeChart"]'></api-documentation>

<interface-documentation interfaceName='CreateRangeChartParams' overrideSrc='integrated-charts-api-range-chart/resources/chart-api.json' ></interface-documentation>

The API returns a `ChartRef` object when a `chartContainer` is provided. This is the same structure
that is provided to the `createChartContainer(chartRef)` callback. The `ChartRef` provides the application
with the `destroyChart()` method that is required when the application wants to dispose the chart.

## Next Up

Continue to the next section to learn about the: [Pivot Chart API](/integrated-charts-api-pivot-chart/).
