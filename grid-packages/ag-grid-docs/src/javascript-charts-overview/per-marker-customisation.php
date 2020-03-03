<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'ag-Charts Gallery: Per-Marker Customisation';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Per-Marker Customisation</h1>

<p class="lead">
    As well as customising all markers for a particular series, you can also customise each marker in the series individually, based on the datum that the marker represents. For example, the colour of the markers below is set based on the magnitude.
</p>

<?= chart_example('Per-Marker Customisation', 'per-marker-customisation', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./custom-tooltips.php">❮&nbsp;&nbsp;Custom Tooltips</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>