<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Filtering & Sorting</h1>

<p class="lead">
    This section covers how filtering and sorting is achieved with the Server-side Row Model.
</p>

<?= grid_example('Sorting', 'sorting', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('lodash'))) ?>

<p>

</p>

<?= grid_example('Filtering', 'filtering', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to see how to lazy load data with: <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
