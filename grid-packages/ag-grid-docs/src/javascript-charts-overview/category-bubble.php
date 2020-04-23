<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Bubble Chart with Category Data';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Bubble Chart with Category Data</h1>

<p class="lead">
    Scatter series can be used with category data in a single direction or both X and Y directions. The example below uses category data for both directions, where the bottom axis shows the time slot and the left axis the day of the week.
</p>

<?= chart_example('Bubble Chart with Category Data', 'category-bubble', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-scatter.php">❮&nbsp;&nbsp;Simple Scatter</a>
    <a class="chart-navigation__right" href="./simple-bubble.php">Simple Bubble&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>