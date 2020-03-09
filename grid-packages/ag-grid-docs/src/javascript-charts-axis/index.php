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
    axes to plot the data &mdash; a horizontal axis to determine the <code>x</code> position of a point and
    a vertical axis to determine the <code>y</code> position. Axes also show ticks, labels and grid lines to help the
    user navigate a chart.
</p>

<p>
    The charting library supports three axis types:
    <ul>
        <li><a href="#category-axis">Category</a></li>
        <li><a href="#number-axis">Number</a></li>
        <li><a href="#time-axis">Time</a></li>
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

<h2>Category Axis</h2>

<p>
    The category axis is meant to be used with relatively small datasets of discrete values or categories, such as
    sales per product, person or quarter, where <em>product</em>, <em>person</em> and <em>quarter</em> are categories.
</p>

<p>
    The category axis renders a <a href="#ticks">tick</a>, a <a href="#labels">label</a>
    and a <a href="#grid-lines">grid line</a> for each category, and spaces out all ticks evenly.
</p>

<p>
    The category axis is used as the x-axis by default, positioned at the bottom of a chart.
</p>

<p>The simplest category axis config looks like this:</p>

<?= createSnippet(<<<SNIPPET
{
    type: 'category',
    position: 'bottom'
}
SNIPPET
) ?>

<h2>Number Axis</h2>

<p>
    The number axis is meant to be used as a value axis. While categories are spaced out evenly, the distance between
    values depends on their magnitude.
</p>

<p>
    Instead of using one tick per value, the number axis will determine the range of all values, round it up and try to
    segment the rounded range with 10 evenly spaced ticks (unless you configure it differently).
</p>

<p>
    The number axis is used as the y-axis by default, positioned to the left a chart.
</p>

<p>Here's the simplest number axis config:</p>

<?= createSnippet(<<<SNIPPET
{
    type: 'number',
    position: 'left'
}
SNIPPET
) ?>

<h2>Time Axis</h2>

<p>
    The time axis is similar to the number axis in the sense that it is also used to plot continuous values. The time
    axis can even be used with numeric data (in addition to <code>Date</code> objects), but the numbers will be
    interpreted as Unix timestamps. The time axis differs from the number axis in tick segmentation and label formatting.
    For example, you could choose to place a tick every 5 minutes, every month, or every Friday.
</p>

<p>
    The time axis also supports specifier strings to control the way time values are presented as labels. For example,
    the <code>%H:%M:%S</code> specifier string will instruct the axis to format a time value like
    <code>new&nbsp;Date('Tue&nbsp;Feb&nbsp;04&nbsp;2020&nbsp;15:08:03')</code> or <code>1580828883000</code>
    as <code>'15:08:03'</code>. Time axes are typically used as x-axes and placed at the bottom
    of a chart. The simplest time axis config looks like this:
</p>

<?= createSnippet(<<<SNIPPET
{
    type: 'time',
    position: 'bottom'
}
SNIPPET
) ?>

<h2>Title</h2>

<p>
    Sometimes it may not be obvious what a chart's dimension represents. For example, you might see
    numbers on a chart's axis and not be able to tell if they're millimetres, percentages, dollars, or something else!
    It can also be helpful to provide extra information. For example, category axis labels can clearly show people's
    names, but it might be worth knowing that they are a company's best performing sales people.
</p>

<p>
    Luckily, an axis can have a title just like a chart. In the example below we can use axis titles
    to point out that:
    <ul>
        <li>the horizontal dimension shows desktop operating systems</li>
        <li>the vertical dimension shows their percentage market share</li>
    </ul>
</p>

<p>
    Please see the <a href="#axisConfig.axisConfig.title">API reference</a>
    for axis title styling options like font and colour.
</p>

<h3>Example: Axis Title</h3>

<?= chart_example('Axis Title', 'axis-title', 'generated'); ?>

<h2>Ticks</h2>

<p>
    Category axes show a tick for every category. Number and time axes try to segment the whole range into a certain
    number of intervals (10 by default, giving 11 ticks in total).
</p>

<p>
    The <code>width</code>, <code>size</code> and <code>color</code> of chart axis ticks
    can be configured as explained in the <a href="#axisConfig.axisConfig.tick">API reference</a>
    below. These configs apply to all axis types.
</p>

<p>
    With number and time axes you can additionally set the <code>count</code> property:
    <ul>
        <li>
            In number axes the <code>count</code> means the desired number of ticks for the axis to use.
            Note that this value only serves as a hint and doesn't guarantee that this number of
            ticks is going to be used.
        </li>
        <li>
            In time axes the <code>count</code> property can be set to a time interval,
            for example <code>agCharts.time.month</code>, to make an axis show a tick every month.
        </li>
    </ul>
</p>

<p>
    The example below demonstrates how the <code>count</code> property of the number axis
    can be used to reduce or increase the amount of ticks.
</p>

<h3>Example: Axis Ticks</h3>

<?= chart_example('Axis Tick Styling', 'axis-tick-count', 'generated'); ?>

<h2>Labels</h2>

<p>
    The axis renders a label next to every tick to show the tick's value. Chart axis labels
    support the same font and colour options as the axis title. Additionally, the distance
    of the labels from the ticks and their rotation can be configured via the <code>padding</code>
    and <code>rotation</code> properties respectively.
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
        <li>the <code>index</code> of the label in the data array</li>
        <li>the number of <code>fractionDigits</code>, if the value is a number</li>
        <li>the default label <code>formatter</code>, if the axis is a time axis</li>
    </ul>
</p>

<h3>Example: Label Formatter</h3>

<p>
    For example, to add <code>'%'</code> units next to number values, you can use the following
    formatter function:
</p>

<?= createSnippet(<<<SNIPPET
formatter: function(params) {
    return params.value + '%';
}
SNIPPET
) ?>


<?= chart_example('Axis Label Formatter', 'axis-label-formatter', 'generated'); ?>

<h3>Example: Time Label Format</h3>

<p>
    The <code>label</code> config of the bottom axis in the example below uses the <code>'%b&nbsp;%Y'</code>
    specifier string for the <code>format</code> property to format dates as the abbreviated
    name of the month followed by the full year.
</p>

<p>
    Notice that the <code>label.format</code> property only affects label formatting but not segmentation.
    The fact that axis labels were configured to show the name of the month and the year
    doesn't mean that the axis will show a tick every month. To ensure that it does, we also
    set the <code>tick.count</code> config to use the <code>agCharts.time.month</code> interval.
</p>

<?= chart_example('Time Axis Label Format', 'time-axis-label-format', 'generated'); ?>

<h2>Grid Lines</h2>

<p>
    Chart axes feature grid lines by default. Grid lines extend from axis ticks on the other side of the axis into the
    series area, so that it's easy to trace a series item such as a marker to a corresponding tick/label.
</p>

<p>Grid lines have the same stroke width as ticks.</p>

<p>
    Grid lines of each axis can be styled individually via the <code>gridStyle</code> config.
    The config takes an array of objects with two properties:
    <ul>
        <li>
            <code>stroke</code>: colour string in hex,
            <a href="https://www.w3.org/TR/css-color-4/#typedef-named-color" target="blank">named</a>,
            rgb, or rgba format.
        </li>
        <li>
            <code>lineDash</code>: an array of numbers that specify distances to alternately
            draw a line and a gap. If the number of elements in the array is odd, the elements
            of the array get copied and concatenated. For example, <code>[5,&nbsp;15,&nbsp;25]</code> will become
            <code>[5,&nbsp;15,&nbsp;25,&nbsp;5,&nbsp;15,&nbsp;25]</code>. If the array is empty, the grid lines will be solid without any dashes.
        </li>
    </ul>
    Each config object in the <code>gridStyle</code> array is alternately applied to the grid lines
    of the axis.
</p>

<h3>Example: Grid Lines</h3>

<?= chart_example('Axis Grid Lines', 'axis-grid-lines', 'generated'); ?>

<h2>API Reference</h2>

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'axisConfig') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
