<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Stacked Column';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Stacked Column</h1>

<p class="lead">
    Stacked column charts allow part-to-whole comparisons, with series stacked on top of each other in the vertical <a href='./simple-column.php'>columns</a>.
</p>

<?= chart_example('Stacked Column', 'stacked-column', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./grouped-column.php">❮&nbsp;&nbsp;Grouped Column</a>
    <a class="chart-navigation__right" href="./100--stacked-column.php">100% Stacked Column&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>