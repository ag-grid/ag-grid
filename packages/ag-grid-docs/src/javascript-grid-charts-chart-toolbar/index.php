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

    <div style="display: flex; margin-bottom: 25px; margin-top: 25px; margin-left: 40px;">

        <img src="./chart-toolbar.png"/>

        <div style="flex-grow: 1;">
            <ul>
            <p>
                The chart toolbar appears when the mouse hovers over the top left area of the chart. It allows
                users to perform the following:</p>
            <p>
                <ul>
                    <li style="padding-bottom: 5px">Change the chart type</li>
                    <li style="padding-bottom: 5px">Change the colour palette</li>
                    <li style="padding-bottom: 5px">Select categories and series columns</li>
                    <li>Download the chart</li>
                </ul>
            </p>
            </ul>
        </div>
    </div>

    <p>
        The following sections discuss these toolbar features along with details on how to configure toolbar items.
    </p>

    <h2>Chart Settings</h2>

    <p>
        The chart settings toolbar item allows users to change the chart type as well as the color palette used in the
        chart as demonstrated below:
    </p>
        <img alt="Chart Settings" src="chart-settings.gif" style="max-width: 100%; border: grey solid 1px">
    <p>
       <br>
       Right now the toolbar allow users to switch between the 5 most commonly used charts: Grouped Bar, Stacked Bar,
       Line, Pie and Doughnut. However more chart types will be added soon.
    </p>

    <p>
        The color palette used by the grid can also be changed via the carousel located at the bottom of the chart
        setting panel. When themes are added (also coming soon) the available palettes can be customised to suit
        application requirements.
    </p>

    <h2>Chart Data</h2>

    <p>
        The chart data toolbar is used to dynamically change the data being charted as shown below:
    </p>
    <img alt="Chart Data" src="chart-data.gif" style="max-width: 100%; border: grey solid 1px">

    <p>
        <br>
        Using the chart data panel the category used in the chart can be changed via radio button selections. Multiple
        series can be charted and these can also be changed via checkbox selection.
    </p>

    <p>
        Grid columns can either be configured as categories or series for charting or left for the grid to infer based
        on the data contained in the columns.
    </p>

    <p>
        For more details on how the grid determines which columns are to be used as chart categories and series see the
        section on <a href="../javascript-grid-charts-chart-ranges/#defining-categories-and-series">Defining Categories and Series</a>.
    </p>

    <h2>Chart Download</h2>

    <p>
        The 'Download Chart' toolbar item will download the chart as a PNG file. Note that the chart is drawn
        using Canvas in the browser and as such the user can also right click on the chart and save just like
        any other image on a web page.
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
    shown by default in <code>defaultItems</code> along with the grid API's.
</p>

<p>
    The list returned by the <code>gridOptions.getChartToolbarItems()</code> callback can be modified to reorder and
    omit items from the toolbar. For instance returning an empty array will hide all toolbar items.
</p>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to learn about the: <a href="../javascript-grid-charts-chart-range-api/">Chart API</a>.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>