<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Infinite Scroll </h1>

<p class="lead">
    This section introduces the Server-side Row Model with lazy loading of data fetched through an infinite scroll.
</p>

<p>
    As a gentle introduction to the Server-side Row Model, this section will cover the simplest use case of infinite
    scrolling without any grouping, filtering, sorting or pivoting.
</p>

<h2>Enabling Server-side Row Model</h2>

<p>
    By default the grid will use the <a href="../javascript-grid-client-side-model/">Client-side Row Model</a>, so
    to enable the Server-side Row Model define the <code>rowModelType</code> as follows:
</p>

<snippet>
    gridOptions.rowModelType = 'serverSide'
</snippet>


<h2>Implementing the Server-side Datasource</h2>

<p>
    The previous section outlined the interfaces associated with the <a href="../javascript-grid-server-side-model/#server-side-datasource">Server-side Datasource</a>.
    The following snippet outlines how to implement a <code>ServerSideDatasource</code> and then register it with the grid:
</p>

<snippet>
// create ServerSideDatasource with a reference to your server
function ServerSideDatasource(server) {
    this.server = server;
}

ServerSideDatasource.prototype.getRows = function(params) {
    // invoke your server with request params supplied by grid
    var response = server.getResponse(params.request);

    if (response.success) {
        // call the success callback
        params.successCallback(response.rows, response.lastRow);
    } else {
        // inform the grid the request failed
        params.failCallback();
    }
};

// register Server-side Datasource with the grid
var server = getServer();
var datasource = new ServerSideDatasource(server);
gridOptions.api.setServerSideDatasource(datasource);
</snippet>

<h2>Server-side Cache</h2>

<p>
    At the heart of the Server-side Row Model lies the Server-side Cache. When there are no row groups, like in the
    example covered in this section, a single cache will be associated with the root level node.
</p>

<p>
    When the grid loads it will retrieve an initial number (as per configuration) of blocks containing rows. As the user
    scrolls down, more blocks will be loaded via the server-side datasource.
</p>

<p>
    The following illustration shows how the grid arranges rows in blocks which are in turn contained in a cache:
</p>

<p>
    <img src="serverSideCache.png" width="75%" height="75%" style="border: 1px  grey"/>
</p>

<p>
    To control the browser memory footprint, server-side blocks and their containing caches are lazy-loaded, and can
    be configured to purge automatically or manually via API calls.
</p>

<h2>Cache Configuration</h2>

<table class="table reference">
    <tr>
        <th>Property</th>
        <th>Description</th>
    </tr>
    <tr id="property-overflow-size">
        <th>cacheOverflowSize</th>
        <td>
            <p>When infinite scrolling is active, this says how many rows beyond the current last row
                the scrolls should allow to scroll. For example, if 200 rows already loaded from server,
                and overflowSize is 50, the scroll will allow scrolling to row 250. Default is 1.</p>
        </td>
    </tr>
    <tr id="property-max-concurrent-requests">
        <th>maxConcurrentDatasourceRequests</th>
        <td><p>How many requests to hit the server with concurrently. If the max is reached, requests are queued.
                Default is 1, thus by default, only one request will be active at any given time.</p></td>
    </tr>
    <tr id="property-max-blocks-in-cache">
        <th>maxBlocksInCache</th>
        <td>
            <p>How many blocks to cache in the client. Default is no limit, so every requested
                block is kept. Use this if you have memory concerns, so blocks least recently viewed are purged.
                If used, make sure you have enough blocks in the cache to display one whole view of the table
                (ie what's within the scrollable area), otherwise it won't work and an infinite loop of
                requesting blocks will happen.</p>
        </td>
    </tr>
    <tr id="property-pagination-initial-row-count">
        <th>infiniteInitialRowCount</th>
        <td>
            <p>How many rows to initially allow the user to scroll to. This is handy if you expect large data sizes
                and you want the scrollbar to cover many blocks before it has to start readjusting for the loading of
                additional data.</p>
        </td>
    </tr>
    <tr id="property-infinite-block-size">
        <th>cacheBlockSize</th>
        <td>
            <p>How many rows for each block in the cache.</p>
        </td>
    </tr>

    <tr id="property-infinite-purge-closed-row-nodes">
        <th>purgeClosedRowNodes</th>
        <td>
            <p>When enabled, closing group row nodes will purges all caches beneath closed row nodes. This property only
            applies when there is <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a>.</p>
        </td>
    </tr>

    <tr id="property-infinite-purge-closed-row-nodes">
        <th>serverSideSortingAlwaysResets</th>
        <td>
            <p>When enabled, always refreshes top level groups regardless of which column was sorted. This property only
               applies when there is <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a>.</p>
        </td>
    </tr>



</table>

<h2>Example - Infinite Scroll</h2>

<p>
    The example below demonstrates infinite scrolling along with some of the above configuration options:
</p>

<ul class="content">
    <li><b>Enabling Server-side Row Model: </b> via the grid options property: <code>rowModelType = 'serverSide'</code>.</li>
    <li><b>Lazy-loading:</b> with the grid options property: <code>cacheBlockSize = 100</code> data will be fetched
        in blocks of 100 rows at a time.
    </li>
    <li><b>Auto Purge Cache:</b> to limit the amount of data cached in the grid you can set <code>maxBlocksInCache</code>
    via the gridOptions.</li>
</ul>

<?= example('Infinite Scroll', 'infinite-scroll', 'generated', array("enterprise" => 1)) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to see how to lazy load data with: <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>