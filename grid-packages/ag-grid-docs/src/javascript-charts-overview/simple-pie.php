<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Simple Pie';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Simple Pie</h1>

<p class="lead">
    Pie charts are used to express a part-to-whole relationship, where all the slices combine to represent 100%. They work best for a small number of categories.
</p>

<?= chart_example('Simple Pie', 'simple-pie', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./column-with-negative-values.php">❮&nbsp;&nbsp;Column With Negative Values</a>
    <a class="chart-navigation__right" href="./simple-doughnut.php">Simple Doughnut&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>