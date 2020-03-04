<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Grouped Bar';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Grouped Bar</h1>

<p class="lead">
    Grouped bar charts (also known as clustered bar charts) show multiple series with the <a href='./simple-bar.php'>bars</a> grouped by category, to allow for easier comparisons across different series.
</p>

<?= chart_example('Grouped Bar', 'grouped-bar', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-bar.php">❮&nbsp;&nbsp;Simple Bar</a>
    <a class="chart-navigation__right" href="./stacked-bar.php">Stacked Bar&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>