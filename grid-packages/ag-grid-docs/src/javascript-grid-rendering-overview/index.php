<?php
$pageTitle = "ag-Grid Rows";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeywords = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>Rendering Cells Overview</h1>

    <p class="lead">
        This section explains the different mechanics involved with rendering data.
    </p>

    <ul>
        <li>
            <a href="../javascript-grid-rendering-flow/">Cell Content</a>:
            The different ways of getting data into your cells. This section
            covers:
            <ul>
                <li>
                    <a href="../javascript-grid-value-getters/">Value Getters</a>
                </li>
                <li>
                    <a href="../javascript-grid-value-formatters/">Value Formatters</a>
                </li>
                <li>
                    <a href="../javascript-grid-cell-expressions/">Expressions</a>
                </li>
                <li>
                    <a href="../javascript-grid-reference-data/">Reference Data</a>
                </li>
            </ul>
        </li>
        <li>
            <a href="../javascript-grid-cell-rendering/">Cell Rendering</a>:
            How the grid creates HTML for inside the cells.
        </li>
        <li>
            <a href="../javascript-grid-cell-rendering/#provided-cell-renderers">Provided Renderers</a>:
            The cell renderers that come provided with the grid.
        </li>
        <li>
            <a href="../javascript-grid-refresh/">View Refresh</a>:
            How to refresh cells in the grid.
        </li>
        <li>
            <a href="../javascript-grid-change-detection/">Change Detection</a>:
            How the grid uses change detection to detect what cells need refreshing.
        </li>
    </ul>

<?php include '../documentation-main/documentation_footer.php'; ?>
