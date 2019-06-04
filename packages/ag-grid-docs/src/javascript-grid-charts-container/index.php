<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Charts Container</h1>

    <p class="lead">
        Displaying the generated chart within the grid provided popup window will suit most needs. However
        you may wish to display the chart in a different location. For example
        your application may already have popup windows and you wish use the same library for consistency.
    </p>

    <p>
        To provide an alternative container for popup windows use the grid callback
        <code>createChartContainer(chartRef)</code>. The interface is as follows:
    </p>

    <snippet>
// grid callback to implement to place chart in an alternative container
function createChartContainer(chartRef: ChartRef): void;

// function gets a Chart Reference
interface ChartRef {
    // the chart DOM element, application responsible for placing into the DOM
    chartElement: HTMLElement;
    // application responsible for calling destroyChart when chart is no longer needed
    destroyChart: () => void;
}</snippet>

    <p>
        The callback is called each time the user elects to create a chart via the grid UI. The callback
        is provided with a <code>ChartRef</code> containing the following:
    </p>
    <ul>
        <li>
            <code>chartElement</code>: The chart DOM element, application responsible for placing into the DOM.
        </li>
        <li>
            <code>destroyChart</code>: The application is responsible for calling destroyChart() when the
            chart is no longer needed.
        </li>
    </ul>

    <p>
        The example below demonstrates the <code>createChartContainer()</code> callback. The example does not
        use an alternative popup window, instead it just places the charts into the DOM below the grid. This
        crude approach is on purpose to minimise the complexity of the example and focus on just the callback
        and the interactions of the grid.
    </p>

    <p>
        From the example, the following can be noted:
    </p>
    <ul>
        <li>
            Select a range of numbers (medal columns) and create a chart from the context menu.
        </li>
        <li>
            The chart appears below the grid rather than in a popup window. This is because the
            <code>createChartContainer()</code> is implemented.
        </li>
        <li>
            Each chart is displayed alongside a 'Destroy' button. The logic behind the destroy
            button calls <code>destroyChart()</code> to destroy the chart instance.
        </li>
    </ul>

    <?= example('Provided Container', 'provided-container', 'generated', array("exampleHeight" => 650, "enterprise" => true)) ?>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to learn how to: <a href="../javascript-grid-charts-customisation/">Customise Charts</a>.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>
