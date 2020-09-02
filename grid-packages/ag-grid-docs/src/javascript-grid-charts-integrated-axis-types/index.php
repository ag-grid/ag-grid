<?php
$pageTitle = "Charts: Cartesian Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Chart Axis Types</h1>

<p class="lead">
    Charts can use different types of axes to present data in different ways.
</p>

<p>
    The grid will select best-guess defaults based on the type of chart,
    the <a href="../javascript-grid-charts-integrated-range-chart/#coldef-chartdatatype">column chart data types</a>,
    and the data being plotted. If required, you can override the default axis types for line and scatter/bubble charts
    by setting the <code>type</code> on the relevant axis.
</p>

<note>
    Changing the default axis types can result in nonsensical or broken charts - please use with caution!
</note>

<p>There are three types of axis available: <code>'category'</code>, <code>'number'</code> and <code>'time'</code>.</p>

<h2>Category</h2>

This is a discrete axis used for showing data based on a collection of categories. It is used automatically for <code>'category'</code>
columns. If no category column is selected and this axis is used, default category names will be created using an ascending numeric sequence.

<h2>Number</h2>

This is a continuous axis used for plotting numerical values. It is used automatically for <code>'series'</code> columns that contain
<code>number</code> values.

<h2>Time</h2>

This is a continuous axis used for plotting date/time values. It is used automatically in line and scatter/bubble charts for columns that contain
<code>Date</code> values. Use of this type of axis allows the creation of time series charts.

<h3>Format String</h3>

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

<h3>Example: Time Series Chart</h3>

<p>
    This example shows how a time series chart can be created. It demonstrates explicitly setting the axis type to <code>'time'</code>,
    but you can also remove this and the chart will still use the time axis as it automatically detects the axis type from the data in the
    Date column.
</p>

<?= grid_example('Time Series', 'time-series', 'generated', ['enterprise' => true]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
