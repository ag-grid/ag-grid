<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'Charts Standalone Gallery: Simple Bar';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Charts Standalone Gallery: Simple Bar</h1>

<p class="lead">
    Bar charts represent data using horizontal bars, with the length of each bar proportional to the value being plotted. They are useful for categorical data, and are simple to interpret. They work best where the number of data points is limited.
</p>

<?= chart_example('Simple Bar', 'simple-bar', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__right" href="./grouped-bar.php">Grouped Bar&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>