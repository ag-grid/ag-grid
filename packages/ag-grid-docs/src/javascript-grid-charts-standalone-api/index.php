<?php
$pageTitle = "Charts Standalone: Overview";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
define("skipInPageNav", true);
?>

<h1 class="heading-enterprise">Charts Standalone - API</h1>

<p class="lead">
    This section introduces the standalone charts API.
</p>

<?= reactApp('chart-api', 'chart-api', array("exampleHeight" => 1000, "enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
