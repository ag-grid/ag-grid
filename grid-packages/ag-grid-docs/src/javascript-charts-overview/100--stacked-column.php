<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: 100% Stacked Column';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: 100% Stacked Column</h1>

<p class="lead">
    100% stacked column charts show the relative percentage of multiple series in <a href='./stacked-column.php'>stacked columns</a>, where each stacked column always totals to 100%.
</p>

<?= chart_example('100% Stacked Column', '100--stacked-column', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./stacked-column.php">❮&nbsp;&nbsp;Stacked Column</a>
    <a class="chart-navigation__right" href="./column-with-negative-values.php">Column With Negative Values&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>