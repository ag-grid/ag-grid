<?php
$pageTitle = "Server-side Row Model - Configuration";
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

<?php createDocumentationFromFile('../javascript-grid-properties/properties.json', 'serverSideRowModel') ?>

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

<h2>Example: Block Loading Debounce</h2>

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

<?= grid_example('Block Loading Debounce', 'block-load-debounce', 'generated', ['enterprise' => true, 'modules' => ['serverside', 'menu', 'columnpanel']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
     <a href="../javascript-grid-server-side-model-sorting/">Server-side Sorting</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
