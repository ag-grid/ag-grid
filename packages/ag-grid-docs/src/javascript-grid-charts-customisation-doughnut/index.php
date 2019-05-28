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
    seriesDefaults?: {
        type?: string;
        data?: any[];
        title?: string;
        titleEnabled?: boolean;
        titleFont?: string;
        visible?: boolean;
        showInLegend?: boolean;
        tooltipEnabled?: boolean;
        calloutColors?: string[];
        calloutWidth?: number;
        calloutLength?: number;
        calloutPadding?: number;
        labelFont?: string;
        labelColor?: string;
        labelMinAngle?: number;
        angleField?: string;
        radiusField?: string;
        labelField?: string;
        labelEnabled?: boolean;
        fills?: string[];
        strokes?: string[];
        rotation?: number;
        outerRadiusOffset?: number;
        innerRadiusOffset?: number;
        // strokeStyle?: string // TODO: ???
        shadow?: {
            color?: string;
            offset?: [number, number];
            blur?: number;
        };
        lineWidth?: number;
        tooltipRenderer?: (params: DoughnutTooltipRendererParams) => string;
    };
}

interface DoughnutTooltipRendererParams {
    datum: any;
    angleField: string;
    radiusField?: string;
    labelField?: string;
}
</snippet>

<h3>Default Doughnut Options</h3>

<p>
    The default values for the pie chart options are shown below:
</p>

    <snippet>{
    parent: this.chartProxyParams.parentElement,
    width: this.chartProxyParams.width,
    height: this.chartProxyParams.height,
    padding: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
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
        type: 'pie',
        fills: palette.fills,
        strokes: palette.strokes,
        lineWidth: 1,
        calloutColors: palette.strokes,
        calloutWidth: 2,
        calloutLength: 10,
        calloutPadding: 3,
        labelEnabled: false,
        labelFont: '12px Verdana, sans-serif',
        labelColor: this.getLabelColor(),
        labelMinAngle: 20,
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
