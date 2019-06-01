<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Customising Doughnut Charts</h1>

    <p class="lead">
        This sections details how to customise doughnut charts in your applications.
    </p>

<h3>Doughnut Chart Option Interfaces</h3>

<p>
    The interfaces for doughnut chart options are shown below:
</p>

<snippet>
interface DoughnutChartOptions {
    // width of chart in pixels
    width?: number,
    // height of chart in pixels
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

        // The font to be used by the legend's labels. Defaults to `12px Verdana, sans-serif`.
        // Should use the same format as the shorthand `font` property in CSS.
        labelFont?: string;
        // The color to be used by the legend's labels. Default depends on ag-Grid theme used
        labelColor?: string;
    };

    seriesDefaults?: {

        // The fill colors of pie slices.
        fills?: string[];
        // The stroke colors of pie slices. Darker versions of fill colors by default.
        strokes?: string[];
        // Whether to show the tooltip for bars when they are hovered/tapped. Defaults to `false`.
        tooltipEnabled?: boolean;

        // Whether to show pie slice labels or not.
        labelEnabled?: boolean;
        // If the pie slice angle is smaller than this value (in degrees), the label won't be shown.
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

        // Whether to show series title or not. Defaults to `false`.
        titleEnabled?: boolean;
        // The font to be used by the series title.
        titleFont?: string;

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

        // A custom tooltip render to use for bar tooltips. Should return a valid HTML string.
        tooltipRenderer?: (params: DoughnutTooltipRendererParams) => string;
    };
}

interface DoughnutTooltipRendererParams {
    // The datum object (an element in the `data` array used by the chart/series).
    datum: any;
    // The field of the datum object that contains the category name of the highlighted slice.
    angleField: string;
    // The field of the datum object that contains the label text of the highlighted slice.
    labelField?: string;
}
</snippet>

    <?= example('Custom Doughnut Chart', 'custom-doughnut-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
