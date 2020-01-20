<?php
$pageTitle = "Charts: Events";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Chart Events</h1>

<p class="lead">
    There are several events which are raised at different points in the lifecycle of a chart.
</p>

<h2><code>ChartCreated</code></h2>

<p>
    This event is raised whenever a chart is first created.
</p>

<snippet language="ts">
interface ChartCreated {
    type: string; // 'chartCreated'
    chartId: string;
    chartModel: ChartModel;
    api: GridApi;
    columnApi: ColumnApi;
}
</snippet>

<h2><code>ChartRangeSelectionChanged</code></h2>

<p>
    This is raised any time that the data range used to render the chart from is changed, e.g. by using the range selection handle or
    by making changes in the Data tab of the configuration sidebar. This event contains a <code>cellRange</code> object that gives you
    information about the range, allowing you to recreate the chart.
</p>

<snippet language="ts">
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
    rowStartIndex?: number;
    rowStartPinned?: string;

    // end row
    rowEndIndex?: number;
    rowEndPinned?: string;

    // columns
    columns: (string | Column)[];
}
</snippet>

<h2><code>ChartOptionsChanged</code></h2>

<p>
    Formatting changes made by users through the Format Panel will raise the <code>ChartOptionsChanged</code> event:
</p>

<snippet language="ts">
interface ChartOptionsChanged {
    type: string; // 'chartOptionsChanged'
    chartId: string;
    chartType: ChartType;
    chartPalette: string;
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
</snippet>

<p>
    Here the <code>chartPalette</code> will be set to the name of the currently selected palette, which will be one of the following:
    <code>'borneo', 'material', 'pastel', 'bright', 'flat'</code>
</p>

<h2><code>ChartDestroyed</code></h2>

<p>This is raised when a chart is destroyed.</p>

<snippet language="ts">
interface ChartDestroyed {
    type: string; // 'chartDestroyed'
    chartId: string;
    api: GridApi;
    columnApi: ColumnApi;
}
</snippet>

<h2>Example: Chart Events</h2>

<p>The following example demonstrates when the described events occur by writing to the console whenever they are triggered.</p>

<?= example('Events', 'events', 'generated', array("enterprise" => true)) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about the: <a href="../javascript-grid-charts-integrated-container/">Chart Container</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>