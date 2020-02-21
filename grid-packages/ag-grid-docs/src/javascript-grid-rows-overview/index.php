<?php
$pageTitle = "ag-Grid Rows";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeywords = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>Rows Overview</h1>

    <p class="lead">
        A row is a horizontal list of cells that represents one data item to be displayed.
    </p>

    <p>
        This section outlines row functionality as follows:
    </p>

    <ul>
        <li>
            <a href="../javascript-grid-sorting/">Row Sorting</a>:
            Clicking column headers typically sorts the rows.
        </li>
        <li>
            <a href="../javascript-grid-row-dragging/">Row Dragging</a>:
            It's possible to reorder the rows by dragging them.
        </li>
        <li>
            <a href="../javascript-grid-row-spanning/">Row Spanning</a>:
            Cells can span multiple rows.
        </li>
        <li>
            <a href="../javascript-grid-row-pinning/">Row Pinning</a>:
            Rows can be configured to stay at the top or bottom of the grid regardless
            of what vertical scrolling the user applies to the grid.
        </li>
        <li>
            <a href="../javascript-grid-row-height/">Row Height</a>:
            How high each row can be can be configured, either changing all rows to a new
            height, or having different rows at different heights.
        </li>
        <li>
            <a href="../javascript-grid-full-width-rows/">Full Width Rows</a>:
            Sometimes it's better to not split the row into cells, but rather have one component
            that spans the entire row.
        </li>
        <li>
            <a href="../javascript-grid-animation/">Row Animation</a>:
            Rows can use CSS transitions to animate between locations as rows are moved, e.g.
            after sorting, filter, or groups opening (as an opening groups pushes rows below
            it down).
        </li>
    </ul>

<?php include '../documentation-main/documentation_footer.php'; ?>

