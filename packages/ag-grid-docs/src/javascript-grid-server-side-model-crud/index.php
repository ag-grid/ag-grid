<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Server-side Row Model </h1>

<p class="lead">
    Learn how to perform CRUD operations using the Server-side Row Model.
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