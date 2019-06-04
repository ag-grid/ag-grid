<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Customising Pie Charts</h1>

    <p class="lead">
        This sections details how to customise pie charts in your applications.
    </p>

<h3>Pie Chart Option Interfaces</h3>

<p>
    The interfaces for pie chart options are shown below:
</p>

<snippet>
interface PieChartOptions {
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

    // Additional CSS class to be added to tooltip element.
    tooltipClass?: string;

    // The side of the chart to dock the legend to.
    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    // The padding amount between the legend and the series.
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



    seriesDefaults?: {
        // The title of this series. Renders on top of the doughnut. Also shown in the tooltip.
        title?: CaptionOptions;

        // The fill colors of pie slices.
        fills?: string[];
        // The stroke colors of pie slices. Darker versions of fill colors by default.
        strokes?: string[];

        // Whether to show pie slice labels or not.
        labelEnabled?: boolean;
        // If the pie slice angle is smaller than this value (in degrees),
        // the label won't be shown.
        labelMinAngle?: number;
        // The font to be used for slice labels.
        labelFont?: string;
        // The color to use for slice labels.
        labelColor?: string;

        // The stroke width. Defaults to `1`.
        strokeWidth?: number;

        // The thickness of a callout line. Defaults to `2`.
        calloutStrokeWidth?: number;
        // The length of a callout line. Defaults to `10`.
        calloutLength?: number;
        // The padding between the callouts and the labels. Defaults to `3`.
        calloutPadding?: number;

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
        tooltipRenderer?: (params: DoughnutTooltipRendererParams) => string;
    };
}

interface CaptionOptions {
    // The text to use for the chart's title/subtitle or series' title.
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

interface PieTooltipRendererParams {
    // The datum object (an element in the `data` array used by the chart/series).
    datum: any;
    // The field of the datum object that contains the category name of the highlighted slice.
    angleField: string;
    // The field of the datum object that contains the label text of the highlighted slice.
    labelField?: string;
}
</snippet>

The example below changes all available styling options. The styling options are exaggerated to demonstrate the option rather than produce a chart that looks nice.

    <?= example('Custom Pie Chart', 'custom-pie-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
