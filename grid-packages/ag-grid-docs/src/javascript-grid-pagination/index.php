<?php
$pageTitle = "Pagination: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Pagination. Use Pagination when you don't want the user to have to scroll. Pagination allows viewing rows one page at a time. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Pagination";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="first-h1" id="pagination">Row Pagination</h1>

    <p class="lead">
        To enable pagination in, set the grid property <code>pagination=true</code>.
        The following simple example shows this, the only difference to this and previous
        examples is the <code>pagination=true</code> property.
    </p>

    <p>
        Remember Pagination works with all frameworks eg Angular and React as well as plain JavaScript.
    </p>

    <?= grid_example('Client Paging', 'client-paging', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2 id="clientPagination">Supported Row Models</h2>

    <p>Pagination in ag-Grid is supported in <a href="../javascript-grid-row-models/">all the different row models</a>.
        The <a href="../javascript-grid-client-side-model/">Client-side Row Model</a> (the default
        row model) is used for the examples on this page.</p>

    <p>To see the specifics of pagination on the
    other row models check the relevant documentation for <a href="../javascript-grid-infinite-scrolling/#pagination">Infinite Row Model</a>,
    <a href="../javascript-grid-viewport/#example-viewport-with-pagination">Viewport Row Model</a> and
    <a href="../javascript-grid-server-side-model/#pagination-with-server-side-row-model">Server-side Row Model</a>.</p>

    <h2 id="paginationFeatures">Features While Using Pagination</h2>

    <p>
        Pagination does not reduce the feature set of the grid, as long as the underlying row model supports it.
        In other words, if you are paging over the Client-side Row Model, all features of
        the Client-side Row Model (grouping, filtering etc) are still available. Likewise for the other row models,
        if the row model supports it, it's available through pagination and that row model.
    </p>

    <h2 id="auto-page-size">Example: Auto Page Size</h2>

    <p>
        If you set <code>paginationAutoPageSize=true</code> the grid will automatically show as many rows in each page
        as it can fit. This is demonstrated below. Note if you resize the display area of the grid, the page size
        automatically changes. To view this, open the example up in a new tab and resize your browser.
    </p>

    <?= grid_example('Auto Page Size', 'auto-page-size', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <note>
        Each pagination page must have the same number of rows.
        If you use <code>paginationAutoPageSize</code> with
        <a href="../javascript-grid-row-height/#getrowheight-callback">getRowHeight()</a> callback (to have different
        rows with different heights) then the page height will be calculated using the default row height and not
        the actual row heights. Therefore the rows will not fit perfectly into the page if these features are mixed.
    </note>

    <h2 id="customising-pagination">Example: Customising Pagination</h2> 
    <p>In this example the default pagination settings are changed. Note the following:</p>

    <ul class="content">
        <li><code>paginationPageSize</code> is set to 10</li>
        <li><code>api.paginationGoToPage(4)</code> is called to go to page 4 (0 based, so the 5th page)</li>
        <li>A dropdown to change the page size dynamically is available. This makes a call to
            <code>paginationSetPageSize(newPageSize)</code></li>
        <li>The numbers in the pagination panel are formatted differently using the grid callback
            <code>paginationNumberFormatter</code> and putting the numbers into square brackets i.e. [x].</li>
    </ul>

    <?= grid_example('Custom Paging', 'custom-paging', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2 id="custom-pagination-controls">Example: Custom Pagination Controls</h2>

    <p>If you set <code>suppressPaginationPanel=true</code>, the grid will not show the standard navigation controls for
        pagination. This is useful is you want to provide your own navigation controls. </p>

    <p>In the example below you can see how this works. Note that we are listening to <code>onPaginationChanged</code> to
    update the information about the current pagination status. We also call methods on the pagination API to change
    the pagination state.</p>

    <p>A summary of the API methods and events can be found at the top of this documentation page.</p>

    <p>The example also sets property <code>suppressScrollOnNewData=true</code>, which tells the grid to NOT
    scroll to the top when the page changes.</p>

    <?= grid_example('Custom Controls', 'custom-controls', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2 id="childRows">Pagination & Child Rows</h2>

    <p>
        Both <a href="../javascript-grid-grouping/">Row Grouping</a> and
        <a href="../javascript-grid-master-detail/">Master Detail</a> have rows that expand. When this happens,
        consideration needs to be given as to how this impacts the number of rows on the page. There are two
        modes of operation that can be used depending on what your application requirements.
    </p>

    <h3>Mode 1: Paginate Only Top Level Rows</h3>

    <p>
        The first mode is the default. The rows are split according to the top level rows. For example if row grouping
        with a page size of 10, then each page will contain 10 top level groups. When expanding a group with this mode,
        all children for that group, along with the 10 original groups for that page, will get display in one page. This
        will result in a page size greater than the initial page size of 10 rows.
    </p>

    <p>
        This mode is typically best suited for Row Grouping as children are always displayed alongside the parent group.
        It is also typically best for Master Detail, as detail rows (that typically contain detail tables) will always
        appear below their master rows.
    </p>

    <p>
        In the example below, note the following:
    </p>
    <ul>
        <li>
            Each page will always contain exactly 10 groups.
        </li>
        <li>
            Expanding a group will not push rows to the next page.
        </li>
    </ul>

    <?= grid_example('Grouping Normal', 'grouping-normal', 'generated', array("enterprise" => 1)) ?>

    <h3>Mode 2: Paginate All Rows, Including Children</h3>

    <p>
        The second mode paginates all rows, including child rows when Row Grouping and detail rows with Master Detail.
        For example if row grouping with a page size of 10, then each page will always contain exactly 10 rows, even
        if it means having children appear on a page after the page containing the parent. This can be particularly
        confusing if the last row of a page is expanded, as the children will appear on the next page (not visible
        to the user unless they navigate to the next page).
    </p>

    <p>
        This modes is typically best if the application never wants to exceed the maximum number of rows in a page
        past the page size. This can be helpful if designing for touch devices (eg tablets) where UX requirements
        state no scrolls should be visible in the application - paging to a strict page size can guarantee no vertical
        scrolls will appear.
    </p>

    <p>
        To enable pagination on all rows, including children, set grid property <code>paginateChildRows=true</code>.
    </p>

    <p>
        In the example below, note the following:
    </p>
    <ul>
        <li>
            Each page will always contain exactly 10 rows (not groups).
        </li>
        <li>
            Expanding a group will push rows to the next page to limit the total number of rows to 10.
        </li>
    </ul>

    <?= grid_example('Grouping Paginate Child Rows', 'grouping-paginate-child-rows', 'generated', array("enterprise" => 1)) ?>

    <h3>Fallback to Mode 2</h3>

    <p>
        If using either of the following features, the grid will be forced to use the second mode:
    </p>
    <ul>
        <li><a href="../javascript-grid-grouping/#suppress-group-row">Group Suppress Row</a></li>
        <li><a href="../javascript-grid-grouping/#removeSingleChildren">Group Remove Single Children</a></li>
    </ul>

    <p>
        This is because both of these features remove top level rows (group rows and master rows) from the displayed rows,
        making it impossible to paginate based on the top level rows only.
    </p>

    <h2>Pagination Properties</h2>

    <?php include_once 'paginationProperties.php' ?>

    <?php printPropertiesTable($paginationProperties) ?>

    <p>The following methods compose the pagination API are all available from <code>gridOptions.api</code></p>

    <h2>Pagination API</h2>

    <?php include_once 'paginationProperties.php' ?>
    <?php printPropertiesTable($paginationApi) ?>

    <h2>Pagination Callbacks</h2>

    <?php include_once 'paginationProperties.php' ?>
    <?php printPropertiesTable($paginationCallbacks) ?>

    <h2>Pagination Events</h2>

    <table class="table reference">
        <tr>
            <th>Event</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>paginationChanged</th>
            <td>
                <p>This event is triggered every time the paging state changes, Some of the most common scenarios for
                    this event to be triggered are:
                <ul class="content">
                    <li>The page size changes</li>
                    <li>The current shown page is changed</li>
                    <li>New data is loaded onto the grid</li>
                </ul></p></td>
        </tr>
    </table>

<?php include '../documentation-main/documentation_footer.php';?>
