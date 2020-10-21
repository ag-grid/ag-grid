<?php
$pageTitle = "Server-Side Row Model - Row Grouping";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Proto</h1>

<p class="lead">
    Niall's test examples for next version of Server Side Row Model
</p>

<h1>No Infinite Scrolling</h1>

<?= grid_example('No Infinite Scrolling', 'no-infinite-scrolling', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h1>Transaction Flat</h1>

<?= grid_example('Transactions Flat', 'transactions-flat', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h1>Transaction Hierarchy</h1>

<?= grid_example('Transactions Hierarchy', 'transactions-hierarchy', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h1>Dynamic Params</h1>

<?= grid_example('Dynamic Params', 'dynamic-params', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
