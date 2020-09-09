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
    Please see the <a href="#reference-axis.title">API reference</a>
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
    can be configured as explained in the <a href="#reference-axis.tick">API reference</a>
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

<h3>Time Label Format String</h3>

<p>
    For time axes, a format string can be provided, which will be used to format the data for display as axis labels.

    The format string may contain the following directives, which reflect those from Python's <a href="https://strftime.org/" target="_blank">strftime</a>:
</p>

<ul class="content">
    <li><code>%a</code> - abbreviated weekday name.*</li>
    <li><code>%A</code> - full weekday name.*</li>
    <li><code>%b</code> - abbreviated month name.*</li>
    <li><code>%B</code> - full month name.*</li>
    <li><code>%c</code> - the locale’s date and time, such as <code>%x</code>, <code>%X</code>.*</li>
    <li><code>%d</code> - zero-padded day of the month as a decimal number <code>[01,31]</code>.</li>
    <li><code>%e</code> - space-padded day of the month as a decimal number <code>[ 1,31]</code>; equivalent to <code>%_d</code>.</li>
    <li><code>%f</code> - microseconds as a decimal number <code>[000000,999999]</code>.</li>
    <li><code>%H</code> - hour (24-hour clock) as a decimal number <code>[00,23]</code>.</li>
    <li><code>%I</code> - hour (12-hour clock) as a decimal number <code>[01,12]</code>.</li>
    <li><code>%j</code> - day of the year as a decimal number <code>[001,366]</code>.</li>
    <li><code>%m</code> - month as a decimal number <code>[01,12]</code>.</li>
    <li><code>%M</code> - minute as a decimal number <code>[00,59]</code>.</li>
    <li><code>%L</code> - milliseconds as a decimal number <code>[000,999]</code>.</li>
    <li><code>%p</code> - either AM or PM.*</li>
    <li><code>%Q</code> - milliseconds since UNIX epoch.</li>
    <li><code>%s</code> - seconds since UNIX epoch.</li>
    <li><code>%S</code> - second as a decimal number <code>[00,61]</code>.</li>
    <li><code>%u</code> - Monday-based (ISO) weekday as a decimal number <code>[1,7]</code>.</li>
    <li><code>%U</code> - Sunday-based week of the year as a decimal number <code>[00,53]</code>.</li>
    <li><code>%V</code> - ISO 8601 week number of the year as a decimal number <code>[01, 53]</code>.</li>
    <li><code>%w</code> - Sunday-based weekday as a decimal number <code>[0,6]</code>.</li>
    <li><code>%W</code> - Monday-based week of the year as a decimal number <code>[00,53]</code>.</li>
    <li><code>%x</code> - the locale’s date, such as <code>%-m/%-d/%Y</code>.*</li>
    <li><code>%X</code> - the locale’s time, such as <code>%-I:%M:%S %p</code>.*</li>
    <li><code>%y</code> - year without century as a decimal number <code>[00,99]</code>.</li>
    <li><code>%Y</code> - year with century as a decimal number.</li>
    <li><code>%Z</code> - time zone offset, such as <code>-0700</code>, <code>-07:00</code>, <code>-07</code>, or <code>Z</code>.</li>
    <li><code>%%</code> - a literal percent sign (%).</li>
</ul>

<p>
    Directives marked with an asterisk (*) may be affected by the locale definition.
</p>

<p>
    For <code>%U</code>, all days in a new year preceding the first Sunday are considered to be in week 0.<br />
    For <code>%W</code>, all days in a new year preceding the first Monday are considered to be in week 0.<br />
</p>

<p>For <code>%V</code>, per the strftime man page:<br /><br />

    In this system, weeks start on a Monday, and are numbered from 01, for the first week, up to 52 or 53, for the last week.
    Week 1 is the first week where four or more days fall within the new year (or, synonymously,
    week 01 is: the first week of the year that contains a Thursday; or, the week that has 4 January in it).
</p>

<p>The <code>%</code> sign indicating a directive may be immediately followed by a padding modifier:

    <ol>
        <li><code>0</code> - zero-padding</li>
        <li><code>_</code> - space-padding</li>
        <li>(nothing) - disable padding</li>
    </ol>

    If no padding modifier is specified, the default is <code>0</code> for all directives except <code>%e</code>, which defaults to <code>_</code>.
</p>

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

<?php createDocumentationFromFile('../javascript-charts-api-explorer/config.json', 'axis', [], ['showSnippets' => true]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
