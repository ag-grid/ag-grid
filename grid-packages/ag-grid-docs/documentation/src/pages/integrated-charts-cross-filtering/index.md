---
title: "Cross Filtering"
enterprise: true
---

Cross-filtering charts allow users to interact with data in an easy and intuitive way. Clicking on chart elements
automatically filters values in both the grid and other cross-filter charts.

This built-in feature of integrated charts is particularly useful for creating interactive reports and dashboards.

<image-caption src="integrated-charts-cross-filtering/resources/cross-filtering.gif" alt="Cross Filtering" maxwidth="80%" centered="true" constrained="true"></image-caption>

## Interacting with cross-filter charts

The following user interactions control cross-filtering:

- **Single Click** - clicking on a chart element will filter on that value.  
- **Ctrl (Cmd) Click** - clicking on a chart element with the Ctrl (Cmd) key will add additional values to the cross-filter.
- **Background Click** - clicking on non chart elements (i.e. the chart background) will remove all active filters.  

## Creating cross-filter charts 

Cross-Filter charts can be created programmatically using `createCrossFilterChart()` on the grid's API. 

The following snippet shows how a cross-filtering pie chart can be created:

```js
gridApi.createCrossFilterChart({
    chartType: 'pie',
    cellRange: {
        columns: ['salesRep', 'sale'],
    },
    aggFunc: 'sum',
});
```

Note that the `sale` values are aggregated by the `salesRep` category as `aggFunc: 'sum'` is specified.  

## Cross-filter API 

The cross-filter api shares a similar api to [Range Chart](../integrated-charts-api/#range-charts), however there are 
different defaults which make sense in the context of cross-filtering.  

```ts
function createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined;
```

<api-documentation source='resources/cross-filter-api.json' section='params' config='{ "showSnippets": true }'></api-documentation>

## Example: Sales Dashboard #1

<grid-example title='Sales Dashboard' name='sales-dashboard' type='generated' options='{ "exampleHeight": 1000, "enterprise":  true }'></grid-example>

## Example: Sales Dashboard #2

<grid-example title='Sales Dashboard 2' name='sales-dashboard2' type='generated' options='{ "exampleHeight": 1000, "enterprise":  true }'></grid-example>

## Example: Sales Dashboard #3

<grid-example title='Sales Dashboard 3' name='sales-dashboard3' type='generated' options='{ "exampleHeight": 1000, "enterprise":  true }'></grid-example>