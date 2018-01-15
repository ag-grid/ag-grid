<?php
$pageTitle = "ag-Grid JavaScript Grid Status Bar";
$pageDescription = "The status bar provides details about the grid for example aggregation details for the selected range.";
$pageKeyboards = "ag-Grid JavaScript Grid Status Bar";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Status Bar</h1>

<p class="lead">The status bar appears below the grid. When used in combination with the range selection it displays
aggregation data about the selected range giving the following: <strong>average, count, min, max, sum</strong>.</p>

<p>If you have multiple ranges selected (by holding down ctrl while dragging) and a cell is in multiple
ranges, the cell will be only included once in the aggregations.</p>

<p>If the cell does not contain a simple number value, then it will not be included in average, min max or sum,
however it will be included in count.</p>

<p>In the grid below, select a range by dragging the mouse over cells and notice the status bar
showing the aggregation values as you drag.</p>

<?= example('Status Bar', 'status-bar', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
