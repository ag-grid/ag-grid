<?php
$pageTitle = "Charting: Charting Grid Data";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">General Chart Customisations</h1>

<p class="lead">
    These customisations can be applied to any type of chart.
</p>

<h2>Option Interfaces</h2>

<snippet>
interface ChartOptions {
    width?: number,
    height?: number;

    padding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };

    background?: BackgroundOptions;

    // If the title is not specified or is disabled, the subtitle won't be visible either
    title?: CaptionOptions;
    subtitle?: CaptionOptions;

    legend?: {
        enabled?: boolean; // defaults to `true`
        markerStrokeWidth?: number; // defaults to `1`
        markerSize?: number; // defaults to `14`
        markerPadding?: number; // defaults to `4`
        // The amount of horizontal padding between legend items
        itemPaddingX?: number; // defaults to `16`
        // The amount of vertical padding between legend items
        itemPaddingY?: number; // defaults to `8`
        labelFontStyle?: FontStyle; // defaults to undefined
        labelFontWeight?: FontWeight; // defaults to undefined
        labelFontSize?: number; // defaults to `12`
        labelFontFamily?: string; // defaults to `Verdana, sans-serif`
        labelColor?: string; // default depends on ag-Grid theme
    };

    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    legendPadding?: number;

    // Additional CSS class to be added to the tooltip element
    tooltipClass?: string;
}

interface BackgroundOptions {
    fill?: string;
    visible?: boolean;
}

interface CaptionOptions {
    text?: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight; // defaults to `bold` for the title, and `undefined` for the subtitle
    fontSize?: number; // defaults to `16` for the title and `12` for the subtitle
    fontFamily?: string; // defaults to `Verdana, sans-serif`
    color?: string; // defaults to `black`
    enabled?: boolean; // defaults to `true`
}

export type FontStyle = 'normal' | 'italic' | 'oblique';

export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;
</snippet>

<h3>Example: General Chart Customisations</h3>

<p>
    The example below changes all available styling options shown above. The styling options are exaggerated to 
    demonstrate each option rather than to produce a chart that looks nice!
</p>

<?= example('General Chart Customisations', 'custom-general', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
