<?php
$pageTitle = "Charts - Pie Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Pie Series</h1>

<p class="lead">
    This section shows how to create pie charts.
</p>

<p>
    Pie series is used for showing how parts relate to the whole. For example when you want to show
    market share of each competitor.
</p>

<h2>Basic Configuration</h2>

<p>
    To plot a basic pie all we need is an array of values that will determine the angle of each
    pie slice. The total of all values will correspond to the full pie.
</p>

<p> A basic pie series configuration is shown below:</p>

<snippet language="ts">
series: [{
    type: 'pie',
    angleKey: 'value'
}]
</snippet>

<h2>Example: Basic Pie Series</h2>

<p>
    The example below demonstrates a simple pie series, notice that
    <a href="../javascript-charts-tooltips/">Tooltips</a> show the value of each pie slice.
</p>

<?= chart_example('Basic Pie Chart', 'basic-pie', 'generated') ?>

<h2>Slice Labels</h2>

<p>
    Notice how there's no legend or labels next to pie slices in the example above.
    To show those, the label information must be in the <code>data</code>.
    Additionally, we'll have to provide the <code>labelKey</code>:
</p>

<snippet language="ts">
series: [{
    type: 'pie',
    angleKey: 'value',
    labelKey: 'label'
}]
</snippet>

<h2>Example: Pie Chart with Labels</h2>

<p>
    Now we get the labels, the legend, and the tooltips now show labels
    next to values as well:
</p>

<?= chart_example('Pie Chart with Labels', 'pie-labels', 'generated') ?>

<p>
    Each individual slice can be toggled on and off via the legend.
</p>

<p>
    Notice, that not all of the slices in the chart above have a label.
    The reason for this is that certain pie slices can be way too small
    and if there's a cluster of them, their labels will overlap, resulting
    in a messy chart. To prevent this from happening the series only show
    labels for pie slices greater than a certain angle, which by default is
    set to be <code>20</code> degrees. This value is adjustable via the
    <code>label.minAngle</code> config:
</p>

<snippet language="ts">
label: {
    minAngle: 20
}
</snippet>

<p>
    The label's callout can be configured to have a different <code>length</code>,
    <code>color</code> and <code>strokeWidth</code>, for example:
</p>

<snippet language="ts">
callout: {
    colors: 'red',
    length: 20,
    strokeWidth: 3
}
</snippet>

<p>
    Please refer to the <a href="#label-callout-api-reference">API reference</a> below
    to learn more about <code>label</code> and <code>callout</code>.
</p>

<h2>Variable Slice Radius</h2>

<p>
    Let's say you have the data for both the market share of mobile operating systems
    and the level of user satisfaction with each OS. In such a case we could represent
    the safisfaction level as the radius of a slice using the <code>radiusKey</code> config
    like so:
</p>

<snippet language="ts">
series: [{
    type: 'pie',
    labelKey: 'os',
    angleKey: 'share',
    radiusKey: 'satisfaction'
}]
</snippet>

<p>
    A pie chart where slices can have different radii is also know as a <strong>rose chart</strong>.
</p>

<h2>Example: Rose Chart</h2>

<?= chart_example('Slices with different radii', 'slice-radius', 'generated') ?>

<h2>Donuts</h2>

<p>
    Pie series can be used to create a donut chart by using the <code>innerRadiusOffset</code>
    config.
</p>

<snippet language="ts">
series: [{
    type: 'pie',
    labelKey: 'os',
    angleKey: 'share',
    innerRadiusOffset: -70
}]
</snippet>

<p>
    The config specifies the offset value from the maximum pie radius which all pie
    slices use by default (the maximum pie series radius is detetermed automatically by the
    chart depending on chart's dimensions). <code>-70</code> in the snippet above means
    the inner radius of the series should be 70 pixels smaller than the maximum radius.
</p>

<h2>Example: Donut Chart</h2>

<?= chart_example('Donut Chart', 'donut-chart', 'generated') ?>

<h2>Multiple Donuts</h2>

<p>
    Just like we can configure the <code>innerRadiusOffset</code> we can also configure the
    <code>outerRadiusOffset</code>. This gives us an ability to prevent multiple pie series
    from overlapping inside a single chart.
</p>

<snippet language="ts">
series: [{
    type: 'pie',
    outerRadiusOffset: 0, // default
    innerRadiusOffset: -40,
    ...
}, {
    type: 'pie',
    outerRadiusOffset: -100,
    innerRadiusOffset: -140,
    ...
}]
</snippet>

<p>
    In the snippet above we configure the <code>outerRadiusOffset</code> of the second (inner) series
    to be smaller than the <code>innerRadiusOffset</code> of the first (outer) series.
    The difference of <code>60</code> between these offsets will determine the amount of
    gap between outer and inner series. And the difference between <code>outerRadiusOffset</code>
    and <code>innerRadiusOffset</code> of each series, will determine the thickness of their rings.
    In this case, <code>40</code> for both series.
</p>

<h2>Example: Multiple Donuts</h2>

<p>
    The example below uses one pie series to plot the market share of each operating system
    and another pie series to plot user satisfaction level with each OS:
</p>

<?= chart_example('Donut Chart', 'multi-donut', 'generated') ?>

<h2>Label &amp; Callout API Reference</h2>

<?php createDocumentationFromFile("../javascript-charts-api-explorer/config.json", "pieSeriesConfig.label") ?>
<?php createDocumentationFromFile("../javascript-charts-api-explorer/config.json", "pieSeriesConfig.callout") ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
