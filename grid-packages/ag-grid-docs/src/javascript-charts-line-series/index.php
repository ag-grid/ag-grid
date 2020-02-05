<?php
$pageTitle = "Charts - Line Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Standalone Charts - Line Series</h1>

<p class="lead">
    This section covers the most common series type &mdash; Line series.
</p>

<p>
    Line series is a great choice in many situations. It's the series of choice when you need to spot a trend,
    render large amounts of data or create a real-time chart. Line series is also the preferred choice for
    rendering impcomplete data that has some values missing.
</p>

<h2>First Line Chart</h2>

<?= chart_example('Basic Line Chart', 'basic-line'); ?>

<p>
    Since this series type is so common, the chart factory (<code>AgChart.create</code> method) uses it
    as the default type, so it doesn't have to be specified explicitly.
</p>

<p>
    The simplest line series config therefore only requires two properties: <code>xKey</code> and <code>yKey</code>.
</p>

<snippet language="ts">
series: [{
    // type: 'line' <-- assumed
    xKey: 'year',
    yKey: 'spending'
}]
</snippet>

<p>
    The chart expects the data (<code>chart.data</code> property) to be an array of objects, where each object
    is a table row or a database record and each key is a column. To plot anything on a plane, we need at least
    two coordinates: <code>x</code> and <code>y</code>. The <code>xKey</code> and <code>yKey</code> line series
    configs tell the series what keys should be used to fetch the values of these coordinates from each object
    in the <code>data</code> array.
</p>

<h2>Multiple Series</h2>

<p>
    If we have more than two fields inside each object in the <code>data</code> array, we can create
    a multi-series line chart. For example, if our datums look like this:
</p>

<snippet language="ts">
{
    quarter: 'Q1',
    gas: 200,
    diesel: 100
}
</snippet>

<p>
    then we can use the same <code>quarter</code> key as <code>xKey</code> for both series
    and <code>gas</code> and <code>diesel</code> keys for <code>yKey</code> of the first
    and second line series, respectively.
</p>

<p>
    To create multiple line series we need to provide two config objects in the
    <code>series</code> array:
</p>

<snippet language="ts">
series: [{
    xKey: 'quarter',
    yKey: 'gas'
}, {
    xKey: 'quarter',
    yKey: 'diesel'
}]
</snippet>

<p>
    And we get a result like this:
</p>

<?= chart_example('Multiple Line Series', 'multi-line'); ?>

<p>
    Here, we use two config objects in the <code>series</code> array, one for each series.
    Since both series show fuel spending per quarter, the <code>xKey</code> for both is the same,
    but the <code>yKey</code>s that show spending per fuel type are different.
</p>

<p>
    By default the legend shows the actual name of the key used to fetch the series data,
    and that name may not be very presentable. In our case, the <code>gas</code> and <code>diesel</code> keys
    inside the data objects are not capitalized. We can pass a more descriptive and presentable name
    to the <code>yName</code> config, and the legend will show that instead.
</p>

<p>
    <img alt="Two Line Series" src="two-line-series.png" style="margin-bottom: 0px; height: 300px;">
</p>

<h2>Line and Marker Colors</h2>

<p>
    The chart above is not complicated, but it could still benefit from more visual separation.
    Currently both series use the same colors. Let's change that by making diesel look more like diesel.
    If we just add the following two configs to the second series:
</p>

<snippet language="ts">
stroke: 'black',
marker: {
    fill: 'gray'
}
</snippet>

<p>
    we'll get a result like this:
</p>

<p>
    <img alt="Two Colored Line Series" src="two-colored-line-series.png" style="margin-bottom: 0px; height: 300px;">
</p>

<p>
    The <code>stroke</code> config sets the color of the stroke of the series' line.
    It also affects the color of the stroke of the series' markers, if the <code>stroke</code>
    is not specified inside the <code>marker</code> config explicitly.
</p>

<h2>Missing Data</h2>

<?= chart_example('Line Series with Incomplete Data', 'gap-line'); ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
