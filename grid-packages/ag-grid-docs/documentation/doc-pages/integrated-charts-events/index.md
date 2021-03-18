---
title: "Chart Events"
---

There are several events which are raised at different points in the lifecycle of a chart.

## ChartCreated

This event is raised whenever a chart is first created.

```ts
interface ChartCreated {
    type: string; // 'chartCreated'
    chartId: string;
    chartModel: ChartModel;
    api: GridApi;
    columnApi: ColumnApi;
}
```

## `ChartRangeSelectionChanged`

This is raised any time that the data range used to render the chart from is changed, e.g. by using the range selection handle or by making changes in the Data tab of the configuration sidebar. This event contains a `cellRange` object that gives you information about the range, allowing you to recreate the chart.

```ts
interface ChartRangeSelectionChanged {
    type: string; // 'chartRangeSelectionChanged'
    id: string;
    chartId: string;
    cellRange: CellRangeParams;
    api: GridApi;
    columnApi: ColumnApi;
}

interface CellRangeParams {
    // start row
    rowStartIndex: number | null;
    rowStartPinned?: string;

    // end row
    rowEndIndex: number | null;
    rowEndPinned?: string;

    // columns
    columns: (string | Column)[];
}
```

## ChartOptionsChanged

Formatting changes made by users through the Format Panel will raise the `ChartOptionsChanged` event:

```ts
interface ChartOptionsChanged {
    type: string; // 'chartOptionsChanged'
    chartId: string;
    chartType: ChartType;
    chartThemeName: string;
    chartOptions: ChartOptions;
    api: GridApi;
    columnApi: ColumnApi;
}

type ChartType =
    'groupedColumn' |
    'stackedColumn' |
    'normalizedColumn' |
    'groupedBar' |
    'stackedBar' |
    'normalizedBar' |
    'line' |
    'scatter' |
    'bubble' |
    'pie' |
    'doughnut' |
    'area' |
    'stackedArea' |
    'normalizedArea';
```

Here the `chartThemeName` will be set to the name of the currently selected theme, which will be either
one of the [Provided Themes](/integrated-charts-customisation/#provided-themes) or
a [Custom Theme](/integrated-charts-customisation/#custom-chart-themes) if used.

## ChartDestroyed

This is raised when a chart is destroyed.

```ts
interface ChartDestroyed {
    type: string; // 'chartDestroyed'
    chartId: string;
    api: GridApi;
    columnApi: ColumnApi;
}
```

## Example: Chart Events

The following example demonstrates when the described events occur by writing to the console whenever they are triggered. Try the following:

- Create a chart from selection, for example, select a few cells in the "Month" and "Sunshine" columns and right-click to "Chart Range" as a "Line" chart. Notice that a "Created chart with ID id-xxxxxxxxxxxxx" message has been logged to the console.

- Shrink or expand the selection by a few cells to see the "Changed range selection of chart with ID id-xxxxxxxxxxxx" logged.

- Click the hamburger icon inside the chart dialog to show chart settings and switch to a column chart. Notice that a "Changed options of chart with ID id-xxxxxxxxxxxxx" message has been logged to the console.

- Close the chart dialog to see the "Destroyed chart with ID id-xxxxxxxxxxx" message logged.

<grid-example title='Events' name='events' type='generated' options='{ "enterprise": true }'></grid-example>

## Accessing Chart Instance

Charts in the grid are produced by the [AG Charts](/charts-overview/) library, which is integrated
directly into the grid for your convenience. In some advanced use cases, you may wish to access the chart
instance that is produced by AG Charts, in order to interact with the chart directly.

The chart instance can be found inside the `ChartModel`, which is provided in the [`ChartCreated`](#chartcreated) event.

The example below shows how the chart instance can be used, creating a subtitle and updating
it dynamically as you change the range selection.

<grid-example title='Accessing Chart Instance' name='accessing-chart-instance' type='generated' options='{ "enterprise": true }'></grid-example>

## Other Resources

To learn about series events refer to the standalone charting library [documentation](/integrated-charts-events/).

## Next Up

Continue to the next section to learn about: [Third-Party Charting](/third-party-charting/).
