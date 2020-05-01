<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: XY Histogram with Mean Aggregation';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: XY Histogram With Mean Aggregation</h1>

<p class="lead">
    Here we bin the data by car engine size, but plot the average highway mpg in the y-axis, revealing the relationship between these two fields. We also plot the same data as a scatter series to illustrate the aggregation.
</p>

<?= chart_example('XY Histogram with Mean Aggregation', 'xy-histogram-with-mean-aggregation', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./histogram-with-specified-bins.php">❮&nbsp;&nbsp;Histogram With Specified Bins</a>
    <a class="chart-navigation__right" href="./time-axis-with-irregular-intervals.php">Time Axis With Irregular Intervals&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>