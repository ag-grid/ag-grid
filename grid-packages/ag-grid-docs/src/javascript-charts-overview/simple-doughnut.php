<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Simple Doughnut';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Simple Doughnut</h1>

<p class="lead">
    Doughnut charts are similar to <a href='./simple-pie.php'>pie charts</a>, being used to express a part-to-whole relationship, but allow for multiple series to be shown on the same chart for comparison.
</p>

<?= chart_example('Simple Doughnut', 'simple-doughnut', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-pie.php">❮&nbsp;&nbsp;Simple Pie</a>
    <a class="chart-navigation__right" href="./simple-line.php">Simple Line&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>