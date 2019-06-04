<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Customising Bar Charts</h1>

    <p class="lead">
        This sections details how to customise bar charts in your applications.
    </p>

    <h3>Bar Chart Option Interfaces</h3>

    <p>
        The interfaces for bar chart options are shown below:
    </p>

    <snippet>
interface BarChartOptions {
    // The chart title to render at the top of the chart.
    title?: CaptionOptions;
    // The subtitle to render under the chart's title.
    // If the title is not not specified or disabled, the subtitle won't be visible either.
    subtitle?: CaptionOptions;
    // The width of the chart.
    width?: number,
    // The height of the chart.
    height?: number;

    // The padding of contents from the edges of the chart.
    padding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };

    // Additional CSS class to be added to the tooltip element.
    tooltipClass?: string;

    // The side of the chart to dock the legend to.
    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    // The amount of padding between the legend and the series.
    legendPadding?: number;

    legend?: {
        // The stroke width of a legend marker. Defaults to `1`.
        markerStrokeWidth?: number;
        // The size of a legend marker. Defaults to `14`.
        markerSize?: number;
        // The padding between a legend marker and its label. Defaults to `4`.
        markerPadding?: number;
        // The amount of horizontal padding between legend items. Defaults to `16`.
        itemPaddingX?: number;
        // The amount of vertical padding between legend items. Defaults to `8`.
        itemPaddingY?: number;
        // The font to be used by the legend's labels, in the CSS `font` property format.
        // Defaults to `12px Verdana, sans-serif`.
        labelFont?: string;
        // The color to be used by the legend's labels. Default depends on ag-Grid theme used
        labelColor?: string;
    };

    // The horizontal chart axis.
    xAxis: AxisOptions;
    // The vertical chart axis.
    yAxis: AxisOptions;

    seriesDefaults?: {
        // The fill colors to be used by the series.
        fills?: string[];
        // The stroke colors to be used by the series.
        strokes?: string[];
        // The stroke width. Defaults to `1`.
        strokeWidth?: number;

        // Whether to show the labels for bars (only applies to the stacked bars).
        labelEnabled?: boolean;
        // The font to be used by the bar labels. Defaults to `12px Verdana, sans-serif`.
        labelFont?: string;
        // The color to be used by the bar labels.
        // Depends on whether the light or dark mode is used.
        labelColor?: string;
        // The vertical and horizontal padding of the labels within bars (from the top
        // and the sides of a bar). The labels will only show if they are small enough
        // to fit inside a bar with the given amount of padding.
        // Defaults to `{x: 10, y: 10}`.
        labelPadding?: {x: number, y: number};

        // The shadow type to use for bars. Defaults to no shadow.
        // Note: shadows can noticeably slow down rendering of charts with a few hundred bars.
        shadow?: {
            // The shadow color. For example, 'rgba(0, 0, 0, 0.3)'.
            color?: string;
            // The shadow offset.
            offset?: [number, number];
            // The blur amount to apply.
            blur?: number;
        };

        // Whether to show the tooltip for bars when they are hovered/tapped.
        // Defaults to `true`.
        tooltipEnabled?: boolean;
        // A custom tooltip render to use for bar tooltips. Should return a valid HTML string.
        tooltipRenderer?: (params: BarTooltipRendererParams) => string;
    };
}

interface CaptionOptions {
    // The text to use for the chart's title/subtitle.
    text?: string;
    // The font to be used by the title/subtitle.
    // Defaults to `bold 16px Verdana, sans-serif` for the title
    // and '12px Verdana, sans-serif' for the subtitle.
    font?: string;
    // The color of the title/subtitle's text. Defaults to `black`.
    color?: string;
    // Whether to show the title/subtitle or not. Defaults to `true`.
    enabled?: boolean;
}

interface BarTooltipRendererParams {
    // The datum object (an element in the `data` array used by the chart/series).
    datum: any;
    // The field of the datum object that contains the category name of the highlighted bar.
    xField: string;
    // The field of the datum object that contains the series value of the highlighted bar.
    yField: string;
}

interface AxisOptions {
    // The thickness of the axis line. Defaults to `1`.
    lineWidth?: number;
    // The color of the axis line. Depends on whether the light or dark mode is used.
    lineColor?: string;

    // The thickness of the ticks. Defaults to `1`.
    tickWidth?: number;
    // The length of the ticks. Defaults to `6`.
    tickSize?: number;
    // The padding between the ticks and the labels. Defaults to `5`.
    tickPadding?: number;
    // The color of the axis ticks. Depends on whether the light or dark mode is used.
    tickColor?: string;

    // The font to be used by axis labels. Defaults to `12px Verdana, sans-serif`.
    labelFont?: string;
    // The color of the axis labels. Depends on whether the light or dark mode is used.
    labelColor?: string;
        // The rotation of the axis labels. Defaults to `45` (degrees), however when no category
        // is present the default category, i.e. (none), is used with the value  `0`.
    labelRotation?: number;
    // The custom formatter function for the axis labels.
    // The value is either a category name or a number. If it's the latter, the number
    // of fractional digits used by the axis step will be provided as well.
    // The returned string will be used as a label.
    labelFormatter?: (value: any, fractionDigits?: number) => string;
    // The styles of the grid lines. These are repeated. If only a single style is provided,
    // it will be used for all grid lines, if two styles are provided, every style will be
    // used by every other line, and so on.
    gridStyle?: IGridStyle[];
}

interface IGridStyle {
    // The stroke color of a grid line. Depends on whether the light or dark mode is used.
    stroke?: string;
    // The line dash array. Every number in the array specifies the length of alternating
    // dashes and gaps. For example, [6, 3] means dash of length 6 and gap of length 3.
    // Defaults to `[4, 2]`.
    lineDash?: number[];
}
</snippet>

The example below changes all available styling options. The styling options are exaggerated to demonstrate the option rather than produce a chart that looks nice.

    <?= example('Custom Bar Chart', 'custom-bar-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
