<?php
$pageTitle = "Charts - Scatter Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Standalone Charts - Scatter Series</h1>

<p class="lead">
    Think of Scatter series as Line series without a line. Scatter series plot pairs of numeric variables
    as points, where one variable in a pair acts as a point coordinate along the chart's X-axis and the other
    serves as the Y-axis coordinate. Scatter plots are great for identifying the relationship between plotted
    values, as well as gaps in the data and outliers.
</p>

<p>
    Scatter series configuration is pretty much the same as Line series configuration (please refer to the
    <a href="../javascript-charts-line-series/">Line series documentation</a> to learn more),
    so here we'll just give some examples and talk about relevant differences between the two.
</p>

<h2>Scatter Plot</h2>

<?= chart_example('Scatter Chart', 'scatter-chart', 'generated') ?>

<h2>Bubble Chart</h2>

<p>
    Bubble chart is simply a scatter plot where each point has an associated variable that determines
    the radius of a bubble. Basically, instead of having pairs of variables one has triples.
</p>

<p>
    <img alt="" src="bubble-chart.png" style="margin-bottom: 0px; width: 600px; max-width: 100%">
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
