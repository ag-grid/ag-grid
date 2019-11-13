<?php
$pageTitle = "Charts: General Chart Customisation";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">General Chart Customisation</h1>

<p class="lead">
    These customisations can be applied to any type of chart.
</p>

<h2>Option Interfaces</h2>

<snippet>
interface ChartOptions {
    width: number, // default: 800
    height: number; // default: 400
    padding: PaddingOptions;
    background: BackgroundOptions;

    // If the title is disabled, the subtitle won't be visible either
    title: CaptionOptions;
    subtitle: CaptionOptions;

    legend: LegendOptions;

    // Additional CSS class to be added to the tooltip element
    tooltipClass?: string;
}

interface PaddingOptions {
    top: number; // default: 20
    right: number; // default: 20
    bottom: number; // default: 20
    left: number; // default: 20
}

interface BackgroundOptions {
    fill: string; // default: dependent on light/dark mode

    // Valid range from 0 (transparent) to 1 (opaque)
    opacity: number; // default: 1

    visible: boolean; // default: true
}

interface CaptionOptions {
    enabled: boolean;
    text?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight; // default: 'bold' for title, `undefined` for subtitle
    fontSize?: number; // default: 16 (for title), 12 (for subtitle)
    fontFamily?: string; // default: 'Verdana, sans-serif'
    color?: string; // default: 'black'
}

type FontStyle = 'normal' | 'italic' | 'oblique';

type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

interface LegendOptions {
    enabled: boolean; // default: true
    position: LegendPosition; // default: 'right'
    padding: number; // default: 20
    item: LegendItemOptions;
}

type LegendPosition = 'top' | 'right' | 'bottom' | 'left';

interface LegendItemOptions {
    label: LegendLabelOptions;
    marker: LegendMarkerOptions;
    paddingX: number; // default: 16
    paddingY: number; // default: 8
}

interface LegendLabelOptions {
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number; // default: 12
    fontFamily?: string; // default: 'Verdana, sans-serif'
    color?: string; // default: dependent on light/dark mode
}

interface LegendMarkerOptions {
    size: number; // default: 14
    padding: number; // default: 4
    strokeWidth: number; // default: 1
}
</snippet>

<h3>Example: General Chart Customisations</h3>

<p>
    The example below changes all available styling options shown above. The styling options are exaggerated to
    demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= example('General Chart Customisations', 'custom-general', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
