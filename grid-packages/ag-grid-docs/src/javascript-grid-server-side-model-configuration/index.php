<?php
$pageTitle = "Server-Side Row Model - Configuration";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Configuration</h1>

<p class="lead">
    This section covers the Server-Side Row Model (SSRM) configuration options.
</p>

<h2>SSRM Grid Properties</h2>

<p>
    Applications can fine-tune the Server-Side Row Model based on specific application requirements using the following
    configurations:
</p>

<?php createDocumentationFromFile('../javascript-grid-properties/properties.json', 'serverSideRowModel') ?>

<h2>Debug Info</h2>

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

<h2>Custom Infinite Store</h2>

<p>
    The example below shows a customised SSRM using the Infinite Store.
    Note the following:
</p>

<ul>
    <li>
        The grid property <code>serverSideStoreType = infinite</code>,
        which gets the Infinite Store to be used. The grid loads rows one block at a time
        as the user scrolsl down.
    </li>
    <li>
        The grid property <code>cacheBlockSize = 50</code>. This sets the block
        size to 50, thus rows are read back 50 at a time.
    </li>
    <li>
        The grid property <code>maxBlocksInCache = 2</code>. This means the grid
        will keep two blocks in memory only. To see this in action, scroll past row 100 (which will
        require a third block to be loaded), then quickly scroll back to the start and you will
        observe the first block needs to be reloaded.
    </li>
    <li>
        The grid property <code>rowBuffer = 0</code>. This means the grid will not render
        any rows outside the vertical scroll. This is good for demonstrating this example,
        as otherwise the loading could appear outside of the visible area and make the example
        more difficult to understand. See
        <a href="../javascript-grid-dom-virtualisation/">DOM Virtualisation</a> for more information
        on setting the <code>rowBuffer</code> property.
    </li>
</ul>

<?= grid_example('Custom Infinite', 'custom-infinite', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h2>Custom Loading Debounce</h2>

<p>
    The example below demonstrates debouncing the block loading.
    Note the following:
</p>

<ul class="content">
    <li>
        The response from the server sets the <code>rowCount</code> property so that the
        vertical scrollbars bounds are set such that the entire dataset can be scrolled through.
        In other words, infinite scrolling is turned off, however rows are still loaded in blocks.
    </li>
    <li>
        <code>blockLoadDebounceMillis = 1000</code> - loading of blocks is delayed by <code>1000ms</code>. This
        allows for skipping over blocks when scrolling to advanced positions.
    </li>
    <li>The grid property <code>debug = true</code>. This means the browser's dev console will show loading block details.</li>
</ul>

<?= grid_example('Block Loading Debounce', 'block-load-debounce', 'generated', ['enterprise' => true, 'modules' => ['serverside', 'menu', 'columnpanel']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
     <a href="../javascript-grid-server-side-model-sorting/">Server-Side Sorting</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
