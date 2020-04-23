<?php
$pageTitle = "Server-side Row Model - Pagination";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-side Pagination</h1>

<p class="lead">
    If you are dealing with large amounts of data, then some application may decide to use pagination
    to help the user navigate through the data.
</p>

<h2>Enabling Pagination</h2>

<p>
    Pagination is enabled in the grid via the <code>pagination</code> grid option. The pagination page size is
    typically set alongside this using the <code>paginationPageSize</code> option. These options are shown below:
</p>

<snippet>
gridOptions: {
    // enables pagination in the grid
    pagination: true,

    // sets 10 rows per page (default is 100)
    paginationPageSize: 10,

    // other options
}
</snippet>

<p>
    For more configuration details see the section on <a href="../javascript-grid-pagination">Pagination</a>.
</p>

<h2>Pagination on the Server</h2>

<p>
    The actual pagination of rows is performed on the server when using the Server-side Row Model. When the grid needs
    more rows it makes a request via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-side Datasource</a> with
    metadata containing pagination details.
</p>

<p>
    The properties relevant to pagination in the request are shown below:
</p>

<snippet>
// IServerSideGetRowsRequest
{
   // first row requested
   startRow: number,

   // last row requested
   endRow: number,

   ... // other params
}
</snippet>

<p>
    The <code>endRow</code> requested by the grid may not actually exist in the data so the correct
    <code>lastRowIndex</code> should be supplied in the response to the grid. See
    <a href="../javascript-grid-server-side-model-datasource/#implementing-the-server-side-datasource">
        Implementing the Server-side Datasource</a> for more details.
</p>

<h2>Example: Server-side Pagination</h2>

<p>
    The example below demonstrates server-side Pagination. Note the following:
</p>

<ul class="content">
    <li>
        Pagination is enabled using the grid option <code>pagination=true</code>.
    </li>
    <li>
        A pagination page size of 10 (default is 100) is set using the grid option <code>paginationPageSize=10</code>.
    </li>
    <li>
        The number of rows returned per request is set to 10 (default is 100) using <code>cacheBlockSize=10</code>.
    </li>
    <li>
        The <code>startRow</code> and <code>endRow</code> properties in the request are used by the server to perform
        pagination.
    </li>
    <li>
        Use the arrows in the pagination panel to traverse the data. Note the last page arrow is greyed out as the
        last row index is only supplied to the grid when the last row has been reached.
    </li>
    <li>
        Open the browsers dev console to view the request supplied to the datasource.
    </li>
</ul>

<?= grid_example('Pagination', 'pagination', 'generated', ['enterprise' => true, 'exampleHeight' => 551, 'extras' => ['alasql'], 'modules' => ['serverside']]) ?>

<h2>Pagination with Groups</h2>

<p>
    When grouping, pagination splits rows according to top level groups only. This has the following implications:
</p>

<ul>
    <li>
        The number of pages is determined by the number of top level rows and not children
    </li>
    <li>
        When groups are expanded, the number of pagination pages does not change.
    </li>
    <li>
        When groups are expanded, all children rows appear on the same page as the parent row.
    </li>
</ul>

<p>
    The example below demonstrates pagination with grouping. Note the following:
</p>

<ul>
    <li>
        No block size is specified thus 100 rows per block is used.
    </li>
    <li>
        Grid property <code>paginationAutoPageSize=true</code> is set. This means the number of displayed
        rows is automatically set to the number of rows that fit the vertical scroll.
        Thus no vertical scroll is present.
    </li>
    <li>
        As rows are expanded, the number of visible rows in a page grows. The children appear on the same
        row as the parent and no rows are pushed to the next page.
    </li>
    <li>
        For example expand 'Australia' which will result in a large list for which vertical scrolling will
        be needed to view all children.
    </li>
</ul>

<?= grid_example('Pagination with Groups', 'pagination-with-groups', 'generated', ['enterprise' => true, 'exampleHeight' => 551, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Pagination with Child Rows</h2>

<p>
    If it is desired to keep the row count exactly at the page size, then set grid property
    <code>paginateChildRows=true</code>.
</p>
<p>
    This will have the effect that child rows will get included in the pagination calculation. This will mean
    if a group is expanded, the pagination will split the child rows across pages and also possibly push
    later groups into later pages.
</p>

<p>
    The example below demonstrates pagination with grouping and <code>paginateChildRows=true</code>. Note the following:
</p>

<ul>
    <li>
        No block size is specified thus 100 rows per block is used.
    </li>
    <li>
        Grid property <code>paginationAutoPageSize=true</code> is set. This means the number of displayed
        rows is automatically set to the number of rows that fit the vertical scroll.
    </li>
    <li>
        As rows are expanded, the number of visible rows in each page is fixed. This means expanding groups will push rows
        to the next page. This includes later group rows and also it's own child rows (if the child rows don't fit
        on the current page).
    </li>
    <li>
        If the last visible row is expanded, the grid gives a confusing user experience, as the rows appear on the
        next page. So the user will have to click 'expand' and then click 'next page' to see the child rows. This
        is the desired behaviour as the grid keeps the number of rows on one page consistent. If this behaviour
        is not desired, then do not use <code>paginationAutoPageSize=true</code>.
    </li>
</ul>

<?= grid_example('Paginate Child Rows', 'paginate-child-rows', 'generated', ['enterprise' => true, 'exampleHeight' => 551, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-selection/">Row Selection</a>
    using the Server-side Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
