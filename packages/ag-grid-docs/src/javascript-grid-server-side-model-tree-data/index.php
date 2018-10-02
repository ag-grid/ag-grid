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

<p>
    An example of a Tree Data json structure is shown below:
</p>

<snippet>
[{
    "employeeId": 101,
    "employeeName": "Erica Rogers",
    "jobTitle": "CEO",
    "employmentType": "Permanent",
    "children": [
        {
        "employeeId": 102,
        "employeeName": "Malcolm Barrett",
        "jobTitle": "Exec. Vice President",
        "employmentType": "Permanent",
        "children": [
            {
            "employeeId": 103,
            "employeeName": "Leah Flowers",
            "jobTitle": "Parts Technician",
            "employmentType": "Contract"
            },
            {
            "employeeId": 104,
            "employeeName": "Tammy Sutton",
            "jobTitle": "Service Technician",
            "employmentType": "Contract"
            }
         ]},
    ]}
}]
</snippet>

<p>
    However it is expected that the data will be too large to send over the network, so it will be lazy-loaded as more
    children are requested when group nodes are expanded.
</p>

<h2 id="tree-data-mode">Tree Data Mode</h2>

<p>
    In order to set the grid to work with Tree Data, simply enable Tree Data mode via the Grid Options using:
    <code>gridOptions.treeData = true</code>.
</p>

<h2 id="supplying-tree-data">Supplying Tree Data</h2>

<p>
    Tree Data is supplied via the <a href="../javascript-grid-server-side-model/#server-side-datasource">Server-side Datasource</a>
    just like flat data, however there are two additional gridOptions callbacks; <code>isServerSideGroup(dataItem)</code> and <code>getServerSideGroupKey(dataItem)</code>.
</p>

<p>
    The following code snippet shows the relevant <code>gridOptions</code> entries for configuring tree data with the server-side
    row model:
</p>

<snippet>
var gridOptions = {

    // choose Server-side Row Model
    rowModelType: 'serverSide',

    // enable Tree Data
    treeData: true,

    // indicate if row is a group node
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
        <li>Tree Data is enabled with the Server-side Row Model <code>gridOptions.treeData = true</code>.</li>
        <li>Group nodes are determined using the callback: <code>gridOptions.isServerSideGroup()</code>.</li>
        <li>Group keys are returned from the callback: <code>gridOptions.getServerSideGroupKey()</code>.</li>
    </ul>

<?= example('Tree Data', 'tree-data', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<note>
    The examples on this page use simple method for expanding group nodes, however a better approach is covered in the
    section <a href="../javascript-grid-server-side-model-grouping/#preserving-group-state">Preserving Group State</a>.
</note>

<h2>Purging Tree Data</h2>

<p>
    Tree Data can be automatically purged by setting the
    <a href="../javascript-grid-server-side-model-infinite/#cache-configuration">Cache Configuration</a> appropriately.
    However sometimes it may be necessary to perform a manual purge.
</p>

<p>
    This is achieved using the same approach covered in the previous
    <a href="../javascript-grid-server-side-model-grouping/#purging-groups">Purging Groups</a> section.
</p>

<p>
    The example below shows this in action where the following can be noted:
</p>

<ul class="content">
    <li>Click <b>Purge Everything</b> to clear all caches by calling: <code>gridOptions.api.purgeServerSideCache([])</code>.</li>
    <li>Click <b>Purge ['Kathryn Powers','Mabel Ward']</b> to clear a single cache by calling: <code>gridOptions.api.purgeServerSideCache(['Kathryn Powers','Mabel Ward'])</code>.</li>
</ul>


<?= example('Purging Tree Data', 'purging-tree-data', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-changing-columns/">Changing Columns</a>
    using the Server-side Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>