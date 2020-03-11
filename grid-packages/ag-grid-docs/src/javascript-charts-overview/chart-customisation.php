<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Chart Customisation';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Chart Customisation</h1>

<p class="lead">
    As well as the series themselves, many other aspects of the charts can be customised and formatted to your liking, including the background, padding, titles, axes, and legend.
</p>

<?= chart_example('Chart Customisation', 'chart-customisation', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./combination-of-different-series-types.php">❮&nbsp;&nbsp;Combination of Different Series Types</a>
    <a class="chart-navigation__right" href="./custom-marker-shapes.php">Custom Marker Shapes&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>