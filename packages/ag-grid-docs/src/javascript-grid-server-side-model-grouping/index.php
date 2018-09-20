<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Row Grouping </h1>

<p class="lead">
    This section covers Server-side Row Grouping using the Server-side Row Model.
</p>

<p>
    Perhaps the most compelling reason to choose the Server-side Row Model is to achieve lazy-loading of Row Groups.
    This section will continue where <a href="../javascript-grid-server-side-model-infinite/">Infinite Scroll</a> left
    off, to cover a more complex scenario which includes Server-side Row Grouping, Aggregation and Sorting.
</p>

<h2>Group Caches</h2>

<p>
    The <a href="../javascript-grid-server-side-model-infinite/#server-side-cache/">Server-side Cache</a> has already
    been covered, however in when performing Row Grouping it is important to understand that each group node contains
    a cache. This is illustrated in the following diagram:
</p>

<p>
    <img src="groupCache.png" width="100%" height="100%" style="border: 1px  grey"/>
</p>

<p>When a group node is expanded, such as 'Australia' above, a cache will be created and blocks containing rows will be
   loaded via the <a href="../javascript-grid-server-side-model/#server-side-datasource">Server-side Datasource</a>
</p>

<h2>Group Request Parameters</h2>

<p>
    The relevant <code>IServerSideGetRowsRequest</code> parameters for Row Grouping are as follows:
</p>

<snippet>
IServerSideGetRowsRequest {

    // row group columns
    rowGroupCols: ColumnVO[];

    // what groups the user is viewing
    groupKeys: string[];

    ... // other params
}
</snippet>

<p>
    Where <code>rowGroupCols</code> contains all the columns (dimensions) the grid is grouping on, i.e. 'Country', 'Year',
    and <code>groupKeys</code> contains the list of group keys selected, i.e. ['Argentina', 2012].
</p>


<h2>Example - Pre-defined Grouping - Mocked Server</h2>

<p>
    Below shows an example of pre-defined grouping using the olympic winners dataset.
    It is pre-defined as we set the grid with specific columns for row grouping and
    do not allow the user to change this. Then
    the datasource knows that the grid will either be asking for the top level
    country list OR the grid will be looking for winners
    for a particular country.
</p>

<p>
    In your application, your server-side would know where to get the data based
    on what the user is looking for, eg it could go to a relational database
    table to get the list of countries and then a web service to get the winners
    for the country as the user expands the group (a web service to get the winners
    per country is improbable, however the example demonstrates you do not need to
    go to the same datastore for the different levels in the grid).
</p>

<p>
    In the example, the work your server would do is mocked for demonstrations
    purposes (as the online examples are self contained and do not contact any
    servers).
</p>

<p>
    The example demonstrates the following:
</p>
    <ul class="content">
        <li><b>Grouping:</b> The data is grouped by country.</li>
        <li><b>Aggregation:</b> The server always sum's gold, silver and bronze.
            The columns are not set as value columns, and hence the user cannot change
            the aggregation function via the column menu. The server just assumes if grouping,
            then these columns should be aggregated using a sum function.
        </li>
        <li><b>Sorting:</b> The sorting is done on the server-side.
            For example, sort by Athlete, then expand a group and you will
            see Athlete is sorted. </li>
    </ul>

<?= example('Row Grouping', 'row-grouping', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<note>
    When the grid sort changes, only impacted rows will get reloaded. For example if grouping by Country
    and sort by Athlete changes, the top level Country groups will not get reloaded as sorting by Athlete
    will not impact the top level groups.
    To avoid this and always refresh top level groups regardless of which column was sorted,
    set grid property <code>serverSideSortingAlwaysResets = true</code>.
</note>

<h2>Providing Child Counts</h2>

<p>
    By default, the grid will not show row counts beside the group names. If you do want
    row counts, you need to implement the <code>getChildCount()</code> callback for the
    grid. The callback provides you with the row data, it is your applications responsibility
    to know what the child row count is. The suggestion is you set this information into
    the row data item you provide to the grid.
</p>

<snippet>
gridOptions.getChildCount = function(data) {
    // in this example, the data has the child count
    // stored in the attribute 'childCount'.
    return data.childCount;
};
</snippet>


<h2>Purging Groups</h2>

<p>
    The grid has the following API to allow you to interact with the server-side cache.
</p>

<table class="table reference">
    <tr>
        <th>Method</th>
        <th>Description</th>
    </tr>
    <tr id="api-purge-virtual-page-cache">
        <th>purgeServerSideCache(route)</th>
        <td><p>Purges the cache. If you pass no parameters, then the top level cache is purged. To
                purge a child cache, then pass in the string of keys to get to the child cache.
                For example, to purge the cache two levels down under 'Canada' and then '2002', pass
                in the string array ['Canada','2002']. If you purge a cache, then all row nodes
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
    Below shows the API in action. The following can be noted:
</p>

<ul class="content">
    <li>
        Button <b>Purge Everything</b> purges the top level cache.
    </li>
    <li>
        Button <b>Purge [Canada]</b> purges the Canada cache only. To see this in action, make sure you have
        Canada expanded.
    </li>
    <li>
        Button <b>Purge [Canada,2002]</b> purges the 2002 cache under Canada only. To see this in action, make
        sure you have Canada and then 2002 expanded.
    </li>
    <li>
        Button <b>Print Block State</b> prints the state of the blocks in the cache to the console.
    </li>
    <li>
        The example implements <code>getChildCount()</code> to set the child count for each group.
        Your application is responsible for figuring out the child count (maybe it's an attribute you set
        on the data?), the example sets a random number.
    </li>
</ul>

<?= example('Purging Caches', 'purge', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<h2>Preserving Group State</h2>

<p>
    It may be necessary to expand groups to a desired initial state or to restore the grid to a previous state after
    purging / reloading data.
</p>

<p>
    This can be achieved by expanding row nodes as blocks are loaded in the
    <a href="../javascript-grid-server-side-model/#server-side-datasource/">Server-side Datasource</a>. The following
    snippet outlines a possible approach:
</p>

<snippet>
function getRows(params) {
    // 1) get data from server
    var response = getServerResponse(params.request);

    // 2) call the success callback
    params.successCallback(response.rowsThisBlock, response.lastRow);

    // 3) to preserve group state we expand any previously expanded groups for this block
    rowsInThisBlock.forEach(row => {
        if (expandedGroupIds.indexOf(row.id) > -1) {
            gridOptions.api.getRowNode(row.id).setExpanded(true);
        }
    });
}
</snippet>

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
<ul>
    <li>The grid has an initial expanded group state where:
        <code>expandedGroupIds = ["Russia", "Russia-2002", "Ireland", "Ireland-2008"]</code></li>
    <li>The group state is updated in <code>expandedGroupIds</code> by using listening to the grid event: <code>RowGroupOpened</code>.</li>
    <li>Clicking the 'Purge Caches' button reloads data. Notice that the group state has been preserved.</li>
</ul>
</p>

<?= example('Preserve Group State', 'preserve-group-state', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>


<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to perform <a href="../javascript-grid-server-side-model-pivoting/">Server-side Pivoting</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>