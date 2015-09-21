<?php
$key = "Loading Rows";
$pageTitle = "Loading Rows";
$pageDescription = "Angular Grid Loading Rows";
$pageKeyboards = "Angular Grid Loading Rows";
include '../documentation_header.php';
?>

<div>

    <h2>Loading Rows</h2>

    <h4>Calling onNewRows()</h4>

    If rows are loaded after the grid is initialised, call the grid's API function to update the rows after the load.

    <pre><code>$scope.gridOptions.api.setRowData()</code></pre>

    <p/>

    The API is explained in full in it's own section.

    <p/>

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>