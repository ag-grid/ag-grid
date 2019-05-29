<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Customising Line Charts</h1>

    <p class="lead">
        This sections details how to customise line charts in your applications.
    </p>

<h3>Line Chart Option Interfaces</h3>

<p>
    The interfaces for line chart options are shown below:
</p>

<snippet>
interface LineChartOptions {
    parent?: HTMLElement;
    width?: number;
    height?: number;
    series?: any[];
    data?: any;
    padding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    legendPadding?: number;
    tooltipClass?: string;
    legend?: {
        markerLineWidth?: number;
        markerSize?: number;
        markerPadding?: number;
        itemPaddingX?: number;
        itemPaddingY?: number;
        labelFont?: string;
        labelColor?: string;
    };
    xAxis: AxisOptions;
    yAxis: AxisOptions;
    seriesDefaults?: {
        type?: string;
        data?: any[];
        title?: string;
        titleEnabled?: boolean;
        titleFont?: string;
        visible?: boolean;
        showInLegend?: boolean;
        tooltipEnabled?: boolean;
        xField?: string;
        yField?: string;
        fill?: string;
        stroke?: string;
        lineWidth?: number;
        marker?: boolean;
        markerRadius?: number;
        markerLineWidth?: number;
        tooltipRenderer?: (params: LineTooltipRendererParams) => string;
    };
}

interface LineTooltipRendererParams {
    datum: any;
    xField: string;
    yField: string;
}

interface AxisOptions {
    type?: 'category' | 'number';

    lineWidth?: number;
    lineColor?: string;

    tickWidth?: number;
    tickSize?: number;
    tickPadding?: number;
    tickColor?: string;

    labelFont?: string;
    labelColor?: string;
    labelRotation?: number;
    mirrorLabels?: boolean;
    parallelLabels?: boolean;
    labelFormatter?: (value: any, fractionDigits?: number) => string;
    gridStyle?: IGridStyle[];
}

interface IGridStyle {
    strokeStyle: string | null;
    lineDash: number[] | null;
}
</snippet>

    <h3>Default Line Options</h3>

    <p>
        The default values for the bar chart options are shown below:
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
        labelRotation: 0,
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
        type: 'line',
        fill: palette.fills[0], //TODO
        stroke: palette.strokes[0], //TODO
        lineWidth: 3,
        marker: true,
        markerRadius: 3,
        markerLineWidth: 1,
        tooltipEnabled: true,
        tooltipRenderer: undefined,
        showInLegend: true,
        title: '',
        titleEnabled: false,
        titleFont: 'bold 12px Verdana, sans-serif'
    }
}
</snippet>

    <?= example('Provided Container', 'provided-container', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
