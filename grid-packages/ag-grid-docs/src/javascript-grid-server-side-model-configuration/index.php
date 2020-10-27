<?php
$pageTitle = "Server-Side Row Model - Configuration";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Configuration</h1>

<p class="lead">
    This section covers the Server-Side Row Model (SSRM) configuration options.
</p>

<h2>SSRM Grid Properties</h2>

<p>
    Applications can fine-tune the Server-Side Row Model based on specific application requirements using the following
    configurations:
</p>

<?php createDocumentationFromFile('../javascript-grid-properties/properties.json', 'serverSideRowModel') ?>

<h2>Cache Debugging</h2>

<p>
    When experimenting with different configurations it is useful to enable debug mode as follows:
</p>

<?= createSnippet('gridOptions.debug = true;') ?>

<p>
    The screenshot below is taken from the browser's dev console when <code>debug</code> is enabled:
</p>

<p>
    <img alt="Server-Side Row Model" src="debug.png" style="width: 100%; border: lightgray solid 1px">
</p>

<p>
    Notice that the current cache status is logged showing block details such as the <code>startRow</code> and
    <code>endRow</code>.
</p>

<p>This can be very useful when debugging issues on the server.</p>

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
    <li><code>debug=true</code> - open the browser's dev console to view the cache status and block details.</li>
</ul>

<?= grid_example('Block Loading Debounce', 'block-load-debounce', 'generated', ['enterprise' => true, 'modules' => ['serverside', 'menu', 'columnpanel']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
     <a href="../javascript-grid-server-side-model-sorting/">Server-Side Sorting</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
