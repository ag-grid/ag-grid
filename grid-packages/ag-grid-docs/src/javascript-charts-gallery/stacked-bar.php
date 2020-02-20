<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'Charts Standalone Gallery: Stacked Bar';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeyboards = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Charts Standalone Gallery: Stacked Bar</h1>

<p class="lead">
    The bar chart represents data as a series of stacked horizontal bars.
</p>

<?= chart_example('Stacked Bar', 'stacked-bar', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./grouped-bar.php">❮&nbsp;&nbsp;Grouped Bar</a>
    <a class="chart-navigation__right" href="./bar-with-negative-numbers.php">Bar With Negative Numbers&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>