<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Line With Gaps';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Line With Gaps</h1>

<p class="lead">
    When data is missing in some line series compared to others, these gaps in the data are reflected in the lines.
</p>

<?= chart_example('Line With Gaps', 'line-with-gaps', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./simple-line.php">❮&nbsp;&nbsp;Simple Line</a>
    <a class="chart-navigation__right" href="./simple-scatter.php">Simple Scatter&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>