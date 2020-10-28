<?php
$pageTitle = "Server-Side Row Model - Transactions";
$pageDescription = "Transactions are for doing Insert, Update and Deletes on data inside the Server-Side Row Model.";
$pageKeywords = "ag-Grid Server-Side Transactions";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Transactions</h1>

<p class="lead">
</p>

<h1>Transaction Flat</h1>

<?= grid_example('Transactions Flat', 'transactions-flat', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h1>Transaction Hierarchy</h1>

<?= grid_example('Transactions Hierarchy', 'transactions-hierarchy', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
