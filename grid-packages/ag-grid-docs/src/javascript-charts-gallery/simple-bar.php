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
    The bar chart represents data as a series of horizontal bars.
</p>

<?= chart_example('Simple Bar', 'simple-bar', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./column-with-negative-numbers.php">❮&nbsp;&nbsp;Column With Negative Numbers</a>
    <a class="chart-navigation__right" href="./grouped-bar.php">Grouped Bar&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>