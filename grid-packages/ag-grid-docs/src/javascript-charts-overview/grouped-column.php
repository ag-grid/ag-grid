<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'ag-Charts Gallery: Grouped Column';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Grouped Column</h1>

<p class="lead">
    Grouped column charts (also known as clustered column charts) present multiple series with the <a href='./simple-column.php'>columns</a> grouped by category, to allow for easier comparisons across different series.
</p>

<?= chart_example('Grouped Column', 'grouped-column', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-column.php">❮&nbsp;&nbsp;Simple Column</a>
    <a class="chart-navigation__right" href="./stacked-column.php">Stacked Column&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>