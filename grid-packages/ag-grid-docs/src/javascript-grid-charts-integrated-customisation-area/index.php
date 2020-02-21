<?php
$pageTitle = "Charts: Area Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Area Chart Customisation</h1>

<p class="lead">
    In addition to the <a href="../javascript-grid-charts-integrated-customisation-general">general chart customisations</a> and
    <a href="../javascript-grid-charts-integrated-customisation-cartesian">cartesian chart customisations</a>, you can also
    use these customisations for area charts.
</p>

<h2>Option Interfaces</h2>

<snippet language="ts">
interface AreaChartOptions {
    seriesDefaults: {
        fill: FillOptions;
        stroke: StrokeOptions;

        // The shadow type to use for areas. Defaults to no shadow.
        shadow: DropShadowOptions;

        // The style to apply to a marker when it is hovered over or tapped
        highlightStyle: HighlightOptions;

        // Configuration for area series markers at each data point.
        // Note: tooltips won't show without markers.
        marker: MarkerOptions;

        // Configures the tooltip for area markers when they are hovered over or tapped
        tooltip: TooltipOptions;
    };
}

interface FillOptions {
    colors: string[]; // default: &lt;dependent on selected palette&gt;

    // Valid range from 0 (transparent) to 1 (opaque)
    opacity: number; // default: 1
}

interface StrokeOptions {
    colors: string[]; // default: &lt;dependent on selected palette&gt;

    // Valid range from 0 (transparent) to 1 (opaque)
    opacity: number; // default: 1

    width: number; // default: 3
}

interface DropShadowOptions {
    enabled: boolean; // default: false
    color: string; // default: 'rgba(0, 0, 0, 0.5)'
    xOffset: number; // default: 3
    yOffset: number; // default: 3
    blur: number; // default: 5
}

interface HighlightOptions {
    fill: string; // default: 'yellow'
    stroke?: string;
}

interface MarkerOptions {
    enabled: boolean; // default: true
    type: MarkerType; // default: 'circle'
    size: number; // default: 6
    strokeWidth: number; // default: 1
}

type MarkerType = 'circle' | 'cross' | 'diamond' | 'plus' | 'square' | 'triangle';

interface TooltipOptions {
    enabled: boolean; // default: true
    renderer?: (params: AreaTooltipRendererParams) => string; // should return a valid HTML string
}

interface AreaTooltipRendererParams {
    // The datum object for the highlighted marker that the tooltip is being rendered for
    datum: any;
    // The key of the datum object that contains the X value
    xKey: string;
    // The name of the column that the X value is from
    xName: string;
    // The key of the datum object that contains the Y value
    yKey: string;
    // The name of the column that the Y value is from
    yName: string;
    // The title of the series the datum is in
    title?: string;
    // The fill colour of the series the datum is in
    color: string;
}
</snippet>

<h3>Example: Area Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= grid_example('Area Chart Customisations', 'custom-area-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
