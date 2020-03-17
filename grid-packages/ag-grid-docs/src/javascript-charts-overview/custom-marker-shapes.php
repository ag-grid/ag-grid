<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Custom Marker Shapes';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Custom Marker Shapes</h1>

<p class="lead">
    The library provides a variety of different marker shapes that can be used. In addition, you can provide your own shapes by extending the <code>Marker</code> class, as shown with the heart-shaped marker below.
</p>

<?= chart_example('Custom Marker Shapes', 'custom-marker-shapes', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./chart-customisation.php">❮&nbsp;&nbsp;Chart Customisation</a>
    <a class="chart-navigation__right" href="./custom-tooltips.php">Custom Tooltips&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>