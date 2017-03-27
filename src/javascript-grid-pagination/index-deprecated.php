<?php
$key = "Pagination";
$pageTitle = "ag-Grid Pagination";
$pageDescription = "Describes how pagination was done in ag-Grid prior to v9.x. Use this to learn about the old way. Going forward, you should move to the new way, as this will be deprecated.";
$pageKeyboards = "ag-Grid Pagination - Deprecated";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <div style="border-left: 4px solid lightcoral; padding-left: 4px;">

        <note>
            <b>Notice on Pagination</b>
            <p>
                In v9.0 ag-Grid pagination changed. See the <a href="index-deprecated.php">old pagination documentation</a>
                for how it used to work. We recommend moving to
                <a href="../javascript-grid-infinite-scrolling/#pagination">pagination with infinite scrolling</a>
                as a way of migration to the new mechanism.
            </p>
            <b>What was wrong with the old way?</b>
            <p>
                The old way of pagination was very old school, it got you to provide the data to the client
                one page at at time using a specific row model. This had the following disadvantages:
                <ul>
                    <li>You had to provide data to the grid exactly as it was displayed, one page at a time.</li>
                    <li>No caching or pre-fetching of data.</li>
                    <li>Did not work with any other row model, thus no option of grouping, pivoting, viewport etc</li>
                </ul>
            </p>
            <b>How is the new way different?</b>
            <p>
                The new pagination design is not a row model, instead it is a new feature that can fit on top
                of any row model, giving pagination in addition (not instead of) all the features of the other
                row models. That means it's possible to mix pagination with full client side sorting and filtering,
                pagination with grouping and pivoting (for ag-Grid enterprise), and also pagination with the
                'Row Model Viewport' and the 'work in progress' row model 'Row Model Enterprise'.
            </p>
            <b>Should I be reading this page?</b>
            <p>
                If you are not using the old way of pagination (ie what's described on this page) then
                disregard this page, go back to the main pages and learn how to do pagination the new way.
            </p>
        </note>

        <h2 id="pagination">Server Side Pagination - The Old Way - Deprecated</h2>

        <p>
            Pagination allows the grid to lazy load rows from the server and display the rows one page at a time. The page to display is selected
            by the user using the pagination panel that appears at the bottom of the page.
        </p>

        <p>
            To enable pagination, set the grid property <i>rowModelType='pagination'</i>.
        </p>

        <p>
            If the grid knows how many pages in total at the start, the total page and row count will appear in the pagination panel, and the user will
            be restricted to this range.
        </p>

        <p>
            If the grid does not know how many pages at the start, the user will be able to continue clicking on 'next' until the last page is
            loaded. During the search for the last page, the grid is said to be in 'infinite pagination'. During infinite pagination,
            the total rows and pages are displayed as 'more' at the bottom of the page, and the 'last' button is disabled.
        </p>

        <h3 id="aggregation-and-grouping">Aggregation and Grouping</h3>

        <p>
            Aggregation and grouping work exactly as when no paging, however their effect will be on the currently displayed page only. It is not
            posible to have the client aggregate or group on data that is not loaded from the server.
        </p>

        <h3 id="sorting-filtering">Sorting & Filtering</h3>

        <p>
            You have two options for both sorting and filtering. Either you can allow the grid to do it on a particular page
            (in-grid) or you do it on the server side across the entire data-set.
        </p>

        <p>
            For sorting, you must choose whether you want in-grid sorting or server side sorting, you cannot mix.
        </p>

        <p>
            For filtering, you must choose whether you want in-grid filtering or server side filtering, you cannot mix.
        </p>

        <p>
            It is possible to mix between in-grid sorting / filtering with server side filtering / sorting. Eg if you
            are doing in-grid sorting, you can do server side filtering, and vice versa.
        </p>

        <h4 id="example-in-grid-sorting-and-filtering">Example - In Grid Sorting and Filtering</h4>

        <p>
            The following example shows pagination. The sorting and filtering is all done in the grid.
        </p>

        <show-example example="examplePaging"></show-example>

        <h3 id="example-server-side-sorting-and-filtering">Example - Server Side Sorting and Filtering</h3>

        <p>
            The following example extends the example above by adding server side filtering and sorting.
        </p>

        <p>
            Any column can be sorted by clicking the header. When this happens, the datasource is called
            again with the new sort options.
        </p>

        <p>
            The columns <b><i>Age</i></b>, <b><i>Country</i></b> and <b><i>Year</i></b> can be filtered. When this happens, the datasource is called
            again with the new filtering options.
        </p>

        <p>
            <b>Note:</b> The set filters are provided with the list of available values. This is because it is not
            possible for the grid to know the entire set of values as they reside on the server.
        </p>

        <p>
            <b>Note:</b> The filters below have <i>newRowsAction='keep'</i>. This is so the filters are kept when you move between pages.
        </p>

        <p>
            <b>Note:</b> The example below uses ag-Grid-Enterprise, this is to demonstrate the set filter with server side filtering,
            ag-Grid-Enterprise is not required for pagination)
        </p>

        <show-example example="examplePagingServerSide"></show-example>

        <h3>
            Start Page
        </h3>

        <p>
            The start page for pagination is by default zero (the first page). If you want another
            page, set the property <i>paginationStartPage</i>.
        </p>

        <h3 id="configuring-a-bit-differently">Configuring A Bit Differently</h3>

        <p>
            To demonstrate further, the example below shows:
        <ul>
            <li>A JavaScript Class is used for the datasource.</li>
            <li>Data is made up on the fly (probably not what your application would do, but good for testing
                as it easily generates a large amount of data).</li>
            <li>The start page for the datasource is set to 6 by setting <i>paginationStartPage=5</i>.</li>
        </ul>
        </p>

        <show-example example="examplePagingMadeUpData"></show-example>

        <h3 id="pagination-api">Pagination Events</h3>

        <p>
            The grid fires the following events with regards pagination:
        </p>

        <table class="table">
            <tr>
                <th>paginationReset</th>
                <td>
                    Pagination service is reset. This happens when a a) new datasource is set;
                    b) filter changed (for server side filtering only); b) sort changed (for
                    server side sorting only).
                </td>
            </tr>
            <tr>
                <th>paginationPageRequested</th>
                <td>
                    Pagination page load is requested. Useful if you want to set a loading spinner
                    visible while the loading is happening (and remove the spinner on
                    <i>paginationPageLoaded</i> event.
                </td>
            </tr>
            <tr>
                <th>paginationPageLoaded</th>
                <td>
                    Pagination page load is finished. If you need to update any GUI with
                    status of the pagination (eg what page number is currently loaded)
                    you should do it after this event.
                </td>
            </tr>
        </table>

        <p>
            Note that every <i>paginationPageRequested</i> does NOT result in a corresponding
            <i>paginationPageLoaded</i> event. If the user requests a page to be loaded
            before the previous load is finished (eg the user hits 'Next' three times in
            quick succession) then only the last load will result in a <i>paginationPageLoaded</i>
            event.
        </p>

        <h3 id="pagination-api">Pagination API</h3>

        <p>
            The following API is provided to interact with the pagination:
        </p>

        <table class="table">
            <tr>
                <th>paginationIsLastPageFound()</th>
                <td>Returns true if last page of pagination is found, otherwise false.</td>
            </tr>
            <tr>
                <th>paginationGetPageSize()</th>
                <td>Returns the page size.</td>
            </tr>
            <tr>
                <th>paginationGetCurrentPage()</th>
                <td>Returns the currently displayed page.</td>
            </tr>
            <tr>
                <th>paginationGetTotalPages()</th>
                <td>Returns the total number of pages.</td>
            </tr>
            <tr>
                <th>paginationGetRowCount()</th>
                <td>Returns the number of rows in one page.</td>
            </tr>
            <tr>
                <th>paginationGoToNextPage()</th>
                <td>Get grid to load next page.</td>
            </tr>
            <tr>
                <th>paginationGoToPreviousPage()</th>
                <td>Get grid to load previous page.</td>
            </tr>
            <tr>
                <th>paginationGoToFirstPage()</th>
                <td>Get grid to load first page.</td>
            </tr>
            <tr>
                <th>paginationGoToLastPage()</th>
                <td>Get grid to load last page.</td>
            </tr>
            <tr>
                <th>paginationGoToPage(index)</th>
                <td>Get grid to load specific page. Pages are zero indexed, thus first page is index zero.</td>
            </tr>
        </table>

        <p>
            When using the pagination API, remember the page indexes are zero based in the grid, thus
            page zero is the first page.
        </p>

        <h3>Suppressing Pagination Panel</h3>

        <p>
            If you want to use pagination, but do not want to show the pagination panel, then
            set property <i>suppressPaginationPanel=true</i>. Use this if you want to provide
            your own GUI for pagination outside of the grid.
        </p>

        <h3>Example: API, Events and Suppress Pagination Panel</h3>

        <p>
            Below shows another example where the API is used to control and get information
            about the pagination. Because the pagination is controlled outside of the grid,
            the pagination panel is also hidden. The following can be noted about the example:
        <ul>
            <li>
                The total number of pages is only known when the user has hit the last page.
            </li>
            <li>
                If the last page is known and you try to load a page past the last page,
                the grid will load the last page.
            </li>
            <li>
                If you try to load a page before
            </li>
        </ul>
        </p>

        <show-example example="examplePagingApi"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>