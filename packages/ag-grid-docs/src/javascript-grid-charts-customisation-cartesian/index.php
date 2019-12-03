<?php
$pageTitle = "Charts: Cartesian Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Cartesian Chart Customisation</h1>

<p class="lead">
    In addition to the <a href="../javascript-grid-charts-customisation-general">general chart customisations</a>, you can also
    use these customisations for cartesian charts, which have an x- and y-axis.
</p>

<h2>Option Interfaces</h2>

<snippet>
interface CartesianChartOptions {
    xAxis: AxisOptions;
    yAxis: AxisOptions;
}

interface AxisOptions {
    // Allows the type of the axis to be specified. This should be used with caution as it
    // could cause the graph to fail to render if the data is incompatible
    type?: AxisType;
    title: CaptionOptions;
    line: AxisLineOptions;
    tick: AxisTickOptions;
    label: AxisLabelOptions;

    // The styles of the grid lines. These are repeated. If only a single style is provided,
    // it will be used for all grid lines, if two styles are provided, every style will be
    // used by every other line, and so on.
    gridStyle: GridStyle[];
}

type AxisType = 'category' | 'number' | 'time';

interface CaptionOptions {
    enabled: boolean; // default: false
    text?: string;
    fontStyle: FontStyle; // default: 'normal'
    fontWeight: FontWeight; // default: 'normal'
    fontSize: number; // default: 14
    fontFamily: string; // default: 'Verdana, sans-serif'
    color: string; // default: &lt;dependent on light/dark mode&gt;
}

type FontStyle = 'normal' | 'italic' | 'oblique';

type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

interface AxisLineOptions {
    width: number; // default: 1
    color: string; // default: 'rgba(195, 195, 195, 1)'
}

interface AxisTickOptions {
    width: number; // default: 1
    size: number; // default: 6
    color: string; // default: 'rgba(195, 195, 195, 1)'
}

interface AxisLabelOptions {
    fontStyle: FontStyle; // default: 'normal'
    fontWeight: FontWeight; // default: 'normal'
    fontSize: number; // default: 12
    fontFamily: string; // default: 'Verdana, sans-serif'
    color: string; // default: &lt;dependent on light/dark mode&gt;
    padding: number; // default: 5
    rotation: number; // default: &lt;dependent on chart type. Overridden for default category&gt;

    // For time axes, a format string can be provided, which will be used to format the labels.
    // See below for more information about the format options.
    format?: string;

    // A custom formatter function for the axis labels. If the value is a number, the number of
    // fractional digits used by the axis step will be provided as well.
    formatter?: (value: any, fractionDigits?: number) => string;
}

interface GridStyle {
    stroke: string; // default: &lt;dependent on light/dark mode&gt;

    // The line dash array. Every number in the array specifies the length of alternating
    // dashes and gaps. For example, [6, 3] means dash of length 6 and gap of length 3.
    // If undefined, a solid line will be used.
    lineDash?: number[]; // default: [4, 2]
}
</snippet>

<h3>Format String for Time Axes</h3>

<p>
    For time axes, a format string can be provided, which will be used to format the data for display as axis labels.

    The format string may contain the following directives, which reflect those from Python's <a href="https://strftime.org/" target="_blank">strftime</a>:
</p>

<ul>
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

<h3>Example: Cartesian Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>

<p>It also demonstrates the use of a time axis for line charts, achieved by setting <code>xAxis.type</code> to <code>'time'</code>.</p>

<?= example('Cartesian Chart Customisations', 'custom-cartesian-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
