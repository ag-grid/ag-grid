<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Chart API</h1>

    <p class="lead">
        This section covers how to use the chart range API in your applications.
    </p>

    <h2>Charting Range API</h2>

    <p>
        Charts can be created programmatically via the grid's <code>chartRange()</code> API. The interface is
        as follows:
    </p>

    <snippet>
function chartRange(params: ChartRangeParams): ChartRef | undefined {
    cellRange: CellRangeParams;
    chartType: string;
    chartContainer?: HTMLElement;
    suppressChartRanges?: boolean;
    aggregate?: boolean;
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions;
}

interface CellRangeParams {
    // start row
    rowStartIndex?: number;
    rowStartPinned?: string;

    // end row
    rowEndIndex?: number;
    rowEndPinned?: string;

    // columns
    columnStart?: string | Column;
    columnEnd?: string | Column;
    columns?: (string | Column)[];
}

export interface ProcessChartOptionsParams {
    type: string;
    options: ChartOptions;
}</snippet>

    <p>
        The provided params contains the following attributes:
    </p>

    <ul>
        <li>
            <code>cellRange</code>: Defines the range of cells to be charted. A range is normally defined
            with start and end rows and a list of columns. If the start and end rows are omitted, the range
            covers all rows (ie entire columns are selected).
            The columns can either be defined using a start and end column (the range will cover the start
            and end columns and all columns in between), or columns can be supplied specifically in cases
            where the required columns are not adjacent to each other.
            See <a href="../javascript-grid-range-selection/#api-addcellrange-rangeselection">Add Cell Range</a>
            for more details.
        </li>
        <li>
            <code>chartType</code>: The type of chart to create; i.e. 'groupedBar', 'stackedBar', 'pie',
            'doughnut' or 'line'.
        </li>
        <li>
            <code>chartContainer</code>: If the chart is to be displayed outside of the grid then provide a chart
            container. If the chart is to be displayed using the grid's popup window mechanism then leave undefined.
        </li>
        <li>
            <code>suppressChartRanges</code>: Normally when a chart is displayed using the grid, the grid will
            highlight the range the chart is charting when the chart gets focus. To suppress this behaviour,
            set <code>suppressChartRanges=true</code>.
        </li>
        <li>
            <code>aggregate</code>: When set to true, series values will be summed for each category before charting.
        </li>
        <li>
            <code>processChartOptions</code>: Options for changing the display of the chart. This works the same
            as the grid callback <code>processChartOptions</code> described in
            <a href="../javascript-grid-charts-customisation/">Chart Customisation</a>.
        </li>
    </ul>

    <p>
        The API returns a <code>ChartRef</code> object when a <code>chartContainer</code> is provided.
        This is the same structure that is provided to the <code>createChartContainer()</code> callback.
        The <code>ChartRef</code> provides the application with the <code>destroyChart()</code>
        method that is required when the application wants to dispose the chart.
    </p>

    <h3>API Example 1 - Chart Range in Grid Window</h3>

    <p>
        This example gets the grid to chart data in the grid's provided popup window. The following can be noted:
    </p>

    <ul>
        <li>
            Clicking 'Gold & Silver, 5 Rows' will chart the first five rows of Gold and Silver by Country.
        </li>
        <li>
            Clicking 'Bronze, All Rows' will chart Bronze by Country using all rows
            (the provided cell range does not specify rows).
        </li>
    </ul>

    <?= example('Chart API', 'chart-api', 'generated', array("enterprise" => true)) ?>

    <h3>API Example 2 - Charts in Dashboard</h3>

    <p>
        This example passes a <code>chartContainer</code> to the API to place the chart in a location other
        than the grid's popup window. The following can be noted:
    </p>

    <ul>
        <li>The charts are placed in div elements outside of the grid.</li>
        <li>The two pie charts are showing aggregations rather than charting individual rows.</li>
        <li>Clicking on a chart highlights the range in the grid for which the chart is based.</li>
        <li>
            The bar chart is sensitive to changes in the rows. For example if you sort, the chart updates to
            always chart the first five rows.
        </li>
        <li>All data is editable in the grid. Changes to the grid data is reflected in the charts.</li>
        <li>
            The two pie charts have legend on the bottom. This is configured in the
            <code>processChartOptions()</code>.
        </li>
    </ul>

    <?= example('Dashboard', 'dashboard', 'generated', array("enterprise" => true, "exampleHeight" => 700)) ?>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to learn how to: <a href="../javascript-grid-charts-container/">Provide a Chart Container</a>.
    </p>


<?php include '../documentation-main/documentation_footer.php'; ?>
