<?php
$key = "Pagination";
$pageTitle = "ag-Grid Pagination";
$pageDescription = "You can load data in pages from the server, delegating filtering and sorting to the server also. This page explains how to do this with ag-Grid.";
$pageKeyboards = "ag-Grid Pagination";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="pagination">Pagination</h2>

    <note>
        <p>In v9.0 ag-Grid pagination changed. See the <a href="index-deprecated.php">old pagination documentation</a>
        for how it used to work.</p>

        <p>If you were doing server side pagination, we recommend moving to
            <a href="../javascript-grid-infinite-scrolling/#pagination">pagination with infinite scrolling</a>
            as a way of migration to the new mechanism.</p>

        <p>If you were slicing manually the data in your Datasource to mimic pagination done in the browser only, we recommend that
            you use the default <a href="../javascript-grid-in-memory/">In Memory Row Model</a> and set the row data as normal
            and then set grid property
        <i>pagination=true</i>.</p>

    </note>

    <h2 id="summary">Summary</h2>
    <p>To enable pagination in, set the grid property <i>pagination=true</i>.

        The following properties further configure the pagination:
</p>

    <br>
    <h3 id="properties">Properties</h3>
    <table class="table">
        <tr>
            <th>Property</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>pagination</th>
            <td>
                <p>True - Pagination is enabled.</p>
                <p>False (Default) - Pagination is disabled.</p>
            </td>
        </tr>
        <tr>
            <th>paginationPageSize</th>
            <td><p>Number. How many rows to load per page. Default value = 100. If <i>paginationAutoPageSize</i>
                is specified, this property is ignored</p></td>
        </tr>
        <tr>
            <th>paginationAutoPageSize</th>
            <td>
                <p>True - The number of rows to load per page is automatically adjusted by ag-Grid so each page
                    shows enough rows to just fill the area designated for the grid.</p>
                <p>False (Default) - paginationPageSize is used.</p>
            </td>
        </tr>
        <tr>
            <th>suppressPaginationPanel</th>
            <td>
                <p>True - The out of the box ag-Grid controls for navigation are hidden. This is useful if
                    <i>clientPagination=true</i> and you want to provide your own pagination controls.</p>
                <p>False (Default) - when <i>clientPagination=true</i> It automatically shows at the bottom the necessary
                    controls so that the user can navigate through the different pages.</p>
                </td>
        </tr>
        <tr>
            <th>paginationStartPage</th>
            <td><p>Number. The starting page that will be shown by ag-Grid. If this number
                is greater than the maximum number of pages, ag-Grid will place the user in the last page.</p></td>
        </tr>
    </table>

    <p>The following methods compose the pagination API are all available from <i>gridOptions.api</i></p>

    <br>
    <h3 id="properties">API</h3>
    <table class="table">
        <tr>
            <th>Method</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>paginationIsLastPageFound()</th>
            <td>
                <p>Returns true when last page known. This will always be true if you are using the in memory row model
                    for pagination.</p>
                <p>Returns false when last page now known. This only happens when using infinite scrolling row model.</p></td>
        </tr>
        <tr>
            <th>paginationGetPageSize()</th>
            <td><p>How many rows ag-Grid is showing per page.</p></td>
        </tr>
        <tr>
            <th>paginationSetPageSize(newPageSize)</th>
            <td><p>Sets the <i>paginationPageSize</i> to <i>newPageSize</i> Then it repaginates the grid so the changes
                    are applied immediately on the screen.</p></td>
        </tr>
        <tr>
            <th>paginationGetCurrentPage()</th>
            <td>
                <p>Returns the 0 index based page which ag-Grid is showing right now.</p>
                </td>
        </tr>
        <tr>
            <th>paginationGetTotalPages()</th>
            <td><p>Returns the total number of pages. If <i>paginationIsLastPageFound() == false</i> returns null.</p>
            </td>
        </tr>
        <tr>
            <th>paginationGetRowCount()</th>
            <td><p>The total number of rows. If <i>paginationIsLastPageFound() == false</i> returns null.</p>
            </td>
        </tr>
        <tr>
            <th>paginationGoToPage(pageNumber)</th>
            <td><p>Goes to the specified page. If the page requested doesn't exist, it will go to the last
            page.</p>
            </td>
        </tr>
        <tr>
            <th>paginationGoToNextPage()<br>paginationGoToPreviousPage()<br>paginationGoToFirstPage()<br>paginationGoToLastPage()</th>
            <td><p>Shorthands for <i>goToPage(relevantPageNumber)</i>.</p>
            </td>
        </tr>
    </table>

    <br>
    <h3 id="events">Events</h3>
    <table class="table">
        <tr>
            <th>Event</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>paginationChanged</th>
            <td>
                <p>This event is triggered every time the paging state changes, Some of the most common scenarios for
                    this event to be triggered are:
                <ul>
                    <li>The page size changes</li>
                    <li>The current shown page is changed</li>
                    <li>New data is loaded onto the grid</li>
                </ul></p></td>
        </tr>
    </table>


    <h2 id="clientPagination">Pagination - Row Models</h2>
    <p>Pagination in ag-Grid is supported in <a href="/javascript-grid-row-models/">all the different row models</a>.
        The <a href="/javascript-grid-in-memory/">in memory row model</a> (the default
        row model) is used for the examples on this page.</p>
    
    <p>To see the specifics of pagination on the
    other row models check the relevant documentation for <a href="/javascript-grid-infinite-scrolling/">infinite row model</a>,
    <a href="/javascript-grid-viewport/">viewport row model</a> and
    <a href="/javascript-grid-enterprise-model/">enterprise row model</a>.</p>

    <h2 id="paginationFeatures">Features While Using Pagination</h2>

    <p>
        Pagination does not reduce the feature set of the grid, as long as the underlying row model supports it.
        any feature of the grid. In other words, if you are paging over the in memory row model, all features of
        the in memory row model (grouping, filtering etc) are still available. Likewise for the other row models,
        if the row model supports it, it's available through pagination and that row model.
    </p>

    <h2 id="clientPagination">Example: Simple pagination</h2>


    <p>
        This example is pagination in it's simplest form. The only property set is turning pagination on with <i>pagination=true</i>.
    </p>


    <show-example example="clientPaging"></show-example>

    <h2 id="simplePagination">Example: Auto Page Size</h2>

    <p>
        If you set <i>paginationAutoPageSize=true</i> the grid will automatically show as many rows in each page as it can
        fit. This is demonstrated below. Note if you resize the display area of the grid, the page size
        automatically changes. To view this, open the example up in a new tab and resize your browser.
    </p>

    <show-example example="autoPageSize"></show-example>

    <h2 id="simplePagination">Example: Customising Pagination</h2>

    <p>In this example the default pagination settings are changed. Note the following:</p>

    <ul>
        <li><i>paginationPageSize</i> is set to 10</li>
        <li><i>paginationStartPage</i> is set to 4 (0 based, so he 5th page)</li>
        <li>A dropdown to change the page size dynamically is available. This makes a call to
            <i>paginationSetPageSize(newPageSize)</i></li>
    </ul>

    <show-example example="customPaging"></show-example>

    <h2 id="simplePagination">Example: Custom Pagination Controls</h2>

    <p>If you set <i>suppressPaginationPanel=true</i>, the grid will not show the standard navigation controls for
        pagination. This is useful is you want to provide your own navigation controls. </p>

    <p>In the example below you can see how this works. Note that we are listening to <i>onPaginationChanged</i> to
    update the information about the current pagination status. We also call methods on the pagination API to change
    the pagination state.</p>

    <p>A summary of the API methods and events can be found at the top of this documentation page</p>

    <show-example example="customControls"></show-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>