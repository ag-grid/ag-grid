<?php
$pageTitle = "ag-Grid Reference: Column Properties";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. The columns of the datagrid are controlled by properties, this page outlines each of the Column Properties available.";
$pageKeywords = "ag-Grid Column Properties";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<h1>Column Properties</h1>

<p class="lead">
    For column groups, the property <code>children</code> is mandatory. When the grid sees <code>children</code>
    it knows it's a column group.
</p>

<?php createDocumentationFromFile('properties.json') ?>

<?php include '../documentation-main/documentation_footer.php';?>
