<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Scatter/Bubble Chart Customisations</h1>

<p class="lead">
    In addition to the <a href="../javascript-grid-charts-customisation-general">general chart customisations</a>, you can also 
    use these customisations for scatter/bubble charts.
</p>

<h2>Option Interfaces</h2>

<snippet>
interface ScatterChartOptions {
    xAxis: AxisOptions;
    yAxis: AxisOptions;

    seriesDefaults?: {
        // The fill colours to be used by the series' markers
        fills?: string[];
        fillOpacity?: number; // defaults to `1` for scatter, `0.7` for bubble
        // The stroke colours to be used by the series' markers
        strokes?: string[];
        // The style to apply to a marker when it is hovered or tapped
        highlightStyle?: HighlightStyle;

        markerSize?: number; // defaults to `6` for scatter, `30` for bubble
        // In bubble charts the marker diameter can be determined by data.
        // This specifies the minimum size a marker can be regardless of the data.
        minMarkerSize: number, // defaults to `3`
        markerStrokeWidth?: number; // defaults to `1`

        // Whether to show the tooltip for markers when they are hovered/tapped
        tooltipEnabled?: boolean; // defaults to `true`
        // A custom tooltip render function. Should return a valid HTML string.
        tooltipRenderer?: (params: ScatterTooltipRendererParams) => string;
    };
}

interface AxisOptions {
    title?: CaptionOptions;
    lineWidth?: number; // defaults to `1`
    lineColor?: string; // depends on whether the light or dark mode is used

    tickWidth?: number; // defaults to `1`
    tickSize?: number; // defaults to `6`
    tickColor?: string; // depends on whether the light or dark mode is used

    labelFontStyle?: FontStyle;
    labelFontWeight?: FontWeight;
    labelFontSize?: number; // defaults to `12`
    labelFontFamily?: string; // defaults to `Verdana, sans-serif`
    labelColor?: string; // depends on whether the light or dark mode is used
    labelPadding?: number; // defaults to `5`

    // The rotation in degrees of the axis labels. Defaults to `45`, unless the default 
    // category (none) is selected, in which case `0` is used.
    labelRotation?: number;
    // The custom formatter function for the axis labels.
    // The value is either a category name or a number. If it's the latter, the number
    // of fractional digits used by the axis step will be provided as well.
    labelFormatter?: (value: any, fractionDigits?: number) => string;

    // The styles of the grid lines. These are repeated. If only a single style is provided,
    // it will be used for all grid lines, if two styles are provided, every style will be
    // used by every other line, and so on.
    gridStyle?: IGridStyle[];
}

interface CaptionOptions {
    enabled?: boolean; // defaults to `true`
    text?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight; // defaults to `bold`
    fontSize?: number; // defaults to `16`
    fontFamily?: string; // defaults to `Verdana, sans-serif`
    color?: string; // defaults to `black`
}

export type FontStyle = 'normal' | 'italic' | 'oblique';

export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;

interface IGridStyle {
    stroke?: string; // depends on whether the light or dark mode is used
    // The line dash array. Every number in the array specifies the length of alternating
    // dashes and gaps. For example, [6, 3] means dash of length 6 and gap of length 3.
    lineDash?: number[]; // defaults to `[4, 2]`
}

interface HighlightStyle {
    fill?: string;
    stroke?: string;
}

interface ScatterTooltipRendererParams {
    // The datum object the tooltip is being rendered for
    datum: any;
    // The field of the datum object that contains the category name of the highlighted data point
    xField: string;
    // The field of the datum object that contains the series value of the highlighted data point
    yField: string;
    // The title of the series the datum is in
    title?: string;
    // The fill colour of the series the datum is in
    color?: string;
}
</snippet>

<h3>Example: Scatter/Bubble Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= example('Scatter/Bubble Chart Customisations', 'custom-scatter-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
