<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Tree Data </h1>

<p class="lead">
    This section shows how Tree Data can be used with the Server-side Row Model.
</p>

<h2>Tree Data</h2>
<p>
    Tree Data is defined as data that has parent / child relationships where the parent / child relationships
    are provided as part of the data.
</p>

<h2 id="tree-data-mode">Tree Data Mode</h2>

<p>
    In order to set the grid to work with Tree Data, simply enable Tree Data mode via the Grid Options using:
    <code>gridOptions.treeData = true</code>.
</p>

<h2 id="supplying-tree-data">Supplying Tree Data</h2>

<p>
    Tree Data is supplied via the <a href="../javascript-grid-server-side-model/#server-side-datasource">Server-side Datasource</a>
    just like flat data, however there two additional gridOptions callbacks; <code>isServerSideGroup(dataItem)</code> and <code>getServerSideGroupKey(dataItem)</code>.
</p>

<p>
    The configuration used The code snippet below shows the <code>gridOptions</code> relevant for configuring tree data with the server-side
    row model.
</p>

<snippet>
var gridOptions = {

    // enable tree data
    treeData: true,

    // indicate if row is a group nod
    isServerSideGroup: function (dataItem) {
        return dataItem.group;
    },

    // specify which group key to use
    getServerSideGroupKey: function (dataItem) {
        return dataItem.employeeId;
    }
    ...
}
</snippet>

<note>
    Be careful not to get mixed up with the <a href="../javascript-grid-tree-data/">Client-side Tree Data</a> configurations by mistake.
</note>

    <p>
        The example below shows this in action where the following can be noted:
    </p>

    <ul class="content">
        <li>The <b>Add Row</b> will add a row before the currently selected row.</li>
        <li>The <b>Remove Row</b> will remove the currently selected row.</li>
        <li>All operations are done outside of the grid and the grid is then told to refresh.</li>
    </ul>

<?= example('Tree Data', 'tree-data', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<?= example('Purging Tree Data', 'purging-tree-data', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<?php include '../documentation-main/documentation_footer.php';?>