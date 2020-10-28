<?php
$pageTitle = "Server-Side Row Model - CRUD Operations";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Updating Data</h1>

<p class="lead">
    Learn how to perform CRUD operations using the Server-Side Row Model.
</p>

<h2>Updating Row Data</h2>

<p>
    It's possible to directly update row data without having to fetch data from the server.
</p>

<p>
    The following code snippet outlines the general approach, to iterate through all loaded row nodes and then update
    them directly using <code>rowNode.setData(data)</code>:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions.api.forEachNode(function(rowNode) {
    if (idsToUpdate.indexOf(rowNode.data.id) >= 0) {
        // arbitrarily update some data
        var updated = rowNode.data;
        updated.gold += 1;

        // directly update data in rowNode
        rowNode.setData(updated);
    }
});
SNIPPET
) ?>

<note>
    Setting row data will NOT change the row node ID, so if you are using <code>getRowNodeId()</code> and the data changes such that the ID
    will be different, the <code>rowNode</code> will not have its ID updated.
</note>

<p>
    The example below shows this in action where the following can be noted:
</p>

<ul class="content">
    <li><b>Update Selected Rows</b> - will update the medal count directly on the row nodes and then invoke the mock
        server with the updated rows.
    <li><b>Purge Caches</b> - will clear all loaded data and force a reload. Notice that the previously updated data
        will be returned from the server.</li>
</ul>

<?= grid_example('Updating Row Data', 'updating-row-data', 'generated', ['enterprise' => true, 'extras' => ['lodash'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>CRUD</h2>

<p>
    The Server-Side Row Model acts as a cache against the original store of data which typically
    resides on the server-side of an application. To add or remove records, the pattern is to update
    the original dataset (typically on the server) and then get the Server-Side Row Model to
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

<?= grid_example('Server-Side Row Model & CRUD', 'crud', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
