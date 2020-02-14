<?php
$pageTitle = "Charts - Pie Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Standalone Charts - Pie Series</h1>

<p class="lead">
    Pie series is used for showing how parts relate to the whole.
</p>

<note>
    Pie series is currently the only supported polar series. Polar means that instead of using
    x/y coordinates to position things we use angle and radius. For this reason, pie series
    configuration is slightly different compared to that of the other series.
    Please keep this in mind when reading this chapter.
</note>

<h2>Basic Pie</h2>

<p>
    To plot a basic pie all we need is an array of values that will determine the angle of each
    pie slice. The total of all values will correspond to the full pie. Notice how instead of
    using <code>xKey</code> and <code>yKey</code> configs in other series, all we have to
    specify in this case is the <code>angleKey</code>:
</p>

<snippet language="ts">
data: [
    { value: 56.9 },
    { value: 22.5 },
    { value: 6.8 },
    { value: 8.5 },
    { value: 2.6 },
    { value: 1.9 }
],
series: [{
    type: 'pie',
    angleKey: 'value'
}]
</snippet>

<p>
    And the generated chart will look like this:
</p>

<?= chart_example('Basic Pie Chart', 'basic-pie', 'generated') ?>

<p>
    Each slice value is shown in the tooltip on hover.
</p>

<p>
    <img alt="" src="scatter-chart.jpg" style="margin-bottom: 0px; width: 600px; max-width: 100%">
</p>

<h2>Slice Label</h2>

<p>
    Notice how there's no legend or labels next to pie slices in the example above.
    To show those, the label information must be in the <code>data</code>.
    Additionally, we'll have to provide the <code>labelKey</code>:
</p>

<snippet language="ts">
data: [
    { label: 'Android', value: 56.9 },
    { label: 'iOS', value: 22.5 },
    { label: 'BlackBerry', value: 6.8 },
    { label: 'Symbian', value: 8.5 },
    { label: 'Bada', value: 2.6 },
    { label: 'Windows', value: 1.9 }
],
series: [{
    type: 'pie',
    angleKey: 'value',
    labelKey: 'label'
}]
</snippet>

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
    The distance of the label from the callout line can be adjusted using
    the <code>label.offset</code> config:
</p>

<snippet language="ts">
label: {
    offset: 3
}
</snippet>

<p>
    Finally, the callout itself can be configured to have a different <code>length</code>,
    <code>color</code> and <code>strokeWidth</code>:
</p>

<snippet language="ts">
callout: {
    colors: 'red',
    length: 20,
    strokeWidth: 3
}
</snippet>

<h2>Slice Radius</h2>

<p>
    Going back to our previous example that shows the marker share of mobile operating systems,
    we might have not just the market share data, but the level of user satisfaction
    with any given OS. In such a case we could represent the safisfaction level
    as the radius of a slice using the <code>radiusKey</code> config:
</p>

<snippet language="ts">
series: [{
    type: 'pie',
    angleKey: 'value',
    labelKey: 'label',
    radiusKey: 'satisfaction'
}]
</snippet>

<?= chart_example('Slices with different radii', 'slice-radius', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
