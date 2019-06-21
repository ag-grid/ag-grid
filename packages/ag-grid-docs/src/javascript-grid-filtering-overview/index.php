<?php
$pageTitle = "ag-Grid Rows";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>Filtering</h1>

    <p class="lead">
        The grid can display a subset of the provided rows using grid filtering.
    </p>

    <p>
        This section outlines the different types of grid filtering that can be done inside the grid as follows:
    </p>

    <ul>
        <li>
            <a href="../javascript-grid-filtering/">Column Filters</a>:
            Column filters appear in the column menu
            and / or in the <a href="../javascript-grid-tool-panel-filters/">Filters Tool Panel</a>.
            A filter set on a column filter filters by that column only.
        </li>
        <li>
            <a href="../javascript-grid-filter-quick/">Quick Filter</a>:
            Quick filter is a piece of text given to the grid (typically the user will type it in somewhere
            in your application) that the grid uses to filter rows against all columns in the grid.
        </li>
        <li>
            <a href="../javascript-grid-filter-external/">External Filter</a>:
            External filter is a mechanism for the application to filter our rows independently of any
            filtering done by the grid.
        </li>
    </ul>


<?php include '../documentation-main/documentation_footer.php'; ?>

