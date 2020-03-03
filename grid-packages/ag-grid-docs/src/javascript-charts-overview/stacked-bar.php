<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'ag-Charts Gallery: Stacked Bar';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Stacked Bar</h1>

<p class="lead">
    Stacked bar charts allow part-to-whole comparisons, with series stacked from left to right in the horizontal <a href='./simple-bar.php'>bars</a>. They make it easy to compare combined bar lengths.
</p>

<?= chart_example('Stacked Bar', 'stacked-bar', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./grouped-bar.php">❮&nbsp;&nbsp;Grouped Bar</a>
    <a class="chart-navigation__right" href="./100--stacked-bar.php">100% Stacked Bar&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>