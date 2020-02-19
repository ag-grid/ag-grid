<?php
$pageTitle = "Charts - Scatter Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Scatter Series</h1>

<p class="lead">
    Think of Scatter series as Line series without a line. Scatter charts use two axes to plot
    <code>(x,y)</code> pairs of numeric variables as points at the intersection of <code>x</code>
    and <code>y</code>.
</p>

<note>
    Scatter series configuration is largely the same as Line series configuration (please refer to the
    <a href="../javascript-charts-line-series/">Line series documentation</a> to learn more),
    so here we'll just give some examples and cover the differences only.
</note>

<h2>Scatter Plot</h2>

<p>
    Scatter plots are great for identifying the relationship between plotted values, as well as
    outliers and gaps in the data.
</p>

<p>
    Here's an simple scatter chart that plots mean sea level measured over a few years' time.
    The measurments may have a certain degree of variability and error to them, but the overall
    trend is clear &mdash; the sea level is rising.
</p>

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
    type used for this kind of scatter plot, but any other marker shape can be used as well.
</p>

<p>
    The example below uses both the <code>'circle'</code> and the <code>'square'</code> markers
    of different sizes to represent the age of females and males respectively. Also note the
    following:
</p>

<ul class="content">
    <li>
        The <code>axes</code> configuration is explicit because the chart defaults to <code>'category'</code>
        axis on the bottom but we want both axes to be of type <code>'number'</code>.
    </li>
    <li>
        Both axes have their <code>title</code> config set so that it's easier to tell
        which dimension is weight and which is height.
    </li>
    <li>
        Both axes also use label formatters to add the <code>mm</code> and <code>kg</code> units
        to the values.
    </li>
    <li>
        The labels on the bottom axis are angled to prevent labels from overlapping, especially
        when viewed on mobile devices.
    </li>
    <li>
        We provide the names of all keys to get nice looking tooltips and the <code>title</code>
        of the series to have it reflected in the legend. The series title is shown in the
        tooltips as well.
    </li>
</ul>

<?= chart_example('Bubble Chart', 'bubble-chart', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
