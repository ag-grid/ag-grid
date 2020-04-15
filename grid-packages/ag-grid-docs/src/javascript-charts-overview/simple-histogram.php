<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Simple Histogram';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Simple Histogram</h1>

<p class="lead">
    Histograms show your data grouped into bins, revealing underlying trends. The simplest histogram plots the cardinality of the bin against the y-axis. Here we show the distribution of car engine sizes, using just the <code>engine-size</code> field from the available data. We also plot the same data as a scatter series to illustrate the aggregation.
</p>

<?= chart_example('Simple Histogram', 'simple-histogram', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./area-with-negative-values.php">❮&nbsp;&nbsp;Area With Negative Values</a>
    <a class="chart-navigation__right" href="./mean-aggregation-histogram.php">Mean aggregation Histogram&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>