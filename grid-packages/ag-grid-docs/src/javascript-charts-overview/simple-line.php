<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Simple Line';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Simple Line</h1>

<p class="lead">
    Line charts represent each series as a separate line. They are useful to show change or trends over time, and are able to better present more data points than <a href='./simple-bar.php'>bar</a> or <a href='./simple-column.php'>column</a> charts.
</p>

<?= chart_example('Simple Line', 'simple-line', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-doughnut.php">❮&nbsp;&nbsp;Simple Doughnut</a>
    <a class="chart-navigation__right" href="./line-with-gaps.php">Line With Gaps&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>