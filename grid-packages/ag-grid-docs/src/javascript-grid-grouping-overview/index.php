<?php
$pageTitle = "ag-Grid Rows";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeywords = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>Grouping and Pivoting Overview</h1>

    <p class="lead">
        It is common to group data inside the grid and allow expanding sections
        to show more data.
    </p>

    <p>
        The grid supports grouping in the following ways:
    </p>

    <ul>
        <li>
            <a href="../javascript-grid-grouping/">Row Grouping</a>:
            The grid can group the provided rows into row groups. The grouping is done on columns you
            selected e.g. group on Language then Country.
        </li>
        <li>
            <a href="../javascript-grid-master-detail/">Master Detail</a>:
            Have grids inside grids, allowing child grids to have different columns.
        </li>
        <li>
            <a href="../javascript-grid-tree-data/">Tree Data</a>:
            Allow n-levels of grouping without each level representing a column, e.g. like a File Browser.
        </li>
        <li>
            <a href="../javascript-grid-aggregation/">Aggregation</a>:
            While grouping, value columns can be aggregated, e.g. total Bank Balance while grouping by Country,
        </li>
        <li>
            <a href="../javascript-grid-pivoting/">Pivoting</a>:
            Pivoting rows into columns, eg make columns for Ireland, UK e.t.c. by pivoting on Country column.
        </li>
    </ul>

<?php include '../documentation-main/documentation_footer.php'; ?>

