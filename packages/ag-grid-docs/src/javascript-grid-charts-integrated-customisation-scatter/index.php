<?php
$pageTitle = "Charts: Scatter/Bubble Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Scatter/Bubble Chart Customisation</h1>

<p class="lead">
In addition to the <a href="../javascript-grid-charts-integrated-customisation-general">general chart customisations</a> and
    <a href="../javascript-grid-charts-integrated-customisation-cartesian">cartesian chart customisations</a>, you can also
    use these customisations for scatter/bubble charts.
</p>

<h2>Option Interfaces</h2>

<snippet>
interface ScatterChartOptions {
    seriesDefaults: {
        // The fill colours used by the series' markers
        fill: FillOptions;

        // The stroke colours to be used by the series' markers
        stroke: StrokeOptions;

        // The style to apply to a marker when it is hovered over or tapped
        highlightStyle: HighlightOptions;

        marker: MarkerOptions;

        // Configures the tooltip for bars when they are hovered over or tapped
        tooltip: TooltipOptions;

        // Whether the scatter/bubble chart should operate in paired mode, where columns
        // alternate between being X and Y (and size for bubble), or standard mode, where
        // the first column is used for X and every other column is treated as Y
        // (or alternates between Y and size for bubble)
        paired: boolean;
    };
}

interface FillOptions {
    colors: string[]; // default: &lt;dependent on selected palette&gt;

    // Valid range from 0 (transparent) to 1 (opaque)
    opacity: number; // default: 1 (scatter), 0.7 (bubble)
}

interface StrokeOptions {
    colors: string[]; // default: &lt;dependent on selected palette&gt;

    // Valid range from 0 (transparent) to 1 (opaque)
    opacity: number; // default: 1

    width: number; // default: 1
}

interface HighlightOptions {
    fill: string; // default: 'yellow'
    stroke?: string;
}

interface MarkerOptions {
    enabled: boolean; // default: true
    type: MarkerType; // default: 'circle'

    // In bubble charts the marker size is determined by data. In this case, `size`
    // is the maximum size a marker can be and `minSize` is the minimum. For scatter
    // charts, all markers are the same size, which is determined by `size`
    size: number; // default: 6 (scatter), 30 (bubble)
    minSize: number, // default: `undefined` (scatter), 3 (bubble)

    strokeWidth: number; // default: 1
}

type MarkerType = 'circle' | 'cross' | 'diamond' | 'plus' | 'square' | 'triangle';

interface TooltipOptions {
    enabled: boolean; // default: true
    renderer?: (params: ScatterTooltipRendererParams) => string; // should return a valid HTML string
}

interface ScatterTooltipRendererParams {
    // The datum object for the highlighted data point that the tooltip is being rendered for
    datum: any;
    // The key of the datum object that contains the X value
    xKey: string;
    // The name of the column that the X value is from
    xName: string;
    // The key of the datum object that contains the Y value
    yKey: string;
    // The name of the column that the Y value is from
    yName: string;
    // The key of the datum object that contains the size value
    sizeKey?: string;
    // The name of the column that the size value is from
    sizeName?: string;
    // The key of the datum object that contains the label
    labelKey?: string;
    // The name of the column that the label is from
    labelName?: string;
    // The title of the series the datum is in
    title?: string;
    // The fill colour of the series the datum is in
    color: string;
}
</snippet>

<h3>Example: Scatter/Bubble Chart Customisations</h3>

<p>
    The example below changes all available styling options. The styling options are exaggerated
    to demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= example('Scatter/Bubble Chart Customisations', 'custom-scatter-chart', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
