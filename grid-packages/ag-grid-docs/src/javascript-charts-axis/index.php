<?php
$pageTitle = "Chart Axes";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Axes</h1>

<h2>Overview of Axis Types</h2>

<p>
    The charting library supports three axes types: <code>'category'</code>, <code>'number'</code>,
    and <code>'time'</code>. Each type is tailored to be used with certain types of data.
</p>

<h3>Category Axis</h3>

<p>
    The <code>'category'</code> axis is meant to be used with relatively small data sets
    of discrete values or categories, such as sales per product, person or quarter,
    where product, person and quarter are categories. The category axis renders a tick, a label
    and a grid line for each category, and spaces out all ticks evenly. <code>'category'</code> axis
    is commonly used as the x-axis, and positioned at the <code>'bottom'</code> of the chart.
    The simplest config looks like this:
</p>

<snippet language="ts">
{
    type: 'category',
    position: 'bottom'
}
</snippet>

<h3>Number Axis</h3>

<p>
    The <code>'number'</code> axis is meant to be used as a value axis. Unlike categories,
    which are spaced out evenly, the distance between values depends on their magnitude.
    Intead of using one tick per value, the number axis will determine the range of all
    values, round it up and try to segment the rounded range with 10 evenly spaced ticks.
    <code>'number'</code> axis is commonly used as the y-axis and positioned to the
    <code>'left'</code> of the chart. Here's the simplest number axis config:
</p>

<snippet language="ts">
{
    type: 'number',
    position: 'left'
}
</snippet>

<h3>Time Axis</h3>

<p>
    The <code>'time'</code> axis is similar to the <code>'number'</code> axis in the sense
    that it is also used to plot continuous values. The time axis can even be used
    with numeric data (in addition to <code>Date</code> objects), but the numbers will be
    interpreted as Unix timestamps. The <code>'time'</code> axis differs from the
    <code>'number'</code> axis in tick segmentation and label formatting. You can choose
    to place a tick every 5 minutes, every month or every Friday for example. Time axis also
    supports specifier strings to control the way time values are presented as labels.
    For example, the <code>%H:%M:%S</code> specifier string will instruct the axis to
    format a time value like <code>new Date('Tue Feb 04 2020 15:08:03')</code> or <code>1580828883000</code>
    as <code>'15:08:03'</code>. Time axes are typically used as x-axes and placed at the bottom
    of a chart. The simplest time axis config looks like this:
</p>

<snippet language="ts">
{
    type: 'time',
    position: 'bottom'
}
</snippet>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'axisConfig') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
