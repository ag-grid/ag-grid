<?php
$pageTitle = "Charts: Chart Container";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Chart Container</h1>

    <p class="lead">
        Displaying the generated chart within the grid-provided popup window will suit most needs. However
        you may wish to display the chart in a different location. For example,
        your application may already have popup windows and you wish to use the same library for consistency.
    </p>

    <p>
        To provide an alternative container for popup windows use the grid callback
        <code>createChartContainer(chartRef)</code>. The interface is as follows:
    </p>

    <snippet language="ts">
function createChartContainer(chartRef: ChartRef): void;

interface ChartRef {
    chartElement: HTMLElement;
    destroyChart: () => void;
}</snippet>

    <p>
        The callback is called each time the user elects to create a chart via the grid UI. The callback
        is provided with a <code>ChartRef</code> containing the following:
    </p>
    <ul>
        <li>
            <code>chartElement</code>: The chart DOM element, which the application is responsible for placing into the DOM.
        </li>
        <li>
            <code>destroyChart</code>: The application is responsible for calling this when the
            chart is no longer needed.
        </li>
    </ul>

    <p>
        The example below demonstrates the <code>createChartContainer()</code> callback. The example does not
        use an alternative popup window, but instead places the charts into the DOM below the grid. This
        crude approach is on purpose to minimise the complexity of the example and focus on just the callback
        and the interactions of the grid.
    </p>

    <note>
        When providing an element to display your chart, it is important to always set the <code>popupParent</code>
        to be <code>document.body</code>. This will allow floating elements within the chart's menus to be positioned
        correctly.
    </note>

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

    <?= grid_example('Provided Container', 'provided-container', 'generated', ['exampleHeight' => 650, 'enterprise' => true]) ?>

    <h2>Next Up</h2>

    <p>
        Continue to the next section to learn how to: <a href="../javascript-grid-charts-integrated-customisation/">Customise Charts</a>.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>
