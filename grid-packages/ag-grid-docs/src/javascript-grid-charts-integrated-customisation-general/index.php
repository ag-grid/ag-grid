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

<snippet language="ts">
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
    fill: string; // default: &lt;dependent on light/dark mode&gt;
    visible: boolean; // default: true
}

interface CaptionOptions {
    enabled: boolean; // default: false
    text?: string;
    fontStyle: FontStyle; // default: 'normal'
    fontWeight: FontWeight; // default: 'bold' for title, 'normal' for subtitle
    fontSize: number; // default: 16 (for title), 12 (for subtitle)
    fontFamily: string; // default: 'Verdana, sans-serif'
    color: string; // default: &lt;dependent on light/dark mode&gt;
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
    fontStyle: FontStyle; // default: 'normal'
    fontWeight: FontWeight; // default: 'normal'
    fontSize: number; // default: 12
    fontFamily: string; // default: 'Verdana, sans-serif'
    color: string; // default: &lt;dependent on light/dark mode&gt;
}

interface LegendMarkerOptions {
    type: MarkerType; // default: 'square'
    size: number; // default: 15
    padding: number; // default: 8
    strokeWidth: number; // default: 1
}

type MarkerType = 'circle' | 'cross' | 'diamond' | 'plus' | 'square' | 'triangle';
</snippet>

<h3>Example: General Chart Customisations</h3>

<p>
    The example below changes all available styling options shown above. The styling options are exaggerated to
    demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= example('General Chart Customisations', 'custom-general', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
