<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'Charts Standalone Gallery: Simple Column';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Charts Standalone Gallery: Simple Column</h1>

<p class="lead">
    Column charts (also known as vertical <a href='./simple-bar.php'>bar charts</a>) represent data using vertical columns, with the height of each column proportional to the value being plotted. They can be used to plot both nominal and ordinal data, and are simple to interpret. They work best where the number of data points is limited.
</p>

<?= chart_example('Simple Column', 'simple-column', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./bar-with-labels.php">❮&nbsp;&nbsp;Bar With Labels</a>
    <a class="chart-navigation__right" href="./grouped-column.php">Grouped Column&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>