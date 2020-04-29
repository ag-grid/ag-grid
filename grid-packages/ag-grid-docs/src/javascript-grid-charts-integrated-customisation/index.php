<?php
$pageTitle = "Charts: Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Chart Customisation</h1>

<p class="lead">
    Charts can be customised in a number of ways to suit your applications' requirements.
</p>

<h2>Overriding Chart Options</h2>

<p>
    The primary mechanism for customising charts is via the following <code>gridOptions</code> callback:
</p>

<snippet language="ts">
gridOptions.processChartOptions?(params: ProcessChartOptionsParams): ChartOptions;

interface ProcessChartOptionsParams {
    type: ChartType;
    options: ChartOptions;
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
    This callback is invoked once, before the chart is created, with <code>ProcessChartOptionsParams</code>.
</p>

<p>
    The params object contains a <code>type</code> property corresponding to the chart about to be created, along with
    the <code>ChartOptions</code> that are about to be applied.
</p>

<p>
    There are different available options to configure depending on the type of chart. Please refer to the relevant section below for more details:
    <ul>
        <li><a href="../javascript-grid-charts-integrated-customisation-general/">General Chart Customisation</a> (these apply to all chart types)</li>
        <li><a href="../javascript-grid-charts-integrated-customisation-bar/">Bar/Column Chart Customisation</a></li>
        <li><a href="../javascript-grid-charts-integrated-customisation-line/">Line Chart Customisation</a></li>
        <li><a href="../javascript-grid-charts-integrated-customisation-scatter/">Scatter/Bubble Chart Customisation</a></li>
        <li><a href="../javascript-grid-charts-integrated-customisation-area/">Area Chart Customisation</a></li>
        <li><a href="../javascript-grid-charts-integrated-customisation-pie/">Pie/Doughnut Chart Customisation</a></li>
    </ul>
</p>

<h3>Example: Customising Charts</h3>

<p>
    The example below demonstrates:
</p>

<ul class="content">
    <li><b>Stacked Bar</b>, <b>Grouped Bar</b> and <b>Normalized Bar</b> charts have the legend docked to the <code>bottom</code>.</li>
    <li><b>Stacked Column</b>, <b>Grouped Column</b> and <b>Normalized Column</b> charts have the legend docked to the <code>right</code>.</li>
    <li><b>Line</b> charts have the legend docked to the <code>left</code>.</li>
    <li><b>Scatter</b> charts have the legend docked to the <code>right</code>.</li>
    <li><b>Pie</b> charts have the legend docked to the <code>top</code>.</li>
    <li><b>Doughnut</b> charts have the legend docked to the <code>right</code>.</li>
</ul>

<?= grid_example('Customising Charts', 'custom-chart', 'generated', ['enterprise' => true]) ?>

<h2>Saving User Preferences</h2>

<p>
    <a href="../javascript-grid-charts-integrated-chart-events/">Chart events</a> can be used to detect and save user-made changes.
    Formatting changes made through the Format Panel can be captured using the <code>ChartOptionsChanged</code> event, and changes
    to the data range used to render the chart can be detected using the <code>ChartRangeSelectionChanged</code> event, which
    contains a <code>cellRange</code> object that contains information about the range and will allow you to recreate the chart.
</p>

<h3>Example: Saving User Preferences</h3>

<p>
    The example below demonstrates how the <code>ChartOptionsChanged</code> event can be used to save and restore
    user chart formatting preferences. Notice the following:
</p>

<ul class="content">
    <li><b>Saving Options by Chart Type</b>: format changes (via the format panel) are preserved after leaving and
        returning to the chart by using the <code>savedUserPreferenceByChartType</code> object to keep track of user
        format changes on a per-chart type basis.</li>
    <li><b>Saving Global Chart Options</b>: changes made to the legend options are applied to all new charts by using
        the <code>savedLegendUserPreference</code> object to globally keep track of legend preferences.</li>
</ul>

<?= grid_example('Saving User Preferences', 'saving-user-preferences', 'generated', ['exampleHeight' => 660,'enterprise' => true]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
