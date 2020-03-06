<?php
$pageTitle = "Charts - Line Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Line Series</h1>

<p class="lead">
    This section covers the most common series type &mdash; Line series.
</p>

<p>
    Line series can be used in many situations. It's the series of choice when you need to spot a trend,
    render large amounts of data or create a real-time chart. Line series is also the preferred choice for
    rendering continuous data with irregular intervals or incomplete data that has some values missing.
</p>

<h2>Single Series</h2>

<p>
    Since <code>'line'</code> series type is so common, the chart factory
    (<code>AgChart.create</code> method) uses it as the default type, so it doesn't have
    to be specified explicitly.
</p>

<p>
    The simplest line series config therefore only requires two properties:
    <code>xKey</code> and <code>yKey</code>:
</p>

<?= createSnippet(<<<SNIPPET
series: [{
    // type: 'line' <-- assumed
    xKey: 'year',
    yKey: 'spending'
}]
SNIPPET) ?>

<?= chart_example('Single Line Series', 'basic-line', 'generated'); ?>

<p>
    The chart expects the data (<code>chart.data</code> property) to be an array of objects, where each object
    is a table row or a database record and each key is a column. To plot anything on a plane, we need at least
    two coordinates: <code>x</code> and <code>y</code>. The <code>xKey</code> and <code>yKey</code> line series
    configs tell the series which keys should be used to fetch the values of these coordinates from each object
    in the <code>data</code> array.
</p>

<h2>Multiple Series</h2>

<p>
    If we have more than two fields inside each object in the <code>data</code> array, we can create
    a multi-series line chart. For example, if a datum looks like this:
</p>


<?= createSnippet(<<<SNIPPET
{
    quarter: 'Q1',
    petrol: 200,
    diesel: 100
}
SNIPPET) ?>

<p>
    then we can use the same <code>quarter</code> key as <code>xKey</code> for both series
    and <code>petrol</code> and <code>diesel</code> keys for <code>yKey</code> of the first
    and second line series, respectively.
</p>

<p>
    To create multiple line series we need to provide two config objects in the
    <code>series</code> array:
</p>

<?= createSnippet(<<<SNIPPET
series: [
    {
        xKey: 'quarter',
        yKey: 'petrol'
    },
    {
        xKey: 'quarter',
        yKey: 'diesel'
    }
]
SNIPPET) ?>

<p>
    And we get a result like this:
</p>

<?= chart_example('Multiple Line Series', 'multi-line', 'generated'); ?>

<h2>Legend and Tooltip Information</h2>

<p>
    By default the legend shows the keys used to fetch the series data, but those
    may not be very presentable. In our case, the <code>petrol</code> and <code>diesel</code> keys
    inside the data objects are not capitalised. We can provide a better display name
    using the <code>yName</code> config, and the legend will show that instead.
</p>

<?= createSnippet(<<<SNIPPET
series: [
    {
        xKey: 'quarter',
        yKey: 'petrol',
        yName: 'Petrol'
    },
    {
        xKey: 'quarter',
        yKey: 'diesel',
        yName: 'Diesel'
    }
]
SNIPPET) ?>

<?= chart_example('Legend and Tooltip Information', 'legend-info', 'generated'); ?>

<p>
    The provided <code>yName</code> will also show up in tooltip titles:
</p>

<p style="text-align: center;">
    <img alt="Tooltip with no title" src="no-title-tooltip.png" style="margin-bottom: 0px; height: 123px;">
    <span style="width: 50px; display: inline-block;">--></span>
    <img alt="Tooltip with title" src="title-tooltip.png" style="margin-bottom: 0px; height: 158px;">
</p>

<h2>Line and Marker Colours</h2>

<p>
    The chart above is not complicated, but it could still benefit from more visual separation.
    Currently both series use the same colours. Let's change that by making diesel look more like diesel.
    If we just add the following two configs to the second series:
</p>

<?= createSnippet(<<<SNIPPET
stroke: 'black',
marker: {
    fill: 'gray',
    stroke: 'black'
}
SNIPPET) ?>

<p>
    We'll get a result like this:
</p>

<?= chart_example('Line and Marker Colours', 'line-marker-colors', 'generated'); ?>

<h2>Missing Data</h2>

<p>
    In a perfect world all data would be 100% complete. Unfortunately, in the real one, data for certain
    items or time periods might be missing or corrupted. But that shouldn't result in corrupted charts,
    and ag-Charts supports the correct rendering of incomplete data:
</p>

<?= chart_example('Line Series with Incomplete Data', 'gap-line', 'generated'); ?>

<p>
    If the <code>yKey</code> value of a data point is positive or negative <code>Infinity</code>,
    <code>null</code>, <code>undefined</code> or <code>NaN</code>, that data point will be rendered as a gap.
    The same is true for the <code>xKey</code>, if the bottom axis is also continuous (for example,
    if it's a <code>'number'</code> axis too).
</p>

<h2>Continuous Data</h2>

<p>
    By default, the bottom axis is a <code>'category'</code> axis, but this can be changed if you have continuous
    data that you would like to plot. See the <a href='../javascript-charts-axis'>axes section</a> for more
    information on configuring axes.
</p>

<?= chart_example('Continuous Data: Spiral Curve', 'two-number-axes', 'generated'); ?>

<h2>Time-Series Data</h2>

<p>
    The following example shows how line series can be used to render time-series data, using a <code>'time'</code>
    axis. In this case, we have two ambient temperature sensors that give us two independent data sets,
    with different numbers of readings taken at different times:
</p>

<?= chart_example('Time Data: Temperature Sensors', 'time-line', 'generated'); ?>

<p>
    Because we have two separate data sets, we are using the <code>series.data</code> property
    of each series, rather than the <code>data</code> property of the chart itself:
</p>

<?= createSnippet(<<<SNIPPET
series: [
    {
        data: [
            {
                time: new Date('01 Jan 2020 13:25:30 GMT'),
                sensor: 25
            },
            {
                time: new Date('01 Jan 2020 13:26:30 GMT'),
                sensor: 24
            }
        ],
        ...
    },
    {
        data: [
            {
                time: Date.parse('01 Jan 2020 13:25:00 GMT'),
                sensor: 21
            },
            {
                time: Date.parse('01 Jan 2020 13:26:00 GMT'),
                sensor: 22
            }
        ],
        ...
    }
]
SNIPPET) ?>

<p>
    Notice that even though one data set has dates as <code>Date</code> objects and another
    uses timestamps, it doesn't present a problem and both series render just fine.
</p>

<p>
    The time axis automatically selects an appropriate label format depending on the time
    span of the data, making a best-effort attempt to prevent the labels from overlapping.
</p>

<h2>Real-Time Data</h2>

<p>
    The chart will update whenever new data is supplied via
    the chart's or series' <code>data</code> property.
</p>

<?= chart_example('Real-Time Chart: Core Voltage', 'real-time', 'generated'); ?>

<p>
    This example uses the <code>'time'</code> axis which is configured to show a tick
    every 5 seconds and to use the <code>%H:%M:%S</code> label format to show colon separated
    hours, minutes and seconds.
</p>

<h2>API Reference</h2>

<?php createDocumentationFromFile("../javascript-charts-api-explorer/config.json", "lineSeriesConfig") ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-charts-bar-series/">bar and column series</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
