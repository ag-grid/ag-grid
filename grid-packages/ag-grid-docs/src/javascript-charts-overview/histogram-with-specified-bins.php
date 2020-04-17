<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Histogram with specified bins';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Histogram With Specified Bins</h1>

<p class="lead">
    Rather than using the automatically generated fixed-width bins, it is possible to explicitly specify bins. In this case the bins need not be of equal widths. In the example below the data is split into light, medium, and heavy vehicles, and we also demonstrate custom tooltips to give names to these categories.
</p>

<?= chart_example('Histogram with specified bins', 'histogram-with-specified-bins', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-histogram.php">❮&nbsp;&nbsp;Simple Histogram</a>
    <a class="chart-navigation__right" href="./xy-histogram-with-mean-aggregation.php">XY Histogram With Mean Aggregation&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>