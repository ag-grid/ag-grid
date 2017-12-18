<?php
$key = "Pagination";
$pageTitle = "ag-Grid Pagination";
$pageDescription = "You can load data in pages from the server, delegating filtering and sorting to the server also. This page explains how to do this with ag-Grid.";
$pageKeyboards = "ag-Grid Pagination";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="pagination">Pagination</h1>

    <p>
        To enable pagination in, set the grid property <code>pagination=true</code>.
        The following simple example shows this, the only difference to this and previous
        examples is the <code>pagination=true</code> property.
    </p>

    <?= example('Client Paging', 'client-paging', 'generated', array("enterprise" => 1)) ?>

    <h2 id="clientPagination">Supported Row Models</h2>
    <p>Pagination in ag-Grid is supported in <a href="../javascript-grid-row-models/">all the different row models</a>.
        The <a href="../javascript-grid-in-memory/">in memory row model</a> (the default
        row model) is used for the examples on this page.</p>
    
    <p>To see the specifics of pagination on the
    other row models check the relevant documentation for <a href="../javascript-grid-infinite-scrolling/#pagination">infinite row model</a>,
    <a href="../javascript-grid-viewport/#pagination">viewport row model</a> and
    <a href="../javascript-grid-enterprise-model/#pagination">enterprise row model</a>.</p>

    <h2 id="paginationFeatures">Features While Using Pagination</h2>

    <p>
        Pagination does not reduce the feature set of the grid, as long as the underlying row model supports it.
        In other words, if you are paging over the in memory row model, all features of
        the in memory row model (grouping, filtering etc) are still available. Likewise for the other row models,
        if the row model supports it, it's available through pagination and that row model.
    </p>

    <h2 id="auto-page-size">Example: Auto Page Size</h2>

    <p>
        If you set <i>paginationAutoPageSize=true</i> the grid will automatically show as many rows in each page as it can
        fit. This is demonstrated below. Note if you resize the display area of the grid, the page size
        automatically changes. To view this, open the example up in a new tab and resize your browser.
    </p>

    <?= example('Auto Page Size', 'auto-page-size', 'generated', array("enterprise" => 1)) ?>

    <h2 id="customising-pagination">Example: Customising Pagination</h2>

    <p>In this example the default pagination settings are changed. Note the following:</p>

    <ul>
        <li><i>paginationPageSize</i> is set to 10</li>
        <li><i>api.paginationGoToPage(4)</i> is called to go to page 4 (0 based, so he 5th page)</li>
        <li>A dropdown to change the page size dynamically is available. This makes a call to
            <i>paginationSetPageSize(newPageSize)</i></li>
        <li>The numbers in the pagination panel are formatted differently using the grid callback
            <code>paginationNumberFormatter</code> and putting the numbers into square brackets i.e. [x].</li>
    </ul>

    <?= example('Custom Paging', 'custom-paging', 'generated', array("enterprise" => 1)) ?>

    <h2 id="custom-pagination-controls">Example: Custom Pagination Controls</h2>

    <p>If you set <i>suppressPaginationPanel=true</i>, the grid will not show the standard navigation controls for
        pagination. This is useful is you want to provide your own navigation controls. </p>

    <p>In the example below you can see how this works. Note that we are listening to <i>onPaginationChanged</i> to
    update the information about the current pagination status. We also call methods on the pagination API to change
    the pagination state.</p>

    <p>A summary of the API methods and events can be found at the top of this documentation page.</p>

    <p>The example also sets property <i>suppressScrollOnNewData=true</i>, which tells the grid to NOT
    scroll to the top when the page changes.</p>

    <?= example('Custom Controls', 'custom-controls', 'generated', array("enterprise" => 1)) ?>

    <h2 id="properties">Pagination Properties</h2>
    <?php include_once 'paginationProperties.php' ?>
    <?php printPropertiesTable($paginationProperties) ?>

    <p>The following methods compose the pagination API are all available from <i>gridOptions.api</i></p>

    <h2 id="properties">Pagination API</h2>

    <?php include_once 'paginationProperties.php' ?>
    <?php printPropertiesTable($paginationApi) ?>

    <h2 id="properties">Pagination Callbacks</h2>

    <?php include_once 'paginationProperties.php' ?>
    <?php printPropertiesTable($paginationCallbacks) ?>

    <br>
    <h2 id="events">Pagination Events</h2>
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

    <note>
        <p>
            In v9.0 ag-Grid pagination changed from server side pagination to client side pagination.
            Server side pagination was then removed in v10.1.
        </p>
        <p>
            If you were doing server side pagination, we recommend moving to
            <a href="../javascript-grid-infinite-scrolling/#pagination">pagination with infinite scrolling</a>
            as a way of migration to the new mechanism.
        </p>
        <p>
            If you were slicing manually the data in your Datasource to mimic pagination done in the browser only,
            we recommend that you use the default <a href="../javascript-grid-in-memory/">In Memory Row Model</a> and set the row data as normal
            and then set grid property <i>pagination=true</i>.
        </p>
    </note>

</div>

<?php include '../documentation-main/documentation_footer.php';?>