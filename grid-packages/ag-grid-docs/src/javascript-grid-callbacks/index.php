<?php
$pageTitle = "ag-Grid Reference: Grid Callbacks";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference guide covers all of the available Grid Callbacks.";
$pageKeywords = "javascript data grid ag-Grid Callbacks";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<h1>Grid Callbacks</h1>

<p class="lead">
    All of these grid callbacks are available through the <code>GridOptions</code> interface.
</p>

<?php createDocumentationFromFile('callbacks.json') ?>

<?php include '../documentation-main/documentation_footer.php';?>
