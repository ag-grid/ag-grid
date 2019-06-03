<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Chart API</h1>

    <p class="lead">
        This section covers how to use the chart range api in your applications.
    </p>

    <h2>Charting API</h2>

    <p>
        Charts can be created programmatically via the grid's <code>chartRange()</code> API. The interface is
        as follows:
    </p>

    <snippet>
function chartRange(params: ChartRangeParams): ChartRef | undefined;
    cellRange: CellRangeParams;
    chartType: string;
    chartContainer?: HTMLElement;
    suppressChartRanges?: boolean;
    aggregate?: boolean;
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
</snippet>

    <p>
        The provided params contains the following attributes:
    </p>

    <ul>
        <li>
            <code>cellRange</code>: Defines the range of cells to be charted.
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
            <code>suppressChartRanges</code>: when set to true, the chart range will not appear in the grid.
        </li>
        <li>
            <code>aggregate</code>: when set to true, series values will be summed for each category.
        </li>
    </ul>

    <p>
        The API can return back a <code>ChartRef</code> object, the same structure that is provided to the
        <code>createChartContainer()</code> callback (see above). The <code>ChartRef</code> is returned when
        the <code>chartContainer</code> is provided. This provides the application with the <code>destroyChart()</code>
        method that is required when the application wants to dispose the chart.
    </p>

    <h3>API Example 1 - Chart Range in Grid Window</h3>

    <p>
        This example gets the grid to chart data in the grid's provided popup window. The following can be noted:
    </p>

    <ul>
        <li>
            Clicking 'Apples & Oranges, 5 Rows' will chart the first five rows of apples and oranges in
            a grid popup window.
        </li>
        <li>
            Clicking 'Bananas, All Rows' will chart bananas and all rows (the provided cell range does not specify rows).
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
    </ul>

    <?= example('Dashboard', 'dashboard', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
