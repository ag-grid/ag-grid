<?php
$key = "Pagination";
$pageTitle = "Angular Grid Pagination";
$pageDescription = "You can load data in pages from the server, delegating filtering and sorting to the server also. This page explains how to do this with Angular Grid.";
$pageKeyboards = "Angular Grid Paging Pagination";
include '../documentation_header.php';
?>

<div>

    <h2>Pagination</h2>

    <p>
        Pagination allows the grid to lazy load rows from the server and display the rows one page at a time. The page to display is selected
        by he user using the pagination panel that appears at the bottom of the page.
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

    <h4>Aggregation and Grouping</h4>

    <p>
        Aggregation and grouping work exactly as when no paging, however their effect will be on the currently displayed page only. It is not
        posible to have the client aggregate or group on data that is not loaded from the server.
    </p>

    <h4>Sorting & Filtering</h4>

    <p>
        Sorting and filtering behave on the currently loaded page only. Server side sorting and paging is yet to be implemented.
    </p>
    <p>
        Server side sorting & filtering will be supported soon.
    </p>

    <h4>Example</h4>

    The example below shows virtual paging. The example makes use of infinite scrolling and caching.

    <show-example example="paging"></show-example>
</div>

<?php include '../documentation_footer.php';?>