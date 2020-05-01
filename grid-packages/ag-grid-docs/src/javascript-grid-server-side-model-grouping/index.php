<?php
$pageTitle = "Server-Side Row Model - Row Grouping";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Row Grouping</h1>

<p class="lead">
    This section covers Server-Side Row Grouping.
</p>

<h2>Enabling Row Grouping</h2>

<p>
    Row Grouping is enabled in the grid via the <code>rowGroup</code> column definition attribute. The example below
    shows how to group rows by 'country':
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'sport' },
        { field: 'year' },
    ],

    // other options
}
SNIPPET
) ?>

<p>
    For more configuration details see the section on <a href="../javascript-grid-grouping">Row Grouping</a>.
</p>

<h2>Row Grouping on the Server</h2>

<p>
    The actual grouping of rows is performed on the server when using the Server-Side Row Model. When the grid needs
    more rows it makes a request via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-Side Datasource</a> with
    metadata containing pivoting details.
</p>

<p>
    The properties relevant to row grouping in the request are shown below:
</p>

<?= createSnippet(<<<SNIPPET
// IServerSideGetRowsRequest
{
    // row group columns
    rowGroupCols: ColumnVO[];

    // what groups the user is viewing
    groupKeys: string[];

    ... // other params
}
SNIPPET
, 'ts') ?>

<p>
    Note in the snippet above that <code>rowGroupCols</code> contains all the columns (dimensions) the grid is grouping
    on, e.g. 'Country', 'Year', and <code>groupKeys</code> contains the list of group keys selected, e.g. <code>['Argentina', 2012]</code>.
</p>

<h2>Example: Server-Side Row Grouping</h2>

<p>
    The example below demonstrates server-side Row Grouping. Note the following:
</p>

<ul class="content">
    <li>
        <b>Country</b> and <b>Sport</b> columns have <code>rowGroup=true</code> defined on their column definitions.
    </li>
    <li>
        The <code>rowGroupCols</code> and <code>groupKeys</code> properties in the request are used by the server
        to perform grouping.
    </li>
    <li>
        Open the browser's dev console to view the request supplied to the datasource.
    </li>
</ul>

<?= grid_example('Row Grouping', 'row-grouping', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<note>
    <p>
        The example above also demonstrates <a href="../javascript-grid-server-side-model-sorting/">Sorting</a> with groups.
        When the grid sort changes, only impacted rows will be reloaded. For example, if 'Sport' groups are expanded, sorting
        on the 'Year' column won't cause the top level 'Country' groups to reload, but sorting on the 'Gold' column will.
    </p>
    <p>
        To avoid this and always refresh top level groups regardless of which column is sorted,
        set the grid property <code>serverSideSortingAlwaysResets=true</code>.
    </p>
</note>


<h2>Group Caches</h2>

<p>
    The <a href="../javascript-grid-server-side-model-configuration/#server-side-cache">Server-Side Cache</a> has already
    been covered, however it is important to note that when rows are grouped each group node contains a cache. This is
    illustrated in the following diagram:
</p>

<p>
    <img src="groupCache.png" width="100%" height="100%" style="border: 1px  grey"/>
</p>

<p>
    When a group node is expanded, such as 'Australia' above, a cache will be created and blocks containing rows will be
    loaded via the <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-Side Datasource</a>.
</p>

<h2>Providing Child Counts</h2>

<p>
    By default, the grid will not show row counts beside the group names. If you do want
    row counts, you need to implement the <code>getChildCount()</code> callback for the
    grid. The callback provides you with the row data; it is your application's responsibility
    to know what the child row count is. The suggestion is you set this information into
    the row data item you provide to the grid.
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    getChildCount = function(data) {
        // here child count is stored in the 'childCount' property
        return data.childCount;
    },

    // other options
}
SNIPPET
) ?>

<?= grid_example('Child Counts', 'child-counts', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

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

<?= grid_example('Purging Caches', 'purging-caches', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

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
    params.successCallback(response.rowsThisBlock, response.lastRow);

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
    <li>Clicking the 'Purge Caches' button reloads data. Notice that the group state has been preserved.</li>
</ul>

<?= grid_example('Preserve Group State', 'preserve-group-state', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Complex Columns</h2>

<p>
    It is possible the data provided has composite objects, in which case it's more difficult for the grid
    to extract group names. This can be worked with using value getters or embedded fields
    (i.e. the field attribute has dot notation).
</p>

<p>
    In the example below, all rows back are modified so that the rows looks something like this:
</p>

<?= createSnippet(<<<SNIPPET
// sample contents of row data
{
    // country field is complex object
    country: {
        name: 'Ireland',
        code: 'IRE'
    },

    // year field is complex object
    year: {
        name: '2012',
        shortName: "'12"
    },

    // other fields as normal
    ...
}
SNIPPET
) ?>

<p>
    Then the columns are set up so that country uses a <code>valueGetter</code> and year uses a field
    with dot notation, i.e. <code>year.name</code>
</p>

<?= grid_example('Complex Objects', 'complex-objects', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to perform <a href="../javascript-grid-server-side-model-pivoting/">Server-Side Pivoting</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
