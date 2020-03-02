<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'Charts Standalone Gallery: 100% Stacked Bar';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">Charts Standalone Gallery: 100% Stacked Bar</h1>

<p class="lead">
    100% stacked bar charts show the relative percentage of multiple series in <a href='./stacked-bar.php'>stacked bars</a>, where each stacked bar always totals to 100%.
</p>

<?= chart_example('100% Stacked Bar', '100--stacked-bar', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./stacked-bar.php">❮&nbsp;&nbsp;Stacked Bar</a>
    <a class="chart-navigation__right" href="./bar-with-labels.php">Bar With Labels&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>