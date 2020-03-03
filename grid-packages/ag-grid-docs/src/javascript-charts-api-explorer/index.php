<?php
$pageTitle = "ag-Charts API Explorer";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeywords = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
define("skipInPageNav", true);
?>

<h1 class="heading">ag-Charts API Explorer</h1>

<?= reactApp('chart-api', 'chart-api', array('exampleHeight' => 'calc(100vh - 18rem)', 'frameworks' => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
