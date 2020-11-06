<?php
$pageTitle = "Server-Side Row Model - CRUD Operations";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Updating Data</h1>

<p class="lead">
    It is possible to manage data updates using the Server-Side Row Model (SSRM).
</p>

<p>
    The options available for doing updates depends on what
    <a href="../javascript-grid-server-side-model-row-stores/">Row Store</a> is
    used. The options are as follows:
</p>

<table class="table properties">
    <tr>
        <th>Update Type</th>
        <th>Description</th>
        <th>Supported Store</th>
    </tr>
    <tr>
        <td>Single Row</td>
        <td>Update attributes of a single row.</td>
        <td>Partial & Full</td>
    </tr>
    <tr>
        <td>Transaction</td>
        <td>Add, remove and update rows in the grid.</td>
        <td>Full Only</td>
    </tr>
    <tr>
        <td>High Frequency</td>
        <td>Apply transactions at high speed.</td>
        <td>Full Only</td>
    </tr>
</table>

<ul>
    <li>
        <b>Update Single Row</b>:
        This means changing an attribute for a particular row.
    </li>
    <li>
        <b>Update Transactions</b>:
        This means adding, removing or updating rows.
    </li>
    <li>
        <b>High Frequency</b>:
        This means adding, removing or updating rows at high frequency.
    </li>
</ul>

<h2>Partial Store Updates</h2>

<p>
    If using the Partial Store, then it is not possible to insert or remove rows from the set provided
    to the grid. The only update option is <a href="#single-row">Single Row</a> updates which is explained
    below.
</p>
<p>
    The reason inserts and removes are not allowed is because doing inserts or removes would impact the
    block boundaries. For example support a block of 100 rows is read back from the server and
    you try to insert 10 rows into the middle of the block - this would result in 10 rows falling
    off the end of the block as they get pushed out. Similarly if rows were remove, rows would
    be missing from the end of the block.
</p>
<p>
    If you do need to insert or remove rows while using the Partial Store, then the update needs
    to be done on the server and then have the grid refresh. The example
    <a href="#update-and-refresh">Update & Refresh</a> below demonstrates this.
</p>

<h2>Full Store Updates</h2>

<p>
    If using the Full store, then you can update using <a href="#single-row">Single Row</a>
    and <a href="#update-and-refresh">Update & Refresh</a> just like the Partial Store.
</p>

<p>
    On top of that, you can also update using
    <a href="../javascript-grid-server-side-model-transactions/">Transactions</a> and
    <a href="../javascript-grid-server-side-model-high-frequency/">High Frequency</a> Transactions.
</p>

<h2 id="single-row">Single Row Updates</h2>

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
    <li><b>Refresh Store</b> - will clear all loaded data and force a reload. Notice that the previously updated data
        will be returned from the server.</li>
</ul>

<?= grid_example('Updating Row Data', 'updating-row-data', 'generated', ['enterprise' => true, 'extras' => ['lodash'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2 id="update-and-refresh">Update & Refresh</h2>

<p>
    The Partial Store acts as a cache against the original store of data which typically
    resides on the server-side of an application. To add or remove records when using the Partial
    Store, the pattern is to update the original dataset (typically on the server) and then get the
    Partial Store to refresh.
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

<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to perform <a href="../javascript-grid-server-side-model-transactions/">Transactions</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
