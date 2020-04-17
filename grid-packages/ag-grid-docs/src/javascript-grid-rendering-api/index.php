<?php
$pageTitle = "ag-Grid - Rendering API";
$pageDescription = "Details on how to access the different rendered rows.";
$pageKeywords = "ag-Grid rendering API";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Rendering API</h1>

<p class="lead">
    Displayed rows are rows that the grid tries to render. For example, if you have a group
    that is closed, the children of that group will not appear in the displayed rows.
    The grid renders the displayed rows onto the screen.
</p>

<p>
    The displayed rows have indexes. For example, if the grid is rendering 20 rows, then will have
    indexes 0 to 19.
</p>

<p>
    You can look up the rows by index. This is dependent on anything that changes the index.
    For example, if you apply a sort or filter, then the rows and corresponding indexes will change.
</p>

<h2>Displayed Rows API</h2>

<?php createDocumentationFromFile('../javascript-grid-api/api.json', 'displayedRows') ?>

<h2 id="example-api">Accessing Displayed Rows Example</h2>

<p>
    The example below demonstrates the following:
</p>

<ul class="content">
    <li><b>Get Displayed Row 0:</b> Returns back the first row in the grid. This is not impacted
        by what page you are one, eg if you navigate to the second page, this method will still
        return the first row on the first page. If you sort, the first row will be changed.</li>
    <li><b>Get Displayed Row Count:</b> Returns back the total number of rows across all pages. If
        you filter, this number will change accordingly.</li>
    <li><b>Print All Displayed Rows:</b> Demonstrates looping through all rows on the screen across
        all pages.</li>
    <li><b>Print Page Displayed Rows:</b> Demonstrates looping through all rows on the screen on
        one page.</li>
</ul>

<?= grid_example('Get Displayed Row', 'get-displayed-row', 'generated') ?>


<h2>
    Displayed Rows & Grouping
</h2>

<p>
    When grouping, displayed rows are those rows that are currently visible with regards the the open / closed
    state of the parent rows.
</p>

<p>
    In the example below <code>getDisplayedRowCount()</code> will return back 7. This is composed of 5 top level
    'Language' rows and two second level 'Country' rows. Each of the 7 displayed rows will have a row index from
    0 to 6. All rows not displayed (as they are contained withing closed groups) are not displayed and do not have
    a row index.
</p>

<img src="./rowGroups.png"/>

<h2>
    Displayed Rows & Loading
</h2>

<p>
    If using <a href="../javascript-grid-server-side-model/">Server-side Row Model</a> or
    <a href="../javascript-grid-infinite-scrolling/">Infinite Row Model</a>, the
    <code>getDisplayedRowCount()</code> will include the
    'loading rows'. This is because Displayed Rows are a concern of the grid's rendering engine and not the underlying
    data. As far as the rendering engine is concerned, the 'loading row' is just another row to render.
</p>

<p>
    For example, calling <code>getDisplayedRowCount()</code> below will return 5 as there are 4 normal rows
    and 1 loading row.
</p>

<img src="./serverSideLoading.png"/>

<?php include '../documentation-main/documentation_footer.php';?>
