---
title: "Cross Filter Chart API"
enterprise: true
---

Cross-filtering charts allow users to interact with data in an easy and intuitive way. Clicking on chart elements
automatically filters values in both the grid and other cross-filter charts.

<gif src="cross-filtering.gif" alt="Cross Filtering"></gif>

This built-in feature of integrated charts is particularly useful for creating interactive reports and dashboards.

## Creating cross-filter charts

Cross-Filter charts are created programmatically using `createCrossFilterChart(params)` on the grid's API.

<api-documentation source='grid-api/api.json' section='charts' names='["createCrossFilterChart"]'></api-documentation>

The following snippet shows how a cross-filtering pie chart can be created:

<snippet>
| gridOptions.api.createCrossFilterChart({
|     chartType: 'pie',
|     cellRange: {
|         columns: ['salesRep', 'sale'],
|     },
|     aggFunc: 'sum',
| });
</snippet>

Note in the snippet above that the `sale` values are aggregated by the `salesRep` category as `aggFunc: 'sum'` is specified.

A corresponding column configuration for the chart above is shown in the following snippet:

<snippet>
| const gridOptions = {
|     columnDefs: [
|         { field: 'salesRep', filter: 'agSetColumnFilter', chartDataType: 'category' },
|         { field: 'sale', chartDataType: 'series' },
|     ],
| }
</snippet>

[[note]]
| Cross-filtering requires that grid filtering is enabled with either a [Set Filter](/filter-set/) or [Multi Filter](/filter-multi/) configured on the category column used in the chart. It is also important to define the [Chart Data Type](/integrated-charts-range-chart/#coldefchartdatatype) as it's not possible to infer the type when all data is filtered out..

The following example shows how to create a simple cross-filtering pie chart. Note the following:

- **Click** on a sector of the pie chart to filter rows in the grid by the selected sales rep.
- **Ctrl (Cmd) Click** on another sector to additionally adds rows corresponding to the selected sales rep.
- **Click Chart Background** to remove / reset the filtering in the grid to restore all rows in the grid.

<grid-example title='Simple Cross-Filter' name='simple-cross-filter' type='generated' options='{ "exampleHeight": 680, "enterprise":  true,  "modules": ["clientside", "menu", "charts", "setfilter", "multifilter", "filterpanel", "columnpanel"] }'></grid-example>

## Cross-filter API

The cross-filter api shares a similar api to [Range Chart](/integrated-charts-api-range-chart/), however there are
different defaults which make sense for cross-filtering.

<api-documentation source='grid-api/api.json' section='charts' names='["createCrossFilterChart"]'></api-documentation>

<interface-documentation interfaceName='CreateCrossFilterChartParams' overrideSrc='integrated-charts-api-cross-filter-chart/resources/cross-filter-api.json' ></interface-documentation>

## Cross-filter Chart Types

The following examples show the different chart types that support cross-filtering:

### Example: Sales Dashboard #1

<grid-example title='Sales Dashboard' name='sales-dashboard' type='generated' options='{ "exampleHeight": 1000, "enterprise":  true,  "modules": ["clientside", "menu", "charts", "setfilter", "multifilter", "filterpanel", "columnpanel"] }'></grid-example>

### Example: Sales Dashboard #2

<grid-example title='Sales Dashboard 2' name='sales-dashboard2' type='generated' options='{ "exampleHeight": 1000, "enterprise":  true,  "modules": ["clientside", "menu", "charts", "setfilter", "multifilter", "filterpanel", "columnpanel"] }'></grid-example>

### Example: Most Populous Cities

<grid-example title='Most Populous Cities' name='most-populous-cities' type='generated' options='{ "exampleHeight": 1000, "enterprise":  true,  "modules": ["clientside", "menu", "charts", "setfilter", "multifilter", "filterpanel", "columnpanel"] }'></grid-example>

## Next Up

Continue to the next section to learn about: [Time Series Chart](/integrated-charts-time-series/).