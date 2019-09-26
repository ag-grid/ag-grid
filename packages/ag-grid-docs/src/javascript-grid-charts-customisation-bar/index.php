<?php
$pageTitle = "Charts: Bar/Column Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Bar/Column Chart Customisation</h1>

<p class="lead">
    In addition to the <a href="../javascript-grid-charts-customisation-general">general chart customisations</a>, you can also 
    use these customisations for bar/column charts.
</p>

<h2>Option Interfaces</h2>

<snippet>
interface BarChartOptions {
    xAxis: AxisOptions;
    yAxis: AxisOptions;

    seriesDefaults?: {
        fills?: string[];
        fillOpacity?: number; // valid range from `0` to `1`, defaults to `1` (opaque)
        strokes?: string[];
        strokeOpacity?: number; // valid range from `0` to `1`, defaults to `1` (opaque)
        strokeWidth?: number; // defaults to `1`
        // The style to apply to a series item when it is hovered or tapped
        highlightStyle?: HighlightStyle;

        // The shadow type to use for bars. Defaults to no shadow.
        // Note: shadows can noticeably slow down rendering of charts with a few hundred bars.
        shadow?: {
            color?: string;
            offset?: [ number, number ];
            blur?: number;
        };

        labelEnabled?: boolean;
        labelFontStyle?: FontStyle;
        labelFontWeight?: FontWeight;
        labelFontSize?: number; // defaults to `12`
        labelFontFamily?: string; // defaults to `Verdana, sans-serif`
        labelColor?: string; // depends on whether the light or dark mode is used.
        labelFormatter?: (params: BarLabelFormatterParams) => string;

        // Whether to show the tooltip for bars when they are hovered/tapped
        tooltipEnabled?: boolean; // defaults to `true`
        // A custom tooltip render function. Should return a valid HTML string.
        tooltipRenderer?: (params: BarTooltipRendererParams) => string; 
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

export interface BarLabelFormatterParams {
    value: number;
}

export interface BarTooltipRendererParams {
    // The datum object the tooltip is being rendered for
    datum: any;
    // The field of the datum object that contains the category name of the highlighted bar
    xField: string;
    // The field of the datum object that contains the series value of the highlighted bar
    yField: string;
    // The title of the series the datum is in
    title?: string;
    // The fill colour of the series the datum is in
    color?: string;
}
</snippet>

<h3>Example: Bar/Column Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= example('Bar/Column Chart Customisations', 'custom-bar-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
