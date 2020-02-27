<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'Charts Standalone Gallery: Simple Bubble';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Charts Standalone Gallery: Simple Bubble</h1>

<p class="lead">
    This bubble chart shows how independent variables can be plotted against each other including a third dimension.
</p>

<?= chart_example('Simple Bubble', 'simple-bubble', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-scatter.php">❮&nbsp;&nbsp;Simple Scatter</a>
    <a class="chart-navigation__right" href="./bubble-with-negative-values.php">Bubble With Negative Values&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>