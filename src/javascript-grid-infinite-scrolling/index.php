<?php
$key = "Infinite Scrolling";
$pageTitle = "ag-Grid Infinite Scrolling";
$pageDescription = "ag-Grid allows the data to stay on the server and only load data for what is currently visible in the GUI.";
$pageKeyboards = "ag-Grid Infinite Scrolling";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="virtual-paging-infinite-scrolling">Infinite Scrolling</h2>

    <div style="background-color: #9acfea">
        ****** Alberto to do:
        <ul>
            <li>Bring the datasource documentation into this page, and remove the old page (have it redirect to here).</li>
            <li>Make the new datasoruce documentation fit with the rest of the docs - eg use the newer doc sections
            (cell renderers and editors, or the floating rows) to style, eg put in interface with lots of comments</li>
        </ul>
    </div>


    <p>
        Infinite scrolling allows the grid to lazy load rows from the server depending on what the scroll position is of the grid.
    </p>
    <p>
        To enable infinite scrolling, set the grid property <i>rowModelType='infinite'</i>.
    </p>
    <p>
        If the grid knows how many pages in total at the start, the scroll will be sized to match the entire data set
        despite the data set not loaded from the server.
    </p>
    <p>
        If the grid does not know how many pages at the start, the scroll will extend automatically until the last row is reached.
    </p>

    <h3 id="how-it-works">How it Works</h3>

    <p>
        The following diagram is a high level overview:
    </p>

    <p>
        <img src="high-level.png"/>
    </p>

    <p>
        The row model behind the grid contains a cache of pages. Each page contains a subset of the entire data set.
        When the grid scrolls to a position where there is no corresponding page in the cache, the model
        uses the provided datasource (you provide the datasource) to get the rows for the requested page. In the diagram,
        the datasource is getting the rows from a database in a remote server.
    </p>

    <h3 id="turning-on-virtual-paging">Turning On Infinite Scrolling</h3>

    <p>
        To turn on infinite scrolling, you must a) set the grid property rowModelType to infinite and b) provide a datasource.
    </p>

    <pre>
// before grid initialised
gridOptions.rowModelType = 'infinite';
gridOptions.datasource = myDataSource;

// after grid initialised, you can set or change the datasource
gridOptions.api.setDatasource(myDataSource);</pre>

    <h3 id="aggregation-and-grouping">Aggregation and Grouping</h3>

    <p>
        Aggregation and grouping are not available in infinite scrolling.
        This is because to do such would require the grid knowing
        the entire data set, which is not possible when using the infinite row model.
    </p>

    <h3 id="sorting-filtering">Sorting & Filtering</h3>

    <p>
        Client side sorting & filtering does not make sense in infinite scrolling and is just not supported.
    </p>

    <p>
        Server side sorting & filtering is supported.
    </p>

    <h3 id="simple-example-no-sorting-or-filtering">Simple Example - No Sorting or Filtering</h3>

    The example below shows infinite scrolling. The example makes use of infinite scrolling and caching.

    <show-example example="virtualPaging"></show-example>

    <h3 id="selection">Selection</h3>

    <p>
        Selection works on the rows in infinite scrolling by using the ID of the row node. If you do not
        provide ID's for the row nodes, the index of the row node will be used. Using the index of the
        row breaks down when (server side) filtering or sorting, as these change the index of the rows.
        For this reason, if you do not provide your own id's, then selection is cleared if sort or
        filter is changed.
    </p>

    <p>
        To provide your own id's, implement the method <i>getRowNodeId(data)</i>, which takes the data
        and should return the id for the data.
    </p>

    <pre>gridOptions.getRowNodeId: function(item) {
    <span class="codeComment">// the id can be any string, as long as it's unique within your dataset</span>
    return item.id.toString();
}</pre>

    <p>
        Once you have <i>getRowNodeId</i> implemented, selection will persist across sorts and filters.
    </p>

    <h3 id="example-sorting-filtering-and-selection">Example - Sorting, Filtering and Selection</h3>

    <p>
        The following example extends the example above by adding server side sorting, filtering and
        persistent selection.
    </p>

    <p>
        Any column can be sorted by clicking the header. When this happens, the datasource is called
        again with the new sort options.
    </p>

    <p>
        The columns <b><i>Age</i></b>, <b><i>Country</i></b> and <b><i>Year</i></b> can be filtered.
        When this happens, the datasource is called again with the new filtering options.
    </p>

    <p>
        When a row is selected, the selection will remain inside the grid, even if the grid gets sorted
        or filtered. Notice that when the grid loads a selected row (eg select first row, scroll down
        so first page is removed form cache, then scroll back up again) the row is not highlighted
        until the row is loaded from the server. This is because the grid is waiting to see what the id
        is of the row to be loaded.
    </p>

    <p>
        (note: the example below uses ag-Grid-Enterprise, this is to demonstrate the set filter with server side filtering,
        ag-Grid-Enterprise is not required for infinite scrolling)
    </p>

    <show-example example="virtualPagingServerSide"></show-example>

    <h3 id="configuring-a-bit-differently">Configuring A Bit Differently</h3>

    <p>
        The examples above use old style JavaScript objects for the datasource. This example turns things around slightly
        and creates a datasource Class. The example also just creates (makes up) data on the fly.
    </p>

    <show-example example="exampleVirtualPagingMadeUpData"></show-example>

    <h3 id="loading-spinner">Loading Spinner</h3>

    <p>
        The examples on this page use a loading spinner to show if the row is waiting for it's data to be loaded. The
        grid does not provide this, rather it is a simple rendering technique used in the examples. If the data
        is loading, then the rowNode will be missing data, and hence all values passed to cellRenderers will be
        undefined. You can check for this and provide your own loading effect.
    </p>

    <pre>cellRenderer: function(params) {
    if (params.value !== undefined) {
        return params.value;
    } else {
        return '&lt;img src="../images/loading.gif">'
    }
}</pre>

    <p>Refer to section <a href="../javascript-grid-cell-rendering">Cell Rendering</a> for how to build
    cell renderers.</p>

    <h3 id="more-control-via-properties-and-api">More Control via Properties and API</h3>

    <p>
        Infinite scrolling has a cache working behind the scenes. The following properties and API are provided
        to allow you control of the cache.
    </p>

    <h4 id="property-overflow-size">&#8226; Property overflowSize</h4>
    <p>
        When infinite scrolling is active, this says how many rows beyond the current last row
        the scrolls should allow to scroll. For example, if 200 rows already loaded from server,
        and overflowSize is 50, the scroll will allow scrolling to row 250. Default is 1.
    </p>

    <h4 id="property-max-concurrent-requests">&#8226; Property maxConcurrentRequests</h4>
    <p>
        How many requests to hit the server with concurrently. If the max is reached, requests are queued.
        Default is 1, thus by default, only one request will be active at any given time.
    </p>

    <h4 id="property-max-pages-in-cache">&#8226; Property maxPagesInCache</h4>
    <p>
        How many pages to cache in the client. Default is no limit, so every requested
        page is kept. Use this if you have memory concerns, so pages least recently viewed are purged. If used, make
        sure you have enough pages in cache to display one whole view of the table (ie what's within the scrollable area),
        otherwise it won't work and an infinite loop of requesting pages will happen.
    </p>

    <h4 id="property-pagination-initial-row-count">&#8226; Property paginationInitialRowCount</h4>
    <p>
        How many rows to initially allow the user to scroll to. This is handy if you expect large data sizes
        and you want the scrollbar to cover many pages before it has to start readjusting for the loading of
        additional data.
    </p>

    <h4 id="api-refresh-virtual-page-cache">&#8226; API refreshInfinitePageCache()</h4>
    <p>
        Marks all the currently loaded page caches for reload. If you have 10 pages in the cache, all 10 will be
        marked for reload. The old data will continue to be displayed until the new data is loaded.
    </p>

    <h4 id="api-purge-virtual-page-cache">&#8226; API purgeInfinitePageCache()</h4>
    <p>
        Purges the cache. The grid is then told to refresh. Only the pages required to display the current
        data on screen are fetched (typically no more than two). The grid will display nothing while the new
        pages are loaded. Use this to immediately remove the old data from the user.
    </p>

    <h4 id="api-get-virtual-row-count">&#8226; API getInfiniteRowCount()</h4>
    <p>
        The row count defines how many rows the grid allows scrolling to.
    </p>

    <h4 id="api-is-max-row-found">&#8226; API isMaxRowFound()</h4>
    <p>
        The property maxRowFound is a boolean, true or false. When false, then the grid will allow scrolling beyond
        the rowCount looking for more rows. When the last row is found, maxRowFound becomes true, and the
        grid will only scroll to the last available row as it has finished looking for more data.
    </p>

    <h4 id="api-set-virtual-row-count">&#8226; API setInfiniteRowCount(rowCount, maxRowFound)</h4>
    <p>
        Sets the rowCount and maxRowFound properties. The second parameter, maxRowFound, is optional and if
        left out, only rowCount is set. Set rowCount to adjust the height of the vertical scroll. Set maxRowFound
        to enable / disable searching for more rows. Use this method if you add or remove rows into the dataset
        and need to reset the number of rows or put the data back into 'look for data' mode.</p>

    <h4 id="api-get-virtual-page-state">&#8226; API getInfinitePageState()</h4>
    <p>
        Returns an object representing the state of the cache. This is useful for debugging and understanding
        how the cache is working.
    </p>

    <h3 id="inserting-removing-rows">Inserting / Removing Rows</h3>

    <h4 id="api-insert-items-at-index">&#8226; API insertItemsAtIndex(index, items)</h4>
    <p>
        Inserts items at the provided location inside the grid. If you use this, you MUST ensure that the data
        store you are sourcing from (eg the database) is also updated, as the subsequent cache page loads will
        need to be consistent with what is inside the grid. Doing an insert will require rows to be moved
        after the insert location (pushed down to make room) - this can leave blank rows in pages in the cache
        (if a page has to be moved down, and the previous page is not loaded for it to take rows from). If this
        is the case, then the page will be marked for a refresh.
    </p>

    <p>
        Inserting rows into the infinite scrolling row model allows for your grid to be out of sync with the
        underlying data store and hence can either cause synchronisation issues, or simply difficult code to
        maintain even if you get it right, especially in multi-user environments. It is strongly suggested you
        don't use the insertItemsAtIndex() method, rather you update the source and then refresh the cache.
    </p>

    <h4 id="api-remove-items">&#8226; API removeItems(rowNodes)</h4>
    <p>
        This method is not supported by infinite scrolling. It is not supported as the grid has no way of knowing
        the index of the rowNodes to be removed if the data is not currently loaded into the cache.
    </p>

    <h4 id="api-add-items">&#8226; API addItems(dataItems)</h4>
    <p>
        This method is not supported by infinite scrolling. It is not supported as the grid has no way of knowing
        the end of the data dataset to be appended to if the data is not currently loaded into the cache.
    </p>

    <h4 id="adding-removing-summary">&#8226; Adding / Removing Summary</h4>

    <p>
        Adding / removing rows directly in the grid for infinite scrolling is in general bad news as you are
        giving a viewport and scrolling through data that resides on the server. It is better to update the
        data on the server and refresh the page cache.
    </p>

    <h3 id="example-using-cache-api-methods">Example - Using Cache API Methods</h3>

    <p>
        Below demonstrates the different api methods via the buttons. The example outputs a lot of debugging items
        to the console because the grid property <i>debug=true</i> is set. The buttons are as follows:
        <ul>
        <li>
            <b>Inject 1 Row @ 2 / Inject 5 Row @ 2</b>: Inserts either one or five rows at location index 2.
        </li>
        <li>
            <b>Insert 1 Row @ 2 and Refresh</b>: Inserts five rows at location index 2 and then gets grid to refresh.
        </li>
        <li>
            <b>Delete 10 Rows @ 3</b>: Deletes rows from the server, then gets the grid to refresh.
        </li>
        <li>
            <b>Set Row Count to 200</b>: Sets the row count to 200. This adjusts the vertical scroll to
            show 200 rows. If the scroll is positioned at the end, this results in the grid automatically readjusting
            as it seeks ahead for the next page of data.
        </li>
        <li>
            <b>Print Rows and Max Found</b>: Debugging method, prints rowCount and maxFound to the console.
        </li>
        <li>
            <b>Jump to 500</b>: Positions the grid so that row 500 is displayed.
        </li>
        <li>
            <b>Print Cache State</b>: Debugging method, to see the state of the cache.
        </li>
        <li>
            <b>Set Prices High & Set Prices Low</b>: Sets the prices ON THE SERVER SIDE to either high or low prices.
            This will not impact the grid until after a page cache is loaded. Use these buttons then then further
            test the refresh and purge methods.
        </li>
        <li>
            <b>Refresh Cache</b>: Calls for the cache to be refreshed.
        </li>
        <li>
            <b>Purge Cache</b>: Calls for the cache to be purged.
        </li>
    </ul>

    The example also makes each Honda row bold - demonstrating that the callbacks getRowStyle and getRowClass
    get called after the data is set as well as when the row is created (when the data may not yet be available).
    </p>

    <show-example example="exampleInsertRemoveVirtualPaging"></show-example>

    <h2 id="pagination">Pagination with Infinite Scrolling</h2>

    <div style="background-color: #9acfea">
        ******************** Alberto, to do: need three examples:
        <ol>
        <li>Set to 15 rows per page for both pagination and infinite scrolling.</li>
        <li>Set to 15 rows for pagination but 100 rows for infinite scrolling.</li>
        <li>With 'auto' rows for pagination and 100 rows for infinite scrolling (what we would recommend).</li>
    </ol>
    </div>

    <show-example example="examplePaginationInfiniteScrolling"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>