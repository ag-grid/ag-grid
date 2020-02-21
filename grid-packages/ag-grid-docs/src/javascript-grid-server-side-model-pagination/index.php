<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Pagination</h1>

<p class="lead">
    If you are dealing with large amounts of data, then some application may decide to use pagination
    to help the user navigate through the data.
</p>

<p>
    To enable pagination when using the Server-side Row Model, set the grid property <code>pagination=true</code>.
</p>

<h2>Pagination with No Grouping</h2>

<p>
    The example below demonstrates Server-side Row Model with no grouping and pagination enabled.
    Note the following:
</p>

<ul>
    <li>
        No page size is specified, so the default of 100 rows is used.
    </li>
    <li>
        No block size for the Server-side Row Model is specified, so the default of 100 rows is used.
    </li>
    <li>
        Using the vertical scroll, only the first 100 rows are visible. To view the next block of 100 rows
        you must click 'next page' in the pagination panel.
    </li>
    <li>
        Because the pagination page size and Server-side Row Model block size are both 100, it gives the experience of each
        pagination page getting lazy loaded (as the block for that page is loaded on demand).
    </li>
</ul>

<?= grid_example('No Grouping', 'no-grouping', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

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

<?= grid_example('Pagination Example', 'pagination', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

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

<?= grid_example('Paginate Child Rows', 'paginate-child-rows', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-selection/">Row Selection</a>
    using the Server-side Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
