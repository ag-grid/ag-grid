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
    // Container element for the chart.
    parent?: HTMLElement;
    // The width of the chart.
    width?: number;
    // The height of the chart.
    height?: number;
    // The padding of contents from the edges of the chart.
    padding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    // The side of the chart to dock the legend to.
    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    // The padding amount between the legend and the series.
    legendPadding?: number;
    // The CSS class name to be used by the tooltip element.
    tooltipClass?: string;
    legend?: {
        // The line width of a legend marker.
        markerLineWidth?: number;
        // The size of a legend marker.
        markerSize?: number;
        // The padding between a legend marker and its label.
        markerPadding?: number;
        // The amount of horizontal padding between legend items.
        itemPaddingX?: number;
        // The amount of vertical padding between legend items.
        itemPaddingY?: number;
        // The font to be used by the legend's labels.
        // Should use the same format as the shorthand `font` property in CSS.
        labelFont?: string;
        // The color to be used by the legend's labels.
        labelColor?: string;
    };
    seriesDefaults?: {
        // The title of the series. Shown above the series and in (default) tooltips.
        title?: string;
        // Whether to show series title or not. Defaults to `false`.
        titleEnabled?: boolean;
        // The font to be used by the series title.
        titleFont?: string;
        // Whether this series should be represented in the legend. Defaults to `true`.
        showInLegend?: boolean;
        // Whether to show the tooltip for bars when they are hovered/tapped. Defaults to `false`.
        tooltipEnabled?: boolean;
        // Whether to show pie slice labels or not.
        labelEnabled?: boolean;
        // The font to be used for slice labels.
        labelFont?: string;
        // The color to use for slice labels.
        labelColor?: string;
        // If the pie slice angle is smaller than this value (in degrees), the label won't be shown.
        labelMinAngle?: number;
        // The fill colors of pie slices.
        fills?: string[];
        // The stroke colors of pie slices. Darker versions of fill colors by default.
        strokes?: string[];
        // The stroke width. Defaults to `1`.
        strokeWidth?: number;
        // The callout stroke colors. Same as stroke colors by default.
        calloutColors?: string[];
        // The thickness of a callout line. Defaults to 2.
        calloutWidth?: number;
        // The length of a callout line. Defaults to 10.
        calloutLength?: number;
        // The padding between the callouts and the labels. Defaults to 3.
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
        // A custom tooltip render to use for bar tooltips. Should return a valid HTML string.
        tooltipRenderer?: (params: DoughnutTooltipRendererParams) => string;
    };
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

<h3>Default Pie Options</h3>

<p>
    The default values for the pie chart options are shown below:
</p>

    <snippet>{
    parent: this.chartProxyParams.parentElement,
    width: this.chartProxyParams.width,
    height: this.chartProxyParams.height,
    padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    },
    xAxis: {
        type: 'category',
        labelFont: '12px Verdana, sans-serif',
        labelColor: this.getLabelColor(),
        tickSize: 6,
        tickWidth: 1,
        tickPadding: 5,
        lineColor: 'rgba(195, 195, 195, 1)',
        lineWidth: 1,
        gridStyle: [{
            strokeStyle: this.getAxisGridColor(),
            lineDash: [4, 2]
        }]
    },
    yAxis: {
        type: 'number',
        labelFont: '12px Verdana, sans-serif',
        labelColor: this.getLabelColor(),
        tickSize: 6,
        tickWidth: 1,
        tickPadding: 5,
        lineColor: 'rgba(195, 195, 195, 1)',
        lineWidth: 1,
        gridStyle: [{
            strokeStyle: this.getAxisGridColor(),
            lineDash: [4, 2]
        }]
    },
    legend: {
        labelFont: '12px Verdana, sans-serif',
        labelColor: this.getLabelColor(),
        itemPaddingX: 16,
        itemPaddingY: 8,
        markerPadding: 4,
        markerSize: 14,
        markerLineWidth: 1
    },
    seriesDefaults: {
        type: 'bar',
        fills: palette.fills,
        strokes: palette.strokes,
        grouped: this.chartProxyParams.chartType === ChartType.GroupedBar,
        lineWidth: 1,
        tooltipEnabled: true,
        labelEnabled: false,
        labelFont: '12px Verdana, sans-serif',
        labelColor: this.getLabelColor(),
        labelPadding: {x: 10, y: 10},
        tooltipRenderer: undefined,
        showInLegend: true,
        title: '',
        titleEnabled: true,
        titleFont: 'bold 12px Verdana, sans-serif'
    }
}
</snippet>

    <?= example('Provided Container', 'provided-container', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
