<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Mean aggregation Histogram';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Mean aggregation Histogram</h1>

<p class="lead">
    Histograms show your data grouped into bins, revealing underlying trends. Here we again bin the data by car engine size, but plot the average engine size in the y-axis. We also plot the same data as a scatter series to illustrate the aggregation.
</p>

<?= chart_example('Mean aggregation Histogram', 'mean-aggregation-histogram', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-histogram.php">❮&nbsp;&nbsp;Simple Histogram</a>
    <a class="chart-navigation__right" href="./time-axis-with-irregular-intervals.php">Time Axis With Irregular Intervals&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>