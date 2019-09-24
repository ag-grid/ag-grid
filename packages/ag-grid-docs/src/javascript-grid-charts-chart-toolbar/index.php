<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Chart Toolbar</h1>

    <p class="lead">
        The chart toolbar appears when the mouse hovers over the top right area of the chart, and provides access to 
        additional functionality and the chart configuration sidebar.
    </p>

    <div style="display: flex; margin-bottom: 25px; margin-top: 25px; margin-left: 40px;">

        <img src="./chart-toolbar.png"/>

        <div style="flex-grow: 1;">
            <ul>
            <p>
                From the toolbar, users can:</p>
            <p>
                <ul>
                    <li style="padding-bottom: 5px">Change the chart type</li>
                    <li style="padding-bottom: 5px">Change the colour palette</li>
                    <li style="padding-bottom: 5px">Change which columns are used as categories and series</li>
                    <li style="padding-bottom: 5px">Format different aspects of the chart</li>
                    <li style="padding-bottom: 5px">Unlink the chart from the grid</li>
                    <li>Download the chart</li>
                </ul>
            </p>
            </ul>
        </div>
    </div>

    <h2>Configuration Sidebar</h2>

    <p>
        Clicking on the 'hamburger' icon will open up the configuration sidebar, which provides access to a number of
        panels that allow the user to configure different aspects of the chart.
    </p>

    <h3>Chart Settings</h3>

    <p>
        The chart settings panel allows users to change the chart type as well as the colour palette used in the
        chart as demonstrated below:
    </p>
        <img alt="Chart Settings" src="chart-settings.gif" style="max-width: 100%; border: grey solid 1px">
    <p>
       <br>
       Notice that charts are organised into different groups and the current chart can be changed by selecting the icon
       of a different chart.
    </p>

    <p>
        The colour palette used by the chart can also be changed via the carousel located at the bottom of the chart
        setting panel.
    </p>

    <h3>Chart Data</h3>

    <p>
        The chart data panel is used to dynamically change the data being charted as shown below:
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

    <h3>Chart Format</h3>

    <p>
        The chart format panel allows users to change the appearance of the chart as shown below:
    </p>
    <img alt="Chart Format" src="chart-format.gif" style="max-width: 100%; border: grey solid 1px">

    <p>
        <br>
        Chart options corresponding to the currently selected chart type appear in the format panel. This gives users
        full control over the appearance of the chart.
    </p>

    <h2>Unlinking Charts</h2>

    <p>
        Charts are linked to the data in the grid by default, so that if the data changes, the chart will also update. 
        However, it is sometimes desirable to unlink a chart from the grid data. For instance, users may want to prevent 
        a chart from being updated when subsequent sorts and filters are applied in the grid.
    </p>

    <p>
        Unlinking a chart is achieved through the 'Unlink Chart' toolbar item as shown below:
    </p>

    <img alt="Unlinking Charts" src="chart-unlinking.gif" style="max-width: 100%; border: grey solid 1px">

    <p>
        <br>
        Notice that the chart range disappears from the grid when the chart has been unlinked, and subsequent changes
        to the grid sorting do not impact the chart.
    </p>

    <h2>Downloading Charts</h2>

    <p>
        The 'Download Chart' toolbar item will download the chart as a PNG file. Note that the chart is drawn
        using Canvas in the browser and as such the user can also right click on the chart and save just like
        any other image on a web page.
    </p>

    <h2>Configuring Toolbar Items and Menu Panels</h2>

    <p>
        By default all available toolbar items and menu panels can be accessed. However, items can be removed and
        reordered via the <code>gridOptions.getChartToolbarItems()</code> callback function, which has the following
        interface:
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
    This function receives the <code>GetChartToolbarItemsParams</code> object which contains the list of elements that are
    included by default in <code>defaultItems</code>, along with the grid APIs.
</p>

<p>
    The list returned by the <code>gridOptions.getChartToolbarItems()</code> callback can be modified to reorder and
    omit items from the toolbar. For instance, returning an empty array will hide all toolbar items.
</p>

<p>
    The available elements are <code>'chartSettings', 'chartData', 'chartFormat', 'chartUnlink', 'chartDownload'</code>.
</p>

<h3>Example: Custom Toolbar Layout</h3>

<p>
    The example below shows how the toolbar can be customised. Notice the following:
</p>

<ul class="content">
    <li><b>Download Chart</b> - has been positioned as the first toolbar item.</li>
    <li><b>Chart Data Panel</b> - appears first in the tabbed menu.</li>
    <li><b>Chart Format Panel</b> - has been removed from the tabbed menu.</li>
    <li><b>Unlink Toolbar Item</b> - has been removed from the toolbar.</li>
</ul>

<?= example('Custom Toolbar', 'custom-toolbar', 'generated', array("enterprise" => true)) ?>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to learn about the: <a href="../javascript-grid-charts-chart-range-api/">Chart API</a>.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>