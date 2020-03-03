<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'ag-Charts Gallery: Simple Scatter';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Simple Scatter</h1>

<p class="lead">
    Scatter charts (also known as scatter plots or XY charts) show the relationship between two variables, placing one variable on each axis, and can be useful for demonstrating any correlation between the variables.
</p>

<?= chart_example('Simple Scatter', 'simple-scatter', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./line-with-gaps.php">❮&nbsp;&nbsp;Line With Gaps</a>
    <a class="chart-navigation__right" href="./simple-bubble.php">Simple Bubble&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>