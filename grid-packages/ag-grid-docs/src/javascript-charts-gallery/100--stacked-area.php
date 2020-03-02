<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'Charts Standalone Gallery: 100% Stacked Area';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Charts Standalone Gallery: 100% Stacked Area</h1>

<p class="lead">
    100% stacked area charts show the relative percentage of multiple series in <a href='./stacked-area.php'>stacked areas</a>, where the cumulative area always totals to 100%.
</p>

<?= chart_example('100% Stacked Area', '100--stacked-area', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./stacked-area.php">❮&nbsp;&nbsp;Stacked Area</a>
    <a class="chart-navigation__right" href="./area-with-negative-values.php">Area With Negative Values&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>