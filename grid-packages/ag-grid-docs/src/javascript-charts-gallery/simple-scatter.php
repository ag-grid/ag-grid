<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'Charts Standalone Gallery: Simple Scatter';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Charts Standalone Gallery: Simple Scatter</h1>

<p class="lead">
    This scatter chart shows how independent variables can be plotted against each other.
</p>

<?= chart_example('Simple Scatter', 'simple-scatter', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./line-with-gaps.php">❮&nbsp;&nbsp;Line With Gaps</a>
    <a class="chart-navigation__right" href="./simple-area.php">Simple Area&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>