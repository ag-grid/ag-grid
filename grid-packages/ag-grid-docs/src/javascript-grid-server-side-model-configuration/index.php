<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Server-side Configuration </h1>

<p class="lead">
    This section covers the Server-side Cache and configurations available in the Server-side Row Model.
</p>

<p>
    As many of the configurations available in the Server-side Row Model relate to the Server-side Cache it important
    to understand how the grid organises data obtained from the server into caches.
</p>

<h2>Server-side Cache</h2>

<p>
    At the heart of the Server-side Row Model lies the Server-side Cache. There is a cache containing the top level
    rows (i.e. on the root node) and for each individual <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a> level.
</p>

<p>
    When the grid loads it will retrieve an initial number (as per configuration) of blocks containing rows. As the user
    scrolls down, more blocks will be loaded via the
    <a href="../javascript-grid-server-side-model-datasource/">Server-side Datasource</a>.
</p>

<p>
    The following illustration shows how the grid arranges rows into blocks which are in turn contained in a cache:
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
    <tr>
        <th>cacheBlockSize</th>
        <td>
            <p>How many rows for each block in the cache, i.e. how many rows returned from the server at a time.
               The default is 100 rows per block.
            </p>
        </td>
    </tr>
    <tr>
        <th>maxBlocksInCache</th>
        <td>
            <p>How many blocks to cache in the client. Default is no limit, so every requested
               block is kept. Use this if you have memory concerns, so blocks least recently viewed are purged.
               If used, make sure you have enough blocks in the cache to display one whole view of the table
               (ie what's within the scrollable area), otherwise it won't work and an infinite loop of
               requesting blocks will happen.</p>
        </td>
    </tr>
    <tr>
        <th>cacheOverflowSize</th>
        <td>
            <p>When infinite scrolling is active, this says how many rows beyond the current last row
                the scrolls should allow to scroll. For example, if 200 rows already loaded from server,
                and overflowSize is 50, the scroll will allow scrolling to row 250. Default is 1.</p>
        </td>
    </tr>
    <tr>
        <th>maxConcurrentDatasourceRequests</th>
        <td><p>How many requests to hit the server with concurrently. If the max is reached, requests are queued.
                Default is 1, thus by default, only one request will be active at any given time.</p></td>
    </tr>
    <tr>
        <th>blockLoadDebounceMillis</th>
        <td>
            <p>Prevents blocks loading until scrolling has stopped. When row count (i.e. lastRowIndex) is known.
                setting his property in millis will enable skipping over blocks when scrolling.</p>
        </td>
    </tr>
    <tr>
        <th>infiniteInitialRowCount</th>
        <td>
            <p>How many rows to initially allow the user to scroll to. This is handy if you expect large data sizes
                and you want the scrollbar to cover many blocks before it has to start readjusting for the loading of
                additional data.</p>
        </td>
    </tr>
    <tr>
        <th>purgeClosedRowNodes</th>
        <td>
            <p>When enabled, closing group row nodes will purges all caches beneath closed row nodes. This property only
            applies when there is <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a>.</p>
        </td>
    </tr>
    <tr>
        <th>serverSideSortingAlwaysResets</th>
        <td>
            <p>When enabled, always refreshes top level groups regardless of which column was sorted. This property only
               applies when there is <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a>.</p>
        </td>
    </tr>
</table>

<h2>Cache Debugging</h2>

<p>
    When experimenting with different configurations it is useful to enable debug mode as follows:
</p>

<snippet>
gridOptions.debug = true;
</snippet>

<p>
    The screenshot below is taken from the browsers dev console when <code>debug</code> is enabled:
</p>

<p>
    <img alt="Server-side Row Model" src="debug.png" style="width: 100%; border: lightgray solid 1px">
</p>

<p>
    Notice that the current cache status is logged showing block details such as the <code>startRow</code> and
    <code>endRow</code>.
</p>

<p> This can be very useful when debugging issues on the server.</p>

<h2>Example - Block Loading Debounce</h2>

<p>
    The example below demonstrates a number of the configurations listed in this section and shows how adding a debounce
    to block loading allows for quick scrolling over rows. Note the following:
</p>

<ul class="content">
    <li><code>cacheBlockSize=200</code> - fetches 200 rows per request instead of 100 by default.</li>
    <li>
        <code>maxBlocksInCache=10</code> - once a cache contains 10 blocks the oldest blocks will be
        purged to ensure the cache is constrained to 10 blocks. By default all blocks are kept.
    </li>
    <li>
        <code>blockLoadDebounceMillis=100</code> - loading of blocks is delayed by <code>100ms</code>. This
        allows for skipping over blocks when scrolling to advanced positions. Note that the last row index
        should be supplied in <code>successCallback(rows, lastRow)</code> so that the scrollbars are sized correctly.
    </li>
    <li><code>debug=true</code> - open the browsers dev console to view the cache status and block details.</li>
</ul>

<?= grid_example('Block Loading Debounce', 'block-load-debounce', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
     <a href="../javascript-grid-server-side-model-sort-filter/">Server-side Sorting / Filtering</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
