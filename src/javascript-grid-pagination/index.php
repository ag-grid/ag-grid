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
        In v9.0 ag-Grid pagination changed. See the <a href="index-deprecated.php">old pagination documentation</a>
        for how it used to work. We recommend moving to
        <a href="../javascript-grid-infinite-scrolling/#pagination">pagination with infinite scrolling</a>
        as a way of migration to the new mechanism.
    </note>

    <h2 id="clientPagination">Pagination and In Memory Row Model</h2>

    <show-example example="clientPaging"></show-example>

    <div style="background-color: #9acfea">
        ****** Alberto to do:
        <ul>
            <li>Example showing start page.</li>
            <li>Example showing auto page size.</li>
            <li>Section explaining the API (copy paste from the old one??).</li>
            <li>Section on pagination events.</li>
            <li>Example showing 1) API, 2) Suppress Pagination Panel (eg if they want to do pagination
            themselves using a panel external to the grid).</li>
        </ul>
    </div>

</div>

<?php include '../documentation-main/documentation_footer.php';?>