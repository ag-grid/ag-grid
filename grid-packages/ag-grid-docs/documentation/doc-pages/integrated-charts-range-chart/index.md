---
title: "Range Chart"
enterprise: true
---

This section covers how charts can be created directly from a range of selected cells.

Range charts provide a quick and easy way for users to create charts from inside the grid.

## Creating Chart Ranges

When a chart is created from a selected range of cells in the grid, or via the charting API, the underlying cell range is replaced by a chart range.

To see how chart ranges are created from a cell range, using our [demo page](../../example) do the following:

- Select a [Cell Range](/range-selection/) of numeric values in the grid by dragging the mouse over a range of cells.

- Bring up the [Context Menu](/context-menu/) and select the desired chart type from the 'Chart Range' sub menu.

<gif src="charting-ranges.gif" alt="Charting Ranges"></gif>

As illustrated above, the resulting chart range can subsequently be modified by dragging on the chart range handle, located in the bottom right corner of the chart range.

## Category and Series Ranges

There are two types of charting ranges: a category range that is highlighted in green and a series range that is highlighted in blue.

A category range can only contain cells from a single column, whereas a series range can contain values from many columns.

Chart ranges can be adjusted from within the grid by dragging on the chart range handle located at the bottom right of the series range. Both the category and series ranges are connected so when the chart range is dragged in an up or down direction they will be updated together.

[[note]]
| The chart range handle will only appear when all series columns are contiguous. However, it is possible to move columns around in the grid to connect the series range.

## Defining categories and series

There are several ways for columns to be classified as chart categories or series. Columns can be explicitly configured or left for the grid to infer the type based on the data contained in the cells.

[[warning]]
| It is recommended that `ColDef.chartDataType` is specified rather than relying on the grid to infer the chart data type as `null` and `undefined` values can yield unexpected results. 

### ColDef.chartDataType

When defining column definitions the `ColDef.chartDataType` property can be used to define how the column should be considered within the context of charting.

<api-documentation source='column-properties/properties.json' section='charts' names='["chartDataType"]'></api-documentation>

Columns defined as `excluded` will not be included in charts or charting ranges.

The following column definitions show how the different `ColDef.chartDataType` values are applied:

<snippet>
| const gridOptions = {
|     columnDefs: [
|         // 'category' columns
|         { field: 'athlete', chartDataType: 'category' },
|         { field: 'age', chartDataType: 'category' },
|         { field: 'country' },
| 
|         // 'excluded' from charts
|         { field: 'date', chartDataType: 'excluded' },
| 
|         // 'series' columns
|         { field: 'gold', chartDataType: 'series' },
|         { field: 'silver' }
|     ]
| }
</snippet>

Note from the snippet above that the `age` column contains numbers but explicitly defined as a category, however as the
`country` column contains strings it can be inferred correctly as a category column without needing to specify the
`chartDataType`.

See the [Time Series](/integrated-charts-time-series/) section for details on the `'time'` chart data type.

### Inferred by the Grid

If none of the above `ColDef` properties are present then the grid will infer the charting column type based on the data contained in the cells of the first row. Columns containing `number` values will map to `'series'` charting columns, and columns containing anything else will map to `'category'`.

### Example: Defining categories and series

The example below demonstrates the different ways columns can be defined for charting:

- **Athlete**: defined as a 'category' as `chartType='category'`.
- **Age**: defined as a 'category' as `chartType='category'`.
- **Sport**: considered a 'category' as data is a `string`.
- **Year**: defined 'excluded' from charting as data is of type `chartType='excluded'`.
- **Gold**: defined as 'series' as `chartType='series'`.
- **Silver**: defined as 'series' as `chartType='series'`.
- **Bronze**: considered a 'series' as data is a `number`.

<grid-example title='Defining categories and series' name='defining-categories-and-series' type='generated' options='{ "exampleHeight": 710, "enterprise": true, "modules": ["clientside", "menu", "charts", "rowgrouping"] }'></grid-example>

Cell ranges from which categories and data are taken will be highlighted on the grid. The highlight colours can be customised using the `--ag-range-selection-chart-category-background-color` and `--ag-range-selection-chart-background-color` CSS variables. See `style.css` in the example above.

## Next Up

Continue to the next section to learn about the: [Pivot Chart](/integrated-charts-pivot-chart/).
