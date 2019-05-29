<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Chart Toolbar</h1>

    <p class="lead">
        This section covers the functionality that is available via the chart toolbar along with configuration details.
    </p>

    <p>
        The chart toolbar appears when the mouse hovers over the top left area of the chart. This toolbar allows users
        to change the chart type and color palette, as well changing the categories and series on the chart.
    </p>

    <p>
        <img alt="Charting Toolbar" src="chart-toolbar.gif" style="margin-bottom: 0px; width: 100%; border: grey solid 1px">
    </p>

    <h2>Configuring Toolbar Items</h2>

    <p>
        By default all available toolbar items are included by default. However items can be removed and reordered via
        the <code>gridOptions.getChartToolbarItems()</code> callback function.
    </p>

    <p>
        The interface for the <code>gridOptions.getChartToolbarItems()</code> callback function is shown below:
    </p>

<snippet>
interface GridOptions {
    getChartToolbarItems(params: GetChartToolbarItemsParams): string[];
}

interface GetChartToolbarItemsParams {
    defaultItems: string[];
    api: GridApi;
    columnApi: ColumnApi;
}

</snippet>

<p>
    This function receives the <code>GetChartToolbarItemsParams</code> object which contains the list of items that are
    shown by default in <code>defaultItems</code> along with the grid api's.
</p>

<p>
    The list returned by the <code>gridOptions.getChartToolbarItems()</code> callback can be modified to reorder and
    omit items from the toolbar. For instance returning an empty array will hide all toolbar items.
</p>


<?php include '../documentation-main/documentation_footer.php'; ?>