<?php
$pageTitle = "ag-Grid Reference: Grid Properties";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference guide covers the properties that are available in the GridOptions.";
$pageKeywords = "javascript data grid ag-Grid properties";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<h1>Grid Properties</h1>

<p class="lead">
    All of these grid properties are available through the <code>GridOptions</code> interface.
</p>

<?php createDocumentationFromFile('properties.json') ?>

<?php include '../documentation-main/documentation_footer.php';?>
