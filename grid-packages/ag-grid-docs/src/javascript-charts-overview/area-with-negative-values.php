<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = 'ag-Charts Gallery: Area With Negative Values';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Area With Negative Values</h1>

<p class="lead">
    <a href='./simple-area.php'>Area charts</a> can also be used with negative values, with the area between the line and the axis being filled.
</p>

<?= chart_example('Area With Negative Values', 'area-with-negative-values', 'generated', array('exampleHeight' => '60vh')) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./100--stacked-area.php">❮&nbsp;&nbsp;100% Stacked Area</a>
    <a class="chart-navigation__right" href="./time-axis-with-irregular-intervals.php">Time Axis With Irregular Intervals&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>