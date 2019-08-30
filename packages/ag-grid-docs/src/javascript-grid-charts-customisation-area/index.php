<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Customising Area Charts</h1>

    <p class="lead">
        This sections details how to customise area charts in your applications.
    </p>

    <h3>Area Chart Option Interfaces</h3>

    <p>
        The interfaces for area chart options are shown below:
    </p>

    <snippet>
interface AreaChartOptions {
    // The chart title to render at the top of the chart.
    title?: CaptionOptions;
    // The subtitle to render under the chart's title.
    // If the title is not specified or is disabled, the subtitle won't be visible either.
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
        // Whether to show the legend or not.
        enabled?: boolean;
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
        // The font style to be used by legend's labels. For example, 'italic'.
        // Not used by default.
        labelFontStyle?: string;
        // The font weight to be used by legend's labels. For example, 'bold'.
        // Not used by default.
        labelFontWeight?: string;
        // The font size to be used by legend's labels. Defaults to `12`.
        labelFontSize?: number;
        // The font family to be used by legend's labels. Defaults to `Verdana, sans-serif`.
        labelFontFamily?: string;
        // The colour to be used by the legend's labels. Default depends on ag-Grid theme used
        labelColor?: string;
    };

    // The horizontal chart axis.
    xAxis: AxisOptions;
    // The vertical chart axis.
    yAxis: AxisOptions;

    seriesDefaults?: {
        // The fill colours to be used by the series.
        fills?: string[];
        // The stroke colours to be used by the series.
        strokes?: string[];
        // The opacity of all fills. Valid range if from 0 to 1.
        // Defaults to 1 (completely opaque).
        fillOpacity?: number;
        // The opacity of all strokes. Valid range if from 0 to 1.
        // Defaults to 1 (completely opaque).
        strokeOpacity?: number;
        // The stroke width. Defaults to `3`.
        strokeWidth?: number;
        // The style to apply to a series item when it is hovered or tapped.
        highlightStyle?: HighlightStyle;

        // Whether to show area series markers at each data point or not. Defaults to `true`.
        // Note: tooltips won't show without markers.
        marker?: boolean;
        // The size of the marker. Defaults to `6`.
        markerSize?: number;
        // The stroke width of the marker. Defaults to `1`.
        markerStrokeWidth?: number;

        // The shadow type to use for areas. Defaults to no shadow.
        shadow?: {
            // The shadow colour. For example, 'rgba(0, 0, 0, 0.3)'.
            color?: string;
            // The shadow offset.
            offset?: [number, number];
            // The blur amount to apply.
            blur?: number;
        };

        // Whether to show the tooltip for area markers when they are hovered/tapped.
        // Defaults to `true`.
        tooltipEnabled?: boolean;
        // A custom render to use for tooltips. Should return a valid HTML string.
        tooltipRenderer?: (params: AreaTooltipRendererParams) => string;
    };
}

interface HighlightStyle {
    fill?: string;
    stroke?: string;
}

interface CaptionOptions {
    // The text to use for the chart's title/subtitle.
    text?: string;
    // The font style to be used by the title/subtitle. Not used by default.
    fontStyle?: string;
    // The font weight to be used by the title/subtitle.
    // Defaults to `bold` for the title, and `undefined` for the subtitle.
    fontWeight?: string;
    // The font size to be used by the title/subtitle.
    // Defaults to `16` for the title and `12` for the subtitle.
    fontSize?: number;
    // The font family to be used by the title/subtitle.
    // Defaults to `Verdana, sans-serif` for both.
    fontFamily?: string;
    // The colour of the title/subtitle's text. Defaults to `black`.
    color?: string;
    // Whether to show the title/subtitle or not. Defaults to `true`.
    enabled?: boolean;
}

interface AreaTooltipRendererParams {
    // The datum object (an element in the `data` array used by the chart/series).
    datum: any;
    // The field of the datum object that contains the category name
    // of the highlighted data point.
    xField: string;
    // The field of the datum object that contains the series value of the highlighted data point.
    yField: string;
}

interface AxisOptions {
    // The title of the axis.
    title?: CaptionOptions;
    // The thickness of the axis line. Defaults to `1`.
    lineWidth?: number;
    // The colour of the axis line. Depends on whether the light or dark mode is used.
    lineColor?: string;

    // The thickness of the ticks. Defaults to `1`.
    tickWidth?: number;
    // The length of the ticks. Defaults to `6`.
    tickSize?: number;
    // The padding between the ticks and the labels. Defaults to `5`.
    tickPadding?: number;
    // The colour of the axis ticks. Depends on whether the light or dark mode is used.
    tickColor?: string;

    // The font style to be used by axis labels. For example, 'italic'. Not used by default.
    labelFontStyle?: string;
    // The font weight to be used by axis labels. For example, 'bold'. Not used by default.
    labelFontWeight?: string;
    // The font size to be used by axis labels. Defaults to `12`.
    labelFontSize?: number;
    // The font family to be used by axis labels. Defaults to `Verdana, sans-serif`.
    labelFontFamily?: string;
    // The colour of the axis labels. Depends on whether the light or dark mode is used.
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
    // The stroke colour of a grid line. Depends on whether the light or dark mode is used.
    stroke?: string;
    // The line dash array. Every number in the array specifies the length of alternating
    // dashes and gaps. For example, [6, 3] means dash of length 6 and gap of length 3.
    // Defaults to `[4, 2]`.
    lineDash?: number[];
}
</snippet>

The example below changes all available styling options. The styling options are exaggerated to demonstrate the option rather than produce a chart that looks nice.

    <?= example('Custom Area Chart', 'custom-area-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
