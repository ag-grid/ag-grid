<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Sorting / Filtering </h1>

<p class="lead">
    This section covers Server-side Sorting using the Server-side Row Model.
</p>



<h2>Sorting</h2>

<?= grid_example('Sorting', 'sorting', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('alasql'))) ?>

<h2>Simple Set Filtering</h2>

<?= grid_example('Simple Set Filtering', 'simple-set-filtering', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('alasql'))) ?>

<h2>Provided Filters</h2>

<?= grid_example('Provided Filters', 'provided-filters', 'generated', array("enterprise" => 1, "processVue" => true, "extras" => array('alasql'))) ?>


<p>
    Continue to the next section to learn about
    <a href="../javascript-grid-server-side-model-grouping/">Server-side Row Grouping</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
