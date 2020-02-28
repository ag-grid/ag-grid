<?php
$pageTitle = "Chart Axes";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Axes</h1>

<p class="lead">
    This section explains what chart axes are, how to configure and style them, and which axis type to use
    in which situation.
</p>

<p>
    A chart uses axes to plot data such as categories and values by converting them to screen coordinates.
    Since any point on the screen is an <code>(x, y)</code> pair of coordinates, a chart needs two orthogonal
    axes to plot the data &mdash; one horizontal axis to determine the <code>x</code> position of a point and
    a vertical axis to determine the <code>y</code> position.
    Axes also show ticks, labels and grid lines to help the user navigate a chart.
</p>

<p>
    The charting library supports three axis types:
    <ul>
        <li><a href="#category-axis">Category Axis</a></li>
        <li><a href="#number-axis">Number Axis</a></li>
        <li><a href="#time-axis">Time Axis</a></li>
    </ul>
    Each type is tailored to be used with certain types of data.
    An axis can be positioned to any side of a chart &mdash; <code>'top'</code>, <code>'right'</code>,
    <code>'bottom'</code>, or <code>'left'</code>. Just like with series, the axes can be specified
    by setting the corresponding <code>axes</code> array property of a chart.
</p>

<note>
    Axes are only supported in <a href="https://en.wikipedia.org/wiki/Cartesian_coordinate_system" target="blank">cartesian</a> charts,
    not <a href="https://en.wikipedia.org/wiki/Polar_coordinate_system" target="blank">polar</a>.
    For example, you can't use axes with pie series.
</note>

<h3>Category Axis</h3>

<p>
    The category axis is meant to be used with relatively small data sets
    of discrete values or categories, such as sales per product, person or quarter,
    where <em>product</em>, <em>person</em> and <em>quarter</em> are categories.
</p>

<p>
    The category axix renders a <a href="#ticks">tick</a>, a <a href="#labels">label</a>
    and a <a href="#grid-lines">grid line</a> for each category, and spaces out all ticks evenly.
</p>

<p>
    The category axis is commonly used as the x-axis, and positioned at the bottom of a chart.
</p>

<p>The simplest category axis config looks like this:</p>

<snippet language="ts">
{
    type: 'category',
    position: 'bottom'
}
</snippet>

<h3>Number Axis</h3>

<p>
    The number axis is meant to be used as a value axis. While categories
    are spaced out evenly, the distance between values depends on their magnitude.
</p>
<p>
    Intead of using one tick per value, the number axis will determine the range of all
    values, round it up and try to segment the rounded range with 10 evenly spaced ticks.
</p>
<p>
    The number axis is commonly used as the y-axis and positioned to the
    left a chart. Here's the simplest number axis config:
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
    to place a tick every 5 minutes, every month or every Friday for example.
</p>

<p>
    Time axis also supports specifier strings to control the way time values are presented as labels.
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

<h2>Title</h2>

<p>
    Sometimes it may not be obvious what a chart's dimension represents. For example, you can see the
    numbers on a chart's axis and not being able to tell what they are. Are they millimeters, percentages
    or dollars? And sometimes it's helpful to provide extra information. For example, category axis
    labels can clearly show people's names, but it might be worth knowing that they are some company's
    best performing sales people.
</p>

<p>
    Luckily, an axis can have a title just like a chart. In the example below we can use axes titles
    to point out that:
    <ul>
        <li>the horizontal dimension shows desktop operating systems</li>
        <li>the vertical dimension shows their percentage market share</li>
    </ul>
</p>

<p>
    Please see the <a href="#axisConfig.axisConfig.title">API reference</a>
    for axis title styling options like font and color.
</p>

<h3>Example - Axis Title</h3>

<?= chart_example('Axis Title', 'axis-title', 'generated'); ?>

<h2>Ticks</h2>

<h2>Labels</h2>

<p>
    The axis renders a label next to every tick to show the tick's value. Chart axis labels
    support the same font and color options as the axis title. Additionally, the distance
    of the labels from the ticks and their rotation can be configured via the <code>padding</code>
    and <code>rotation</code> axis properties, respectively.
</p>

<p>
    A label formatter function can be used to change the value displayed in the label.
    It's a handy feature when you need to show units next to values or format number
    values to a certain precision, for example.
</p>

<p>
    A label formatter function receives a single <code>params</code> object which contains:
    <ul>
        <li>the raw <code>value</code> of the label (without the default formatting applied)</li>
        <li>the <code>index</code> of the label</li>
        <li>the number of <code>fractionDigits</code>, if the value is a number</li>
        <li>the default label <code>formatter</code>, if the axis is a time axis</li>
    </ul>
</p>

<p>
    For example, to add <code>'%'</code> units to next number values, one can use the following
    formatter function:
</p>

<snippet language="ts">
formatter: function (params) {
    return params.value + '%';
}
</snippet>

<p>
    The use of the formatter function in the snippet above is demonstrated in the example below:
</p>

<h3>Example - Label Formatter</h3>

<?= chart_example('Axis Label Formatter', 'axis-label-formatter', 'generated'); ?>

<h3>Example - Time Label Format</h3>

<?= chart_example('Axis Label Formatter', 'time-axis-label-format', 'generated'); ?>

<h2>Grid Lines</h2>

<p>
    Chart axes can and do feature grid lines by default. Grid lines extend from axis
    ticks on the other side of the axis into the series area, so that it's easy to trace
    a series item such as a marker to a corresponding tick/label using a grid line.
</p>

<p>Grid lines have the same stroke width as ticks.</p>

<p>
    Grid lines of each axis can be styled individually via the <code>gridStyle</code> config.
    The config takes are array of objects with two properties:
    <ul>
        <li>
            <code>stroke</code> - color string in hex,
            <a href="https://www.w3.org/TR/css-color-4/#typedef-named-color" target="blank">named</a>,
            rgb, or rgba color format.
        </li>
        <li>
            <code>lineDash</code> - an array of numbers that specify distances to alternately
            draw a line and a gap. If the number of elements in the array is odd, the elements
            of the array get copied and concatenated. For example, [5, 15, 25] will become
            [5, 15, 25, 5, 15, 25]. If the array is empty, the line dash list is cleared and
            line strokes return to being solid.
        </li>
    </ul>
    Each config object in the <code>gridStyle</code> array is alternately applied to the grid lines
    of the axis.
</p>

<h3>Example - Grid Lines</h3>

<?= chart_example('Axis Grid Lines', 'axis-grid-lines', 'generated'); ?>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'axisConfig') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
