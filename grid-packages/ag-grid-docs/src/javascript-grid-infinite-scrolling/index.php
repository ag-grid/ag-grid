<?php
$pageTitle = "ag-Grid Row Models: Infinite Scrolling";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Infinite Row Model allows the grid to lazy load rows from the server dependent on scroll position.";
$pageKeywords = "ag-Grid Infinite Scrolling";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1>Infinite Row Model</h1>

<note>
    If you are an Enterprise user you should consider using the <a href="../javascript-grid-server-side-model/">Server-Side Row Model</a>
    instead of the Infinite Row Model. It offers the same functionality with many more features.<br /><br />
    The differences between row models can be found in our <a href="../javascript-grid-row-models/">row models summary page</a>.
</note>

<p>
    Infinite scrolling allows the grid to lazy-load rows from the server depending on what
    the scroll position is of the grid. In its simplest form, the more the user scrolls
    down, the more rows get loaded.
</p>

<p>
    The grid will have an 'auto extending' vertical scroll. That means as the scroll reaches
    the bottom position, the grid will extend the height to allow scrolling even further down,
    almost making it impossible for the user to reach the bottom. This will stop happening
    once the grid has extended the scroll to reach the last record in the table.
</p>

<h2>How it Works</h2>

<p>
    The grid will ask your application, via a datasource, for the rows in blocks.
    Each block contains a subset of rows of the entire
    dataset. The following diagram is a high-level overview.
</p>

<p>
    <img src="high-level.png" alt="high-level" class="img-fluid"/>
</p>

<p>
    When the grid scrolls to a position where there is no corresponding block of rows loaded, the model
    uses the provided datasource to get the rows for the requested block.
    In the diagram, the datasource is getting the rows from a database in a remote server.
</p>

<h2>Turning On Infinite Scrolling</h2>

<p>
    To turn on infinite scrolling, you must a) set the grid property <code>rowModelType</code> to <code>'infinite'</code> and b) provide a datasource.
</p>

<?= createSnippet(<<<SNIPPET
// before grid initialised
gridOptions.rowModelType = 'infinite';
gridOptions.datasource = myDataSource;

// after grid initialised, you can set or change the datasource
gridOptions.api.setDatasource(myDataSource);
SNIPPET
) ?>

<h2>Datasource</h2>

<p>
    A datasource must be provided to do infinite scrolling. You specify the datasource as a grid property
    or using the grid API.
</p>

<?= createSnippet(<<<SNIPPET
// set as a property
gridOptions.datasource = myDatasource;

// or use the api after the grid is initialised
gridOptions.api.setDatasource(myDatasource);
SNIPPET
) ?>

<h3>Changing the Datasource</h3>

<p>
    Changing the datasource after the grid is initialised will reset the infinite scrolling in the grid.
    This is useful if the context of your data changes, i.e. if you want to look at a different set of data.
</p>

<note>
    If you call <code>setDatasource()</code> the grid will act assuming
    it's a new datasource, resetting the block cache. However you can pass in the same datasource instance.
    So your application, for example, might have one instance of a datasource that is aware of some
    external context (e.g. the business date selected for a report, or the 'bank ATM instance' data you are
    connecting to), and when the context changes, you want to reset, but still keep the same datasource
    instance. In this case, just call <code>setDatasource()</code> and pass the same datasource in again.
</note>

<h3>Datasource Interface</h3>

<p>
    In a nutshell, every time the grid wants more rows, it will call <code>getRows()</code> on the datasource.
    The datasource responds with the rows requested. Your datasource for infinite scrolling should
    implement the following interface:
</p>

<?= createSnippet(<<<SNIPPET
// Infinite Scrolling Datasource
interface IDatasource {
    // Callback the grid calls that you implement to fetch rows from the server. See below for params.
    getRows(params: IGetRowsParams): void;

    // optional destroy method, if your datasource has state it needs to clean up
    destroy?(): void;
}
SNIPPET
, 'ts') ?>

<p>
    The <code>getRows()</code> method takes the following parameters:
</p>

<?= createSnippet(<<<SNIPPET
// Params for the above IDatasource.getRows()
interface IGetRowsParams {
    // The first row index to get.
    startRow: number;

    // The first row index to NOT get.
    endRow: number;

    // If doing server-side sorting, contains the sort model
    sortModel: any,

    // If doing server-side filtering, contains the filter model
    filterModel: any;

    // The grid context object
    context: any;

    // Callback to call when the request is successful.
    successCallback(rowsThisBlock: any[], lastRow?: number): void;

    // Callback to call when the request fails.
    failCallback(): void;
}
SNIPPET
, 'ts') ?>

<h3><code>getRows()</code></h3>

<p>
    The <code>getRows()</code> function is called by the grid to load a block of rows into the browser-side cache of blocks.
    It takes the following as parameters:
</p>

<ul class="content">
    <li>
        The <code>startRow</code> and <code>endRow</code> define the range expected for the call. For example, if block
        size is 100, the <code>getRows</code> function will be called with <code>startRow: 0</code> and <code>endRow: 100</code>
        and the grid will expect a result with 100 rows (rows 0 to 99).
    </li>
    <li>
        The <code>successCallback(rowsThisBlock, lastRow)</code> should be called when you successfully receive data
        from the server. The callback has the following parameters:

        <ul class="content">
            <li><code>rowsThisBlock</code> should be the rows you have received for the current block.</li>
            <li><code>lastRow</code> should be the index of the last row if known.</li>
        </ul>
    </li>
    <li>
        The <code>failCallback()</code> should be called if the loading failed. Either one of
        <code>successCallback()</code> or <code>failCallback()</code> should be called exactly once.
    </li>
    <li>
        The <code>filterModel()</code> and <code>sortModel()</code> are passed for doing server-side sorting and filtering.
    </li>
    <li>
        The <a href="../javascript-grid-context/"><code>context</code></a> is just passed as is
        and nothing to do with infinite scrolling. It's there if you need it for providing
        application state to your datasource.
    </li>
</ul>

<h3>Setting Last Row Index</h3>

<p>
    The success callback parameter <code>lastRow</code> is used to move the grid out of infinite scrolling.
    If the last row is known, then this should be the index of the last row. If the last row is unknown,
    then leave blank (<code>undefined</code>, <code>null</code> or <code>-1</code>). This attribute is only used when in infinite scrolling.
    Once the total record count is known, the <code>lastRow</code> parameter will be ignored.
</p>

<p>
    Under normal operation, you will return <code>null</code> or <code>undefined</code> for <code>lastRow</code> for every time <code>getRows()</code> is called
    with the exception of when you get to the last block. For example, if block size is 100 and you have 250 rows,
    when <code>getRows()</code> is called for the third time, you will return back 50 rows in the result and set <code>rowCount</code> to 250.
    This will then get the grid to set the scrollbar to fit exactly 250 rows and will not ask for any more blocks.
</p>

<h2>Block Cache</h2>

<p>
    The grid keeps the blocks in a cache. You have the choice to never expire the blocks, or to set a
    limit to the number of blocks kept. If you set a limit, then as you scroll down, previous blocks
    will be discarded and will be loaded again if the user scrolls back up. The maximum blocks to keep
    in the cache is set using the <code>maxBlocksInCache</code> property.
</p>

<h3>Block Size</h3>

<p>
    The block size is set using the grid property <code>cacheBlockSize</code>. This is how many rows each block in the
    cache should contain. Each call to your datasource will be for one block.
</p>

<h3>Debounce Block Loading</h3>

<p>
    It is also possible to debounce the loading to prevent blocks loading until scrolling has stopped. This
    can be configured using: <code>blockLoadDebounceMillis</code>.
</p>

<h3>Aggregation and Grouping</h3>

<p>
    Aggregation and grouping are not available in infinite scrolling.
    This is because to do so would require the grid knowing the entire dataset,
    which is not possible when using the Infinite Row Model. If you need aggregation and / or
    grouping for large datasets, check the <a href="../javascript-grid-server-side-model/">Server-Side
    Row Model</a> for doing aggregations on the server-side.
</p>

<h3>Sorting &amp; Filtering</h3>

<p>
    The grid cannot do sorting or filtering for you, as it does not have all of the data.
    Sorting or filtering must be done on the server-side. For this reason, if the sort or filter
    changes, the grid will use the datasource to get the data again and provide the sort and filter
    state to you.
</p>

<h3>Simple Example: No Sorting or Filtering</h3>

<p>
    The example below makes use of infinite scrolling and caching.
    Notice that the grid will load more data when you bring the scroll all the way to the bottom.
</p>

<?= grid_example('Simple Example', 'simple', 'generated', [ 'modules' => ['infinite']]) ?>

<h3>Selection</h3>

<p>
    Selection works on the rows in infinite scrolling by using the ID of the row node. If you do not
    provide IDs for the row nodes, the index of the row node will be used. Using the index of the
    row breaks down when (server-side) filtering or sorting, as these change the index of the rows.
    For this reason, if you do not provide your own IDs, then selection is cleared if sort or
    filter is changed.
</p>

<p>
    To provide your own IDs, implement the method <code>getRowNodeId(data)</code>, which takes the data
    and should return the ID for the data.
</p>

<?= createSnippet(<<<SNIPPET
gridOptions.getRowNodeId: function(item) {
    // the ID can be any string, as long as it's unique within your dataset
    return item.id.toString();
}
SNIPPET
) ?>

<p>
    Once you have <code>getRowNodeId()</code> implemented, selection will persist across sorts and filters.
</p>

<h3>Example: Sorting, Filtering and Selection</h3>

<p>
    The following example extends the example above by adding server-side sorting, filtering and
    persistent selection.
</p>

<p>
    Any column can be sorted by clicking the header. When this happens, the datasource is called
    again with the new sort options.
</p>

<p>
    The columns <code>Age</code>, <code>Country</code> and <code>Year</code> can be filtered.
    When this happens, the datasource is called again with the new filtering options.
</p>

<p>
    When a row is selected, the selection will remain inside the grid, even if the grid gets sorted
    or filtered. Notice that when the grid loads a selected row (e.g. select first row, scroll down
    so the first block is removed from cache, then scroll back up again) the row is not highlighted
    until the row is loaded from the server. This is because the grid is waiting to see what the ID
    is of the row to be loaded.
</p>

<note>
    The example below uses ag-Grid Enterprise, to demonstrate the set filter with server-side
    filtering. ag-Grid Enterprise is not required for infinite scrolling.
</note>

<?= grid_example('Server-Side Sorting And Filtering', 'server-side', 'generated', ['enterprise' => true, 'modules' => ['infinite', 'setfilter', 'menu', 'columnpanel']]) ?>

<note>
    When performing multiple row selections using shift-click, it is possible that not all rows are available in
    memory if the configured value of <code>maxBlocksInCache</code> doesn't cover the range. In this case multiple selections
    will not be allowed.
</note>

<h2>Specify Selectable Rows</h2>

<p>
    It is also possible to specify which rows can be selected via the <code>gridOptions.isRowSelectable()</code>
    callback function.
</p>

<p>
    For instance if we only wanted to allow rows where the <code>data.country</code> property is the
    'United States' we could implement the following:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions.isRowSelectable: function(data) {
    return data.country === 'United States';
}
SNIPPET
) ?>

<?= grid_example('Specify Selectable Rows', 'specify-selectable-rows', 'generated', ['modules' => ['infinite']]) ?>

<p>
    Note that in the above example we have also included an optional checkbox to help highlight which rows
    are selectable.
</p>

<h3>Configuring a Bit Differently</h3>

<p>
    The examples above use old-style JavaScript objects for the datasource. This example turns things around slightly
    and creates a datasource Class. The example also just generates data on the fly.
</p>

<?= grid_example('Made Up Data', 'made-up-data', 'generated', ['modules' => ['infinite']]) ?>

<h3>Loading Spinner</h3>

<p>
    The examples on this page use a loading spinner to show if the row is waiting for its data to be loaded. The
    grid does not provide this, rather it is a simple rendering technique used in the examples. If the data
    is loading, then the <code>rowNode</code> will have no ID, so if you use the ID as the value, the cell will get refreshed
    when the ID is set.
</p>

<?= createSnippet(<<<SNIPPET
loadingSpinnerColumn = {
    // use a value getter to have the node ID as this column's value
    valueGetter: 'node.id',

    // then a custom cellRenderer
    cellRenderer: function(params) {
        if (params.value === undefined) {
            // when no node id, display the spinner image
            return '<img src="loading.gif" />';
        } else {
            // otherwise just display node ID (or whatever you wish for this column)
            return params.value;
        }
    }
}
SNIPPET
) ?>

<p>Refer to section <a href="../javascript-grid-cell-rendering-components">Cell Rendering</a> for how to build
cell renderers.</p>

<h3 id="more-control-via-properties-and-api">More Control via Properties and API</h3>

<p>
    Infinite scrolling has a cache working behind the scenes. The following properties and API are provided
    to give you control of the cache.
</p>

<h3 id="properties">Properties</h3>

<?php createDocumentationFromFile('../javascript-grid-properties/properties.json', 'serverSideRowModel', ['cacheOverflowSize', 'maxConcurrentDatasourceRequests', 'maxBlocksInCache', 'infiniteInitialRowCount', 'cacheBlockSize']) ?>

<h3>API</h3>

<?php createDocumentationFromFile('../javascript-grid-api/api.json', 'infiniteScrolling') ?>

<note>
    Adding / removing rows directly in the grid for infinite scrolling is not recommended as it will complicate
    your application. It will make your life easier if you update the data on the server and refresh the block cache.
</note>

<h3 id="example-using-cache-api-methods">Example: Using Cache API Methods</h3>

<p>
    Below demonstrates the different API methods via the buttons. The example outputs a lot of debugging items
    to the console because the grid property <code>debug=true</code> is set. The buttons are as follows:
</p>

<ul class="content">
    <li>
        <b>Insert Rows</b>: Inserts 5 rows at row index 2 from the server, then refreshes the grid.
    </li>
    <li>
        <b>Delete Rows</b>: Deletes 10 rows at row index 3 from the server, then refreshes the grid.
    </li>
    <li>
        <b>Set Row Count</b>: Sets the row count to 200. This adjusts the vertical scroll to
        show 200 rows. If the scroll is positioned at the end, this results in the grid automatically re-adjusting
        as it seeks ahead for the next block of data.
    </li>
    <li>
        <b>Print Info</b>: Prints <code>rowCount</code> and <code>maxFound</code> to the console.
    </li>
    <li>
        <b>Jump to 500</b>: Positions the grid so that row 500 is displayed.
    </li>
    <li>
        <b>Print Cache State</b>: Debugging method, to see the state of the cache.
    </li>
    <li>
        <b>Set Prices High &amp; Set Prices Low</b>: Sets the prices on the server-side to either high or low prices.
        This will not impact the grid until after a block cache is loaded. Use these buttons to then further
        test the refresh and purge methods.
    </li>
    <li>
        <b>Refresh Cache</b>: Calls for the cache to be refreshed.
    </li>
    <li>
        <b>Purge Cache</b>: Calls for the cache to be purged.
    </li>
</ul>

<p>
    The example also makes each Honda row bold - demonstrating that the callbacks <code>getRowStyle</code> and <code>getRowClass</code>
    get called after the data is set as well as when the row is created (when the data may not yet be available).
</p>

<?= grid_example('Insert And Remove Example', 'insert-remove', 'generated', ['modules' => ['infinite']]) ?>

<h2 id="changing-columns">Changing Columns</h2>

<p>
    <a href="../javascript-grid-column-definitions/#column-changes">Changing columns</a>
    is possible using infinite scroll and it does not require the data getting fetched again
    from the server. If the change of columns impacts the sort or filter (i.e. a column with a sort
    of filter applied is removed), then the grid will fetch data again similar to how data is
    fetched again after the user changes the sort or filter explicitly.
</p>

<p>
    The example below demonstrates changing columns on the infinite row model. The following
    can be noted:
</p>

<ul>
    <li>Hit the buttons 'Show Year' and 'Hide Year'. Notice that the data is not re-fetched.</li>
    <li>
        Add a sort or filter to Age column. When the sort or filter is applied the data is re-fetched.
        However once fetched, you can add and remove the Year column without re-fetching the data.
    </li>
    <li>
        Add a sort or filter to the Year column. When the sort or filter is applied the data
        is re-fetched. Now remove the Year column and the data is re-fetched again as the sort or
        filter has changed.
    </li>
</ul>

<?= grid_example('Changing Columns', 'changing-columns', 'generated', ['modules' => ['infinite']]) ?>

<h2 id="pagination">Pagination</h2>

<p>
    As with all row models, it is possible to enable pagination with infinite scrolling.
    With infinite scrolling, it is possible to mix and match with the configuration to
    achieve different effects. The following examples are presented:
</p>

<table class="table reference">
    <tr>
        <th>Example</th>
        <th>Page Size</th>
        <th>Block Size</th>
        <th>Comment</th>
    </tr>
    <tr>
        <td>Example 1</td>
        <td>Auto</td>
        <td>Large</td>
        <td>Most Recommended</td>
    </tr>
    <tr>
        <td>Example 2</td>
        <td>Equal</td>
        <td>Equal</td>
        <td>Recommended Sometimes</td>
    </tr>
</table>

<note>
    <p><b>Having smaller infinite blocks size than your pagination page size is not supported</b></p>
    <p>
        You must have infinite block size greater than or equal to the pagination page size.
        If you have a smaller block size, the grid will not fetch enough rows to display
        one page. This breaks how infinite scrolling works and is not supported.
    </p>
</note>

<h3>Example 1: Auto Pagination Page Size, Large Infinite Block Size</h3>

<p>
    This example is the recommended approach. The infinite block size is larger than the pages size,
    so the grid loads data for a few pages, allowing the user to hit 'next' a few times before a server
    sided call is needed.
</p>

<?= grid_example('Block Larger Than Page', 'block-larger-page', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'modules' => ['infinite', 'setfilter', 'menu', 'columnpanel']]) ?>

<h3>Example 2: Equal Pagination Page Size and Large Infinite Block Size</h3>

<p>
    This example demonstrates having the page and block sizes equal. Here the server is hit
    every time a new page is navigated to.
</p>

<?= grid_example('Block Equal Than Page', 'block-equal-page', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'modules' => ['infinite', 'setfilter', 'menu', 'columnpanel']]) ?>

<h2>Overlays</h2>

<p>
    The infinite row model does not use <a href="../javascript-grid-overlays/">overlays</a>
    like the Client-Side Row Model. It does not
    use 'loading' overlay as rows load in blocks and it would be wrong to hide all the grid
    because some rows are getting loaded. The grid does not use 'no rows' overlay as the
    'no rows' could be because you have a filter set, and a grid with a filter shows an empty
    grid when no rows pass the filter.
</p>

<p>
    If you do want to show overlays, then please see
    <a href="../javascript-grid-overlays/">overlays</a> section for details on how to show
    the overlays manually.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
