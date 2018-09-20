<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Row Height </h1>

<p class="lead">
    Learn how to set Row Heights when using the Server-side Row Model.
</p>

<h2>Dynamic Row Height</h2>

<p>
    To enable <a href="../javascript-grid-row-height/#">Dynamic Row Height</a> when using the Server-side Row Model you need to provide an implementation
    for the 'getRowHeight' Grid Options property. This is demonstrated in the example below:
</p>

<?= example('Dynamic Row Height Example', 'dynamic-row-height', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<note>
    Purging the cache and dynamic row heights do not work together for the Server-side Row Model.
    If you are using dynamic row height, ensure 'maxBlocksInCache' is not set.
</note>

<h2>Auto Row Height</h2>

<p>
    To have the grid calculate the row height based on the cell contents, set <code>autoHeight=true</code>
    on columns that require variable height. The grid will calculate the height once when the data is loaded
    into the grid.
</p>

<p>
    This is different to the <a href="../javascript-grid-client-side-model/">Client-side Row Model</a> where the
    grid height can be changed. For Server-side Row Model the row height cannot be changed once it is set.
</p>

<p>
    In the example below, the following can be noted:
    <ul>
        <li>All top level groups are the same height.</li>
        <li>All bottom level rows are auto-sized based on the contents of the Auto A, Auto B and Auto C columns.</li>
        <li>All columns with auto-size have CSS <code>white-space: normal</code> to wrap the text.</li>
    </ul>
</p>

<?= example('Auto Row Height Example', 'auto-row-height', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<note>
    Purging the cache and auto row heights do not work together for the Server-side Row Model.
    If you are using auto row height, ensure 'maxBlocksInCache' is not set.
</note>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-tree-data/">Server-side Tree Data</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>