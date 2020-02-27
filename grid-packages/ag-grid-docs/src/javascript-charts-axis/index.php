<?php
$pageTitle = "Chart Axes";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Axes</h1>

<h2>Overview</h2>

<p>
    A chart uses axes to plot data such as categories and values by converting them to screen coordinates.
    Since any point on the screen is an <code>(x, y)</code> pair of coordinates, a chart needs two orthogonal
    axes to plot the data &mdash; one horizontal axis to determine the <code>x</code> position of a point and
    a vertical axis to determine the <code>y</code> position.
    Axes also show ticks, labels and grid lines to help the user navigate a chart.
</p>

<p>
    The charting library supports three axes types: <code>'category'</code>, <code>'number'</code>,
    and <code>'time'</code>. Each type is tailored to be used with certain types of data.
    An axis can be positioned to any side of a chart &mdash; <code>'top'</code>, <code>'right'</code>,
    <code>'bottom'</code>, <code>'left'</code> &mdash; but only a single axis can exist at any given
    position, meaning that you can have up to four axes in a chart. Just like with series, the axes
    can be specified by setting the corresponding <code>axes</code> array property of a chart.
</p>

<note>
    Axes are only supported in cartesian charts, not polar. For example, you can't use axes
    with pie series.
</note>

<h3>Category Axis</h3>

<p>
    The <code>'category'</code> axis is meant to be used with relatively small data sets
    of discrete values or categories, such as sales per product, person or quarter,
    where <em>product</em>, <em>person</em> and <em>quarter</em> are categories. The category axis
    renders a tick, a label and a grid line for each category, and spaces out all ticks evenly.
    <code>'category'</code> axis is commonly used as the x-axis, and positioned at the
    <code>'bottom'</code> of the chart. The simplest config looks like this:
</p>

<snippet language="ts">
{
    type: 'category',
    position: 'bottom'
}
</snippet>

<h3>Number Axis</h3>

<p>
    The <code>'number'</code> axis is meant to be used as a value axis. While categories
    are spaced out evenly, the distance between values depends on their magnitude.
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

<h2>Position and Title</h2>

<h2>Tick Format</h2>

<h2>Label Format</h2>

<h2>Grid Lines</h2>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'axisConfig') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
