<?php
$pageTitle = "Charts - Scatter Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Scatter and Bubble Series</h1>

<p class="lead">
    Scatter charts use two axes to plot <code>(x,y)</code> pairs of numeric variables as points at the intersection
    of <code>x</code> and <code>y</code>.
</p>

<note>
    Scatter series configuration is largely the same as line series configuration (please refer to the
    <a href="../javascript-charts-line-series/">line series documentation</a> to learn more),
    so here we'll just give some examples and cover only the differences.
</note>

<h2>Scatter Plot</h2>

<p>
    Scatter plots are great for identifying the relationship between plotted values, as well as
    outliers and gaps in the data.
</p>

<p>
    Here's a simple scatter chart that plots the mean sea level measured over a few years.
    The measurements may have a certain degree of variability and error to them, but the overall
    trend is clear &mdash; the sea level is rising.
</p>

<?= chart_example('Scatter Chart', 'scatter-chart', 'generated') ?>

<h2>Bubble Chart</h2>

<p>
    A bubble chart is simply a scatter plot where each point has another associated variable that determines
    the size of a bubble. Instead of having pairs of variables, we now have triples.
</p>

<p>
    To turn a scatter plot into a bubble chart you must provide the <code>sizeKey</code>
    that will be used to fetch the value that will determine the size of each bubble.
    For the example below we are using the following key configs:
</p>

<?= createSnippet(<<<SNIPPET
xKey: 'height',
yKey: 'weight',
sizeKey: 'age'
SNIPPET
) ?>

<p>
    Another config we should provide is the <code>size</code> of the marker.
    When the <code>sizeKey</code> is specified, the value of <code>marker.size</code>
    config takes on a different meaning &mdash; instead of determining the actual
    marker size, the <code>size</code> config now determines the maximum marker
    size. The marker also has the <code>minSize</code> config, which only applies
    when the <code>sizeKey</code> is set.
</p>

<?= createSnippet(<<<SNIPPET
marker: {
    minSize: 8, // defaults to 8
    size: 30    // defaults to 8
}
SNIPPET
) ?>

<p>
    So for example, if the <code>sizeKey</code> data ranges from <code>-100</code>
    to <code>200</code>, the above config means that <code>-100</code> will correspond
    to marker of size <code>8</code> (the <code>minSize</code>), <code>200</code> to a marker of size <code>30</code>
    (the <code>size</code>), and any value between <code>-100</code> and <code>200</code> will be interpolated to
    a value between <code>8</code> and <code>30</code>.
</p>

<p>
    Finally, the bubble chart is so called because the circle is the most common marker
    type used for this kind of scatter plot, but with ag-Charts any other marker shape can be used as well.
</p>

<p>
    The example below uses both <code>'circle'</code> and <code>'square'</code> markers
    to represent the age of females and males respectively. We provide the names of all keys to get nice looking
    tooltips and the <code>title</code> of the series to have it reflected in the legend. The series title is shown
    in the tooltips as well.
</p>

<?= chart_example('Bubble Chart', 'bubble-chart', 'generated') ?>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'scatterSeriesConfig') ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-charts-pie-series/">pie and doughnut series</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
