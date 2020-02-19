<?php
$pageTitle = "Charts - Line Series";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Area Series</h1>

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

<snippet language="ts">
series: [{
    // type: 'line' <-- assumed
    xKey: 'year',
    yKey: 'spending'
}]
</snippet>

<?= chart_example('Single Line Series', 'basic-line'); ?>

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

<h2>Legend and Tooltip information</h2>

<p>
    By default the legend shows the actual name of the key used to fetch the series data,
    and that name may not be very presentable. In our case, the <code>gas</code> and <code>diesel</code> keys
    inside the data objects are not capitalized. We can provide a more descriptive and presentable name
    to the <code>yName</code> config, and the legend will show that name instead.
</p>

<snippet language="ts">
series: [{
    xKey: 'quarter',
    yKey: 'gas',
    yName: 'Gas'
}, {
    xKey: 'quarter',
    yKey: 'diesel',
    yName: 'Diesel'
}]
</snippet>

<?= chart_example('Legend and Tooltip information', 'legend-info'); ?>

<p>
    The provided <code>yName</code> will also show up in tooltip titles:
</p>

<p style="text-align: center;">
    <img alt="Tooltip with no title" src="no-title-tooltip.png" style="margin-bottom: 0px; height: 123px;">
    <span style="width: 50px; display: inline-block;">--></span>
    <img alt="Tooltip with title" src="title-tooltip.png" style="margin-bottom: 0px; height: 158px;">
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
    fill: 'gray',
    stroke: 'black'
}
</snippet>

<p>
    we'll get a result like this:
</p>

<?= chart_example('Line and Marker Colors', 'line-marker-colors'); ?>

<h2>Missing Data</h2>

<p>
    In a perfect world all data would be 100% complete. Unfortunatelly, in the real one, data for certain
    items or time periods might be missing or corrupted. But that shouldn't result in corrupted charts,
    and ag-Charts support correct rendering of incomplete data:
</p>

<?= chart_example('Line Series with Incomplete Data', 'gap-line'); ?>

<p>
    If the <code>yKey</code> value of a data point is positive or negative <code>Infinity</code>,
    <code>null</code>, <code>undefined</code> or <code>NaN</code>, that data point will be rendered as a gap.
    The same is true for the <code>xKey</code>, if the bottom axis is also continuous (for example,
    if it's a <code>'number'</code> axis too).
</p>

<h2>Continuous Data</h2>

<?= chart_example('Continuous Data - Spiral Curve', 'two-number-axes'); ?>

<h2>Time-Series Data</h2>

<p>
    The following example shows how line series can be used to render time-series data.
    In this case, we have two ambient temperature sensors that give us two independent data sets
    with different number of readings taken at different intervals and irregular intervals at that:
</p>

<?= chart_example('Time Data - Temperature Sensors', 'time-line'); ?>

<p>
    Because we want to use a non-standard axis configuration (<code>'time'</code> axis on the bottom rather
    than the <code>'category'</code> axis and temperature units for the <code>'number'</code> axis),
    we have to be explicit about the <code>axes</code> config we want to use:
</p>

<snippet language="ts">
axes: [{
    type: 'time',
    position: 'bottom',
}, {
    type: 'number',
    position: 'left',
    label: {
        formatter: function (params) {
            return params.value + ' C°';
        }
    }
}]
</snippet>

<p>
    Because we have two separate data sets, we are using the <code>series.data</code> property
    of each series, rather than the <code>data</code> property of the chart itself:
</p>

<snippet language="ts">
series: [{
    data: [{
        time: new Date('01 Jan 2020 13:25:30 GMT'),
        sensor: 25
    }, {
        time: new Date('01 Jan 2020 13:26:30 GMT'),
        sensor: 24
    }],
    ...
}, {
    data: [{
        time: Date.parse('01 Jan 2020 13:25:00 GMT'),
        sensor: 21
    }, {
        time: Date.parse('01 Jan 2020 13:26:00 GMT'),
        sensor: 22
    }],
    ...
}]
</snippet>

<p>
    Notice that even though one data set has dates as <code>Date</code> objects and another
    uses timestamps, it doesn't present a problem and both series render just fine.
</p>

<p>
    The time axis automatically selects an appropriate label format depending on the time
    span of the data to prevent the labels from overlapping. Though please keep in mind
    that the axis can only do so much, and if you have a really small chart, the labels
    might still overlap.
</p>

<h2>Real-Time Data</h2>

<p>
    To create a real-time chart the only thing one should do is to periodically update
    the chart's or series' <code>data</code> property. In the example below we treat
    the <code>data</code> array as a queue. Every second we remove the first element
    from the start of the queue and add a new element to the end of the queue.
</p>

<?= chart_example('Real-Time Chart - Core Voltage', 'real-time'); ?>

<p>
    This example uses the <code>'time'</code> axis which is configured to show a tick
    every 5 seconds and to use the <code>%H:%M:%S</code> label format to show colon separated
    hours, minutes and seconds.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
