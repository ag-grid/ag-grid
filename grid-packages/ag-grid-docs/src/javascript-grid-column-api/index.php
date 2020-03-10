<?php
$pageTitle = "ag-Grid Reference Guide: Column API";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference guide covers the methods available in the Column API. It also covers how to save and restore the column state. This includes column widths, aggregation fields and visibility.";
$pageKeywords = "ag-Grid Column API";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<h1>Column API</h1>

<p class="lead">
    Below are listed all the column API methods.
</p>

<?php createDocumentationFromFile('api.json') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>