<?php
$pageTitle = "Charts - Markers";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Standalone Charts - Markers</h1>

<p class="lead">
    This section covers markers used by Line, Area and Scatter series.
</p>

<h2>Introduction</h2>

<p>
    If we continue with our <a href="../javascript-charts-line-series/#colors">line series example</a> and want
    to make the Diesel series markers square, we can achieve this by using the <code>shape</code> property
    inside the <code>marker</code> config.
</p>

<snippet language="ts">
marker: {
    shape: 'square'
}
</snippet>

<p>
    <img alt="Marker Shape" src="marker-shape-square.png" style="margin-bottom: 0px; height: 300px;">
</p>

<p>
    We can also configure the size of the markers like so:
</p>

<snippet language="ts">
marker: {
    size: 16
}
</snippet>

<p>
    <img alt="Marker Size" src="marker-size.png" style="margin-bottom: 0px; height: 300px;">
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
