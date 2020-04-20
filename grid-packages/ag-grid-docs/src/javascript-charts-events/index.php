<?php
$pageTitle = "Chart Events";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Events</h1>

<p class="lead">
    This section explains how to listen and respond to various chart events.
</p>

<h2>Series Events</h2>

<h3>Example: <code>nodeClick</code> Event</h3>

<?= chart_example('Node Click Event', 'node-click-event', 'generated'); ?>

<h3>nodeClick Event</h3>

<p>
    Fired when this series' node is clicked. Depending on the type of series,
    a node can mean a bar or a pie slice, or a marker, such as a line or an area series marker.
</p>

<p>
    A node is typically associated with a single element from the <code>chart.data</code> or <code>series.data</code>
    array, unless the node represents an aggregation of values, as is the case with histogram series bins.
</p>

<p>
    Each series fires its own version of the <code>nodeClick</code> event, as described below.
    But generally speaking every <code>nodeClick</code> event contains:
    <ul>
        <li>the <code>series</code> the node belongs to</li>
        <li>the piece of chart data or <code>datum</code></li>
        <li>the specific keys in that <code>datum</code> that were used to fetch the values represented by the clicked node</li>
    </ul>
</p>

<p>
    Note that the <code>datum</code> object is untyped and can contain keys that are not plotted by
    the chart, and that you can access in the event listener when a node is clicked.
</p>

<h4>Bar/Column series</h4>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'barSeriesConfig.listeners') ?>

<h4>Line series</h4>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'lineSeriesConfig.listeners') ?>

<h4>Area series</h4>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'areaSeriesConfig.listeners') ?>

<h4>Scatter series</h4>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'scatterSeriesConfig.listeners') ?>

<h4>Pie series</h4>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'pieSeriesConfig.listeners') ?>

<h4>Histogram series</h4>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'histogramSeriesConfig.listeners') ?>

<p>
    Note that the <code>datum</code> in this case is not an element from the <code>chart.data</code> or
    <code>series.data</code> array provided by the user. It's a histogram bin, which represents
    an aggregated value of one or more <code>datum</code>s, where the datums themselves can be
    accessed via the <code>datum.data</code> property.
</p>

<p>For example, to get all x values used by the bin, one could so the following:</p>

<?= createSnippet(<<<SNIPPET
for (var element of event.datum.data) {
    console.log(element[event.xKey]);
}
SNIPPET
) ?>

<h2>Chart Events</h2>

<h3>seriesNodeClick</h3>

<p>
    Fired when a node of any series in the chart is clicked.
    In case a chart has multiple series, it can be handy to be able to provide a single listener
    that will be called when a node is clicked in any of them.
</p>

<p>
    In this case the contents of the event object passed to the listener will depend on the type
    of series the clicked node belongs to.
</p>

<h3>Example: <code>seriesNodeClick</code> Event</h3>

<?= chart_example('Node Click Event', 'series-node-click-event', 'generated'); ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
