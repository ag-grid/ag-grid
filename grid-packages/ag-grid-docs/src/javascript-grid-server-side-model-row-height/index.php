<?php
$pageTitle = "Server-Side Row Model - Row Height";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Row Height</h1>

<p class="lead">
    Learn how to set Row Height when using the Server-Side Row Model.
</p>

<h2>Dynamic Row Height</h2>

<p>
    To enable <a href="../javascript-grid-row-height/#">Dynamic Row Height</a> when using the Server-Side Row Model
    you need to provide an implementation for the <code>getRowHeight</code> Grid Options property. This is demonstrated in the example below:
</p>

<?= grid_example('Dynamic Row Height Example', 'dynamic-row-height', 'generated', ['enterprise' => true, 'exampleHeight' => 630, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<note>
    Purging the cache and dynamic row heights do not work together for the Server-Side Row Model.
    If you are using dynamic row height, ensure <code>maxBlocksInCache</code> is not set.
</note>

<h2>Auto Row Height</h2>

<p>
    To have the grid calculate the row height based on the cell contents, set <code>autoHeight=true</code>
    on columns that require variable height. The grid will calculate the height once when the data is loaded
    into the grid.
</p>

<p>
    This is different to the <a href="../javascript-grid-client-side-model/">Client-Side Row Model</a> where the
    grid height can be changed. For Server-Side Row Model the row height cannot be changed once it is set.
</p>

<p>
    In the example below, the following can be noted:
</p>

<ul>
    <li>All top level groups are the same height.</li>
    <li>All bottom level rows are auto-sized based on the contents of the Auto A, Auto B and Auto C columns.</li>
    <li>All columns with auto-size have CSS <code>white-space: normal</code> to wrap the text.</li>
</ul>

<?= grid_example('Auto Row Height Example', 'auto-row-height', 'generated', ['enterprise' => true, 'exampleHeight' => 610, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<note>
    Purging the cache and auto row heights do not work together for the Server-Side Row Model.
    If you are using auto row height, ensure <code>maxBlocksInCache</code> is not set.
</note>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to combine
    <a href="../javascript-grid-server-side-model-master-detail/">Master Detail</a> with the Server-Side Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
