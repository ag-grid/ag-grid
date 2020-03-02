<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'Charts Standalone Gallery: Stacked Area';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Charts Standalone Gallery: Stacked Area</h1>

<p class="lead">
    Stacked area charts plot multiple <a href='./simple-area.php'>area</a> series stacked on top of each other, showing how part-to-whole relationships change over time.
</p>

<?= chart_example('Stacked Area', 'stacked-area', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-area.php">❮&nbsp;&nbsp;Simple Area</a>
    <a class="chart-navigation__right" href="./100--stacked-area.php">100% Stacked Area&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>