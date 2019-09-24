<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Pie/Doughnut Chart Customisations</h1>

<p class="lead">
    In addition to the <a href="../javascript-grid-charts-customisation-general">general chart customisations</a>, you can also 
    use these customisations for pie/doughnut charts.
</p>

<h2>Option Interfaces</h2>

<snippet>
interface PieChartOptions {
    seriesDefaults?: {
        title?: CaptionOptions;

        fills?: string[];
        fillOpacity?: number; // valid range from `0` to `1`, defaults to `1` (opaque)
        strokes?: string[]; // defaults to darker versions of fill colours
        strokeOpacity?: number; // valid range from `0` to `1`, defaults to `1` (opaque)
        strokeWidth?: number; // defaults to `1`
        // The style to apply to a chart when it is hovered or tapped
        highlightStyle?: HighlightStyle;

        shadow?: {
            color?: string;
            offset?: [ number, number ];
            blur?: number;
        };

        // Whether to show slice labels or not
        labelEnabled?: boolean; // defaults to `false`
        // If the slice angle is smaller than this value (in degrees),
        // the label won't be shown
        labelMinAngle?: number; // defaults to `0`
        labelFontStyle?: FontStyle;
        labelFontWeight?: FontWeight;
        labelFontSize?: number; // defaults to `12`
        labelFontFamily?: string; // defaults to `Verdana, sans-serif`
        labelColor?: string; // default varies based on light or dark mode

        calloutStrokeWidth?: number; // defaults to `2`
        calloutLength?: number; // defaults to `10`
        calloutColors?: string[]; 

        // Whether to show the tooltip for slices when they are hovered/tapped
        tooltipEnabled?: boolean; // defaults to `true`
        // A custom tooltip render function. Should return a valid HTML string.
        tooltipRenderer?: (params: PieTooltipRendererParams) => string;
    };
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

interface HighlightStyle {
    fill?: string;
    stroke?: string;
}

export type FontStyle = 'normal' | 'italic' | 'oblique';

export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;

interface PieTooltipRendererParams {
    // The datum object the tooltip is being rendered for
    datum: any;
    // The field of the datum object that contains the value of the highlighted slice
    angleField: string;
    // The field of the datum object that contains the label text of the highlighted slice
    labelField?: string;
}
</snippet>

<h3>Example: Pie/Doughnut Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>
    
<?= example('Pie/Doughnut Chart Customisations', 'custom-pie-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
