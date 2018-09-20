<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> CRUD Operations </h1>

<p class="lead">
    Learn how to perform CRUD operations using the Server-side Row Model.
</p>

<h2>Server-side Changing Data</h2>

<p>
    Data is read back from the server side in blocks. This is similar to paging in other data-grids.
    This comes with one restriction - if the data is changing such that the data in each block changes,
    then the Server-side row model will get the incorrect rows. For example consider the following
    scenario:
<ol>
    <li>The grid asks for rows 0 to 99 (ie first block of 100 rows) and these get read from a database.</li>
    <li>Another application inserts a row at index 50.</li>
    <li>The grid asks for rows 100 to 199 (the second block of 100 rows) and again these get read from the database.</li>
</ol>
In this scenario the grid will have the last row in the first block appear again as the first row in the second
block. This is because the row was at index 99 before the insert and then at index 100 after the insert.
</p>

<p>
    For this reason it is best use Server-side row model on data that is not changing, or a snapshot of the data.
</p>

<h2>Updating Row Data</h2>
<p>
    It's possible to directly update row data without having to fetch data from the server.
</p>

<p>
    The following code snippet outlines the general approach; iterate through all loaded row nodes and then update
    them directly using <code>rowNode.setData(data)</code>:
</p>

<snippet>
gridOptions.api.forEachNode(function(rowNode) {

    if (idsToUpdate.indexOf(rowNode.data.id) >= 0) {
        // arbitrarily update some data
        var updated = rowNode.data;
        updated.gold += 1;

        // directly update data in rowNode
        rowNode.setData(updated);
    }
});
</snippet>

<note>
    Setting row data will NOT change the row node ID - so if using getRowNodeId() and the data changes such that the ID
    will be different, the rowNode will not have it's ID updated.
</note>

<p>
    The example below shows this in action where the following can be noted:
</p>

<ul class="content">
    <li><b>Update Selected Rows</b> - will update the medal count directly on the row nodes and then invoke the mock
        server with the updated rows.
    <li><b>Purge Caches</b> - will clear all loaded data and force a reload. Notice that the previously updatad data
        will be returned from the server.</li>
</ul>

<?= example('Updating Row Data', 'updating-row-data', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>


<h2>CRUD</h2>
<p>
    The Server-side Row Model acts as a cache against the original store of data which typically
    resides on the server-side of an application. To add or remove records, the pattern is to update
    the original data set (typically on the server) and then get the Server-side Row Model to
    refresh.
</p>

<p>
    The example below shows this in action where the following can be noted:
</p>

    <ul class="content">
        <li>The <b>Add Row</b> will add a row before the currently selected row.</li>
        <li>The <b>Remove Row</b> will remove the currently selected row.</li>
        <li>All operations are done outside of the grid and the grid is then told to refresh.</li>
    </ul>

<?= example('Server-side Row Model & CRUD', 'crud', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>