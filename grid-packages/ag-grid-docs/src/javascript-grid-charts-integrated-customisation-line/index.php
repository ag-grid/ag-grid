<?php
$pageTitle = "Charts: Line Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Line Chart Customisation</h1>

<p class="lead">
In addition to the <a href="../javascript-grid-charts-integrated-customisation-general">general chart customisations</a> and
    <a href="../javascript-grid-charts-integrated-customisation-cartesian">cartesian chart customisations</a>, you can also
    use these customisations for line charts.
</p>

<h2>Option Interfaces</h2>

<snippet language="ts">
interface LineChartOptions {
    seriesDefaults: {
        // The fill colours are used by the lines in the series
        // Will be used for markers as well, unless overridden in the marker options
        fill: FillOptions;

        // The stroke colours to be used by the series' markers, unless overridden in
        // the marker options
        stroke: StrokeOptions;

        // The style to apply to a marker when it is hovered over or tapped
        highlightStyle: HighlightOptions;

        marker: MarkerOptions;

        // Configures the tooltip for bars when they are hovered over or tapped
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
    renderer?: (params: LineTooltipRendererParams) => string; // should return a valid HTML string
}

interface LineTooltipRendererParams {
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

<h3>Example: Line Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= grid_example('Line Chart Customisations', 'custom-line-chart', 'generated', ['enterprise' => true]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
