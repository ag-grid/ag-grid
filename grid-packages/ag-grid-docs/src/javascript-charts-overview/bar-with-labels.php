<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Bar With Labels';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Bar With Labels</h1>

<p class="lead">
    Using labels in a <a href='./simple-bar.php'>bar chart</a> can be useful to highlight the values of each bar.
</p>

<?= chart_example('Bar With Labels', 'bar-with-labels', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./100--stacked-bar.php">❮&nbsp;&nbsp;100% Stacked Bar</a>
    <a class="chart-navigation__right" href="./simple-column.php">Simple Column&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>