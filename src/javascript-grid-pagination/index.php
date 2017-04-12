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
    <?php include 'paginationProperties.php' ?>
    <?php printPropertiesTable($paginationProperties) ?>


    <p>The following methods compose the pagination API are all available from <i>gridOptions.api</i></p>

    <br>
    <h3 id="properties">API</h3>
    <?php include 'paginationProperties.php' ?>
    <?php printPropertiesTable($paginationApi) ?>

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
    other row models check the relevant documentation for <a href="/javascript-grid-infinite-scrolling/#pagination">infinite row model</a>,
    <a href="/javascript-grid-viewport/#pagination">viewport row model</a> and
    <a href="/javascript-grid-enterprise-model/#pagination">enterprise row model</a>.</p>

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

    <p>A summary of the API methods and events can be found at the top of this documentation page.</p>

    <p>The example also sets property <i>suppressScrollOnNewData=true</i>, which tells the grid to NOT
    scroll to the top when the page changes.</p>

    <show-example example="customControls"></show-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>