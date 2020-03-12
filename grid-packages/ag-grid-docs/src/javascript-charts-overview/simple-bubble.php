<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Simple Bubble';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Simple Bubble</h1>

<p class="lead">
    Bubble charts are a specialised type of <a href='./simple-scatter.php'>scatter charts</a> that can represent a third variable through the size of each marker (or bubble).
</p>

<?= chart_example('Simple Bubble', 'simple-bubble', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-scatter.php">❮&nbsp;&nbsp;Simple Scatter</a>
    <a class="chart-navigation__right" href="./bubble-with-negative-values.php">Bubble With Negative Values&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>