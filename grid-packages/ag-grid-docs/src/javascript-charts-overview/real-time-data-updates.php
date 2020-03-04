<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Real-Time Data Updates';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Real-Time Data Updates</h1>

<p class="lead">
    Charts will re-render immediately when new data is provided. This example demonstrates the performance of a chart with new data introduced every 50 milliseconds.
</p>

<?= chart_example('Real-Time Data Updates', 'real-time-data-updates', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./time-axis-with-irregular-intervals.php">❮&nbsp;&nbsp;Time Axis With Irregular Intervals</a>
    <a class="chart-navigation__right" href="./combination-of-different-series-types.php">Combination of Different Series Types&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>