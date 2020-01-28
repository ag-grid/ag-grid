<?php
$pageTitle = "ag-Grid Examples: Import Excel Spreadsheet";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows how to import an Excel Speadsheet into ag-Grid using a third-party library.";
$pageKeyboards = "ag-Grid import excel";
$pageGroup = "examples";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>



    <h1>Excel Import</h1>

    <p class="lead">
        Below we illustrate how you might import an Excel spreadsheet into ag-Grid using a third-party library - in this
        example we're using <a href="https://github.com/protobi/js-xlsx">xlsx-style</a>.
    </p>

    <p>
        In this example we're providing a simple Excel file for importing but in your application you could allow
        uploading of Excel files by end users.
    </p>

    <p>The spreadsheet contains a few rows of simple data, which the example parses and sets as row data.</p>

    <p>The spreadsheet can be downloaded <a href="https://www.ag-grid.com/example-excel-import/OlymicData.xlsx">here.</a></p>

    <?= example('Import Excel into ag-Grid', 'excel-import', 'vanilla', array("showResult" => true, "exampleHeight" => 460, "extras" => array("xlsx-style"))) ?>


<?php include '../documentation-main/documentation_footer.php';?>
