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

<h3>Example: Cartesian Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>

<p>It also demonstrates the use of a time axis for line charts, achieved by setting <code>xAxis.type</code> to <code>'time'</code>.</p>

<?= example('Cartesian Chart Customisations', 'custom-cartesian-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
