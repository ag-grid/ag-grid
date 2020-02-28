<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Cache Configuration </h1>

<p class="lead">
    This section describes the Server-side Datasource and demonstrates how it can be used to lazy load data from a
    server through an infinite scroll.
</p>

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

<h2>Configurations</h2>

<p>
    Applications can fine tune the Server-side Row Model based on specific application requirements using the following
    configurations:
</p>

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

<h2>Example - Block Load Debounce</h2>

<p>
    The example below demonstrates lazy loading of data with an infinite scroll. Notice the following:
</p>

<ul class="content">
    <li>The Server-side Row Model is selected using the grid options property: <code>rowModelType = 'serverSide'</code>.</li>
    <li>A datasource is registered with the grid using: <code>api.setServerSideDatasource(datasource)</code>.</li>
    <li>When scrolling down there is a delay when more rows are fetched from the server.</li>
</ul>

<?= grid_example('Block Load Debounce', 'block-load-debounce', 'generated', array("enterprise" => 1, "processVue" => true)) ?>


<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
     <a href="../javascript-grid-server-side-model-sort-filter/">Server-side Sorting / Filtering</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
