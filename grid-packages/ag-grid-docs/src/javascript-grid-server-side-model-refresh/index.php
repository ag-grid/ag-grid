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

<h2>Refresh API</h2>

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

    // If true, then all rows at the level getting refreshed are destroyed, including
    // their child rows, and 'loading' rows appear, to signal to the user that loading
    // is taking place.
    //
    // If false, then loading will happen in the background and data will be updated
    // immediatly once loading has complete without showing any loading rows.
    purge?: boolean;
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
        Toggle <b>Purge</b> to change whether loading rows are shown or not during the refresh.
    </li>
</ul>

<?= grid_example('Refresh Store', 'refresh-store', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Group State</h2>

<p>
    When a refresh is done, all open groups at the refreshed level along with their
    children may be destroyed depending on the store type and whether the probided
    <code>params.purge=true</code>.
</p>

<h3>Group State - Full Store</h3>

<p>
    The Full Store can keep the state of open groups during a refresh. To do this the grid
    needs to be provided with
    <a href="../javascript-grid-row-node/#application-assigned-ids">Row ID's</a>
    by the application implementing <code>getRowNodeId()</code>.
    This is required to allow the grid to match newly loaded rows with previously loaded rows.
</p>

<p>
    When using the Full Store, if Row ID's are provided and rows are not purged, then
    refreshing rows will keep open groups open and not destroy child rows.
</p>

<table class="table reference">
    <tr>
        <th>Purge</th>
        <th>ID's Provided</th>
        <th>Open Groups</th>
        <th>Child Rows</th>
    </tr>
    <tr>
        <td>No</td>
        <td>Yes</td>
        <td>Kept Open</td>
        <td>Kept</td>
    </tr>
    <tr>
        <td>No</td>
        <td>No</td>
        <td>Closed</td>
        <td>Destroyed</td>
    </tr>
    <tr>
        <td>Yes</td>
        <td>Yes</td>
        <td>Closed</td>
        <td>Destroyed</td>
    </tr>
    <tr>
        <td>Yes</td>
        <td>No</td>
        <td>Closed</td>
        <td>Destroyed</td>
    </tr>
</table>

<p>
    The example below shows refreshing using the Full Store and keeping group state. The
    example is similar to the previous example with the addition <code>getRowNodeId()</code>
    is implemented.
    Note the following:
</p>

<ul>
    <li>
        <p>
            When 'Purge' is not checked, refreshing using any refresh button will maintain
            any open groups and children at that level.
        </p>
        <p>
            For example expand 'United States' and hit 'Refresh Everything' - note that the
            top level countries are refreshed (the version column changes once the load is
            complete) and the open 'United States' group is left open and the child rows
            (displaying year groups) are left intact.
        </p>
    </li>
    <li>
        <p>
            When 'Purge' is checked, refreshing using any refresh button will close all
            open groups and destroy all children at that level.
        </p>
        <p>
            For example expand 'United States' and hit 'Refresh Everything' - note that the
            list of countries is reset, including closing 'United States' and loosing
            all child rows to 'United States'. When 'United States' is expanded again, the
            child rows are loaded again from scratch.
        </p>
    </li>
</ul>

<p>
    Because the grid is getting provided ID's with via <code>getRowNodeId()</code> it allows
    teh grid to update rows rather than replace rows. This also means when grid property
    <code>enableCellChangeFlash = true</code> the cells will flash when their data changes.
    If <code>getRowNodeId()</code> is not implemented, rows are replaced and cells are
    re-created from scratch, no flashing is possible.
</p>

<?= grid_example('Keep Group State', 'keep-group-state', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h3>Group State - Partial Store</h3>

<p>
    If using the Partial Store, the grid does not provide for keeping open groups. Refreshing
    a Partial Store will always reset groups and destroy children.
</p>
<p>
    This is because the Partial Store loads rows in blocks, so it's unreliable to expect rows
    that existed before to exist in the new load, as the row could be appearing in a different
    block.
</p>
<p>
    If you are using the Partial Store and need to restore groups to their previously open
    state, then this logic can be implemented in your application using the
    <a href="../javascript-grid-server-side-model-grouping/#open-by-default">Open by Default</a>
    API.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to perform <a href="../javascript-grid-server-side-model-pivoting/">Pivoting</a>.
</p>


<?php include '../documentation-main/documentation_footer.php';?>
