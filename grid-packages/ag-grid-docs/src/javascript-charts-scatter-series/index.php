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
    Scatter series configuration is largely the same as Line series configuration (please refer to the
    <a href="../javascript-charts-line-series/">Line series documentation</a> to learn more),
    so here we'll just give some examples and talk about relevant differences between the two.
</p>

<h2>Scatter Plot</h2>

<?= chart_example('Scatter Chart', 'scatter-chart', 'generated') ?>

<h2>Bubble Chart</h2>

<p>
    Bubble chart is simply a scatter plot where each point has an associated variable that determines
    the size of a bubble. Basically, instead of having pairs of variables one has triples.
</p>

<p>
    To turn a scatter plot into a bubble chart one must provide the <code>sizeKey</code>
    that will be used to fetch the value that will determine the size of each bubble.
    For the example below we are using the following key configs:
</p>

<snippet language="ts">
xKey: 'height',
yKey: 'weight',
sizeKey: 'age'
</snippet>

<p>
    Another config we should provide is the <code>size</code> of the marker.
    When the <code>sizeKey</code> is specified, the value of <code>marker.size</code>
    config takes on a different meaning &mdash; instead of determining the actual
    marker size, the <code>size</code> config now determines the maximum marker
    size. The marker also has the <code>minSize</code> config, which only applies
    when the <code>sizeKey</code> is set.
</p>

<snippet language="ts">
marker: {
    minSize: 8, // defaults to 8
    size: 30    // defaults to 8
}
</snippet>

<p>
    So for example, if the <code>sizeKey</code> data ranges from <code>-100</code>
    to <code>200</code>, the above config means that <code>-100</code> will correspond
    to marker of size <code>8</code>, <code>200</code> to a marker of size <code>30</code>,
    and any value between <code>-100</code> and <code>200</code> will be interpolated to
    a value between <code>8</code> and <code>30</code>.
</p>

<p>
    Finally, the bubble chart is called that way because the circle is the most common marker
    type used for this kind of scatter plot, but any other marker shape can used as well.
    The example below uses both <code>'circle'</code> and <code>'square'</code> markers
    of different sizes to represent the age of females and males respectively.
</p>

<?= chart_example('Bubble Chart', 'bubble-chart', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
