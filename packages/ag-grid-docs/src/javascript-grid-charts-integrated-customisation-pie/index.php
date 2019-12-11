<?php
$pageTitle = "Charts: Pie/Doughnut Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Pie/Doughnut Chart Customisation</h1>

<p class="lead">
    In addition to the <a href="../javascript-grid-charts-integrated-customisation-general">general chart customisations</a>, you can also
    use these customisations for pie/doughnut charts.
</p>

<h2>Option Interfaces</h2>

<snippet>
interface PieChartOptions {
    seriesDefaults: {
        title: CaptionOptions;
        fill: FillOptions;
        stroke: StrokeOptions;

        // The style to apply to a slice when it is hovered over or tapped
        highlightStyle: HighlightStyle;

        shadow: DropShadowOptions;
        label: PieSeriesLabelOptions;
        callout: PieSeriesCalloutOptions;
        tooltip: TooltipOptions;
    };
}

interface CaptionOptions {
    enabled: boolean; // default: false (pie), true (doughnut)
    text?: string;
    fontStyle: FontStyle; // default: 'normal'
    fontWeight: FontWeight; // default: 'bold'
    fontSize: number; // default: 12
    fontFamily: string; // default: 'Verdana, sans-serif'
    color: string; // default: &lt;dependent on light/dark mode&gt;
}

type FontStyle = 'normal' | 'italic' | 'oblique';

type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

interface FillOptions {
    colors: string[]; // default: &lt;dependent on selected palette&gt;

    // Valid range from 0 (transparent) to 1 (opaque)
    opacity: number; // default: 1
}

interface StrokeOptions {
    colors: string[]; // default: &lt;dependent on selected palette&gt;

    // Valid range from 0 (transparent) to 1 (opaque)
    opacity: number; // default: 1

    width: number; // default: 1
}

interface HighlightStyle {
    fill: string; // default: 'yellow'
    stroke?: string;
}

interface DropShadowOptions {
    enabled: boolean; // default: false
    color: string; // default: 'rgba(0, 0, 0, 0.5)'
    xOffset: number; // default: 3
    yOffset: number; // default: 3
    blur: number; // default: 5
}

interface PieSeriesLabelOptions {
    enabled: boolean; // default: false
    fontStyle: FontStyle; // default: 'normal'
    fontWeight: FontWeight; // default: 'normal'
    fontSize: number; // default: 12
    fontFamily: string; // default: 'Verdana, sans-serif'
    color: string; // default: &lt;dependent on light/dark mode&gt;
    minRequiredAngle: number; // default: 0
    offset: number; // default: 3
}

interface PieSeriesCalloutOptions {
    length: number; // default: 10
    strokeWidth: number; // default: 2
    colors: string[]; // default: &lt;dependent on selected palette&gt;
}

interface PieTooltipRendererParams {
    // The datum object for the highlighted slice that the tooltip is being rendered for
    datum: any;
    // The key of the datum object that contains the angle value
    angleKey: string;
    // The name of the column that the angle value is from
    angleName: string;
    // The key of the datum object that contains the label text
    labelKey?: string;
    // The name of the column that the label text is from
    labelName: string;
}
</snippet>

<h3>Example: Pie/Doughnut Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= example('Pie/Doughnut Chart Customisations', 'custom-pie-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
