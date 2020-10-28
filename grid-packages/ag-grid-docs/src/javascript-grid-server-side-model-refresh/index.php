<?php
$pageTitle = "Server-Side Row Model - Store Refresh";
$pageDescription = "Refreshing stores gets the grid to reload data for a particualar store.";
$pageKeywords = "ag-Grid Server-Side Store Refresh";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Refresh</h1>

<p class="lead">
    It is possible to get the grid to refresh any grouping level. This is useful
    if the data has changed and you want to do a complete refresh.
</p>

<p>
    The grid has the following API's to assist with refreshing:
</p>

<table class="table reference">
    <tr>
        <th>Method</th>
        <th>Description</th>
    </tr>
    <tr id="api-purge-virtual-page-cache">
        <th>refreshServerSideStore(params)</th>
        <td><p>Refresh part of the grid's data. If you pass no parameters, then the top level cache is purged. To
            purge a child cache, pass in the string of keys to get to the child cache.
            For example, to purge the cache two levels down under 'Canada' and then '2002', pass
            in the string array <code>['Canada','2002']</code>. If you purge a cache, then all row nodes
            for that cache will be reset to the closed state, and all child caches will be destroyed.</p></td>
    </tr>
    <tr id="api-get-virtual-page-state">
        <th>getCacheBlockState()</th>
        <td>
            Returns an object representing the state of the cache. This is useful for debugging and understanding
            how the cache is working.</td>
    </tr>
</table>

<p>
    The <code>params</code> for <code>refreshServerSideStore</code> is as follows:
</p>
<?= createSnippet(<<<SNIPPET
interface RefreshStoreParams {

    // List of group keys, pointing to the store to refresh.
    // For example, to purge the cache two levels down under 'Canada'
    // and then '2002', pass in the string array ['Canada','2002'].
    // If no route is passed, or an empty array, then the top level store is refreshed.
    route?: string[];

    // If true, then all rows at the level getting refreshed are destroyed
    // and 'loading' rows appear, to signal to the user that loading is taking place.
    // If false, then loading will happen in the background and data will be updated
    // immediatly once loading has complete without showing any loading rows.
    showLoading?: boolean;
}
SNIPPET
) ?>

<p>
    The following example demonstrates the refresh API. The following can be noted:
</p>

<ul class="content">
    <li>
        Button <b>Refresh Everything</b> refreshes the top level store. Note the Version column has changed it's value.
    </li>
    <li>
        Button <b>Refresh [Canada]</b> refreshes the Canada cache only. To see this in action, make sure you have
        Canada expanded. Note the Version column has changed it's value.
    </li>
    <li>
        Button <b>Refresh [Canada,2002]</b> refreshes the 2002 cache under Canada only. To see this in action, make
        sure you have Canada and then 2002 expanded. Note the Version column has changed it's value.
    </li>
    <li>
        Button <b>Print Block State</b> prints the state of the blocks in the cache to the console.
    </li>
    <li>
        Toggle <b>Show Loading</b> to change whether loading rows are shown or not during the refresh.
    </li>
</ul>

<?= grid_example('Refresh Store', 'refresh-store', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Preserving Group State</h2>

<p>
    It may be necessary to expand groups to a desired initial state or to restore the grid to a previous state after
    purging / reloading data.
</p>

<p>
    This can be achieved by expanding row nodes as blocks are loaded in the
    <a href="../javascript-grid-server-side-model-datasource/">Server-Side Datasource</a>. The following
    snippet outlines a possible approach:
</p>

<?= createSnippet(<<<SNIPPET
function getRows(params) {
    // 1) get data from server
    var response = getServerResponse(params.request);

    // 2) call the success callback
    params.success({rowData: response.rowsThisBlock});

    // 3) to preserve group state we expand any previously expanded groups for this block
    rowsInThisBlock.forEach(function(row) {
        if (expandedGroupIds.indexOf(row.id) > -1) {
            gridOptions.api.getRowNode(row.id).setExpanded(true);
        }
    });
}
SNIPPET
) ?>

<p>
    Notice that in step 3, newly loaded row nodes for the current block are expanded if they are defined in <code>expandedGroupIds</code>,
    which is an array of group keys maintained by the application. This will have a cascading effect as expanding a
    group will cause new block(s) to load.
</p>

<p>
    In order to easily look up group row nodes, implementing the following callback is recommended: <code>gridOptions.getRowNodeId()</code>.
</p>

<p>
    In the example below, the following can be noted:
</p>

<ul>
    <li>The grid has an initial expanded group state where:
        <code>expandedGroupIds = ['Russia', "Russia-2002", "Ireland", 'Ireland-2008']</code></li>
    <li>The group state is updated in <code>expandedGroupIds</code> by using listening to the grid event: <code>RowGroupOpened</code>.</li>
    <li>Clicking the 'Refresh' button reloads data. Notice that the group state has been preserved.</li>
</ul>

<?= grid_example('Preserve Group State', 'preserve-group-state', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
