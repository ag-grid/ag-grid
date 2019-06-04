<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Customising Charts</h1>

    <p class="lead">
        This section shows how to provide an alternative chart container before discussing the way charts can be
        customised to suit an application requirements.
    </p>

    <h2>Overriding Chart Options</h2>

    <p>
        The primary mechanism for customising chart is via the following <code>gridOptions</code> callback:
    </p>

    <snippet>
        interface ProcessChartOptionsParams {
            type: string;
            options: ChartOptions;
        }

        gridOptions.processChartOptions?(params: ProcessChartOptionsParams): ChartOptions;
    </snippet>

    <p>
        This callback is invoked once, before the chart is created, with <code>ProcessChartOptionsParams</code>.
    </p>

    <p>
        The params object contains a <code>type</code> property corresponding to the chart about to be created, along with
        the <code>ChartOptions</code> that are about to be applied.
    </p>

    <p>
        As the options vary for each chart type the specific chart options are covered in the sub sections below:
        <ul>
            <li><a href="../javascript-grid-charts-customisation-bar/">Customising Bar Charts</a></li>
            <li><a href="../javascript-grid-charts-customisation-line/">Customising Line Charts</a></li>
            <li><a href="../javascript-grid-charts-customisation-pie/">Customising Pie Charts</a></li>
            <li><a href="../javascript-grid-charts-customisation-doughnut/">Customising Doughnut Charts</a></li>
        </ul>
    </p>

    <h2>Customising Based on Chart Type</h2>

    <p>
        The params passed to <code>ProcessChartOptionsParams</code> details the chart type. The type will be
        one of <code>{groupedBar, stackedBar, line, pie, doughnut}</code>. The example below demonstrates
        customising based on chart type. The following can be noted:
    </p>

    <ul>
        <li>Click a button to create a chart of that type.</li>
        <li><b>Stacked Bar</b> and <b>Grouped Bar</b> charts have the legend docked to the <b>bottom</b>.</li>
        <li><b>Line</b> charts have the legend docked to the <b>left</b>.</li>
        <li><b>Pie</b> charts have the legend docked to the <b>top</b>.</li>
        <li><b>Doughnut</b> charts have the legend docked to the <b>right</b>.</li>
    </ul>

    <?= example('Custom Chart', 'custom-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
