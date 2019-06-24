<?php
$pageTitle = "ag-Grid Rows";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>Rendering Cell Data Overview</h1>

    <p class="lead">
    </p>

    <p>
        This section explains the different mechanics involved with rendering data.
    </p>

    <ul>
        <li>
            <a href="../javascript-grid-rendering-flow/">Rendering Flow</a>:
            The flow the grid follows from taking you data to rendering HTML into the cell.
        </li>
        <li>
            <a href="../javascript-grid-cell-rendering/">Cell Rendering</a>:
            How the grid creates HTML for inside the cells.
        </li>
        <li>
            <a href="../javascript-grid-provided-renderers/">Provided Renderers</a>:
            The cell renderers the come provided with the grid.
        </li>
        <li>
            <a href="../javascript-grid-value-getters/">Getters & Formatters</a>:
            Use value getters instead of field to fine tune how values are taken from the provided data.
            Use formatters to format values.
        </li>
        <li>
            <a href="../javascript-grid-cell-expressions/">Expressions</a>:
            Use strings instead of functions for value getters and formatters.
        </li>
        <li>
            <a href="../javascript-grid-value-cache/">Value Cache</a>:
            The results of value getters can be cached to improve performance.
        </li>
        <li>
            <a href="../javascript-grid-reference-data/">Reference Data</a>:
            Reference data is used to display alternative values rather that what is in your
            data, eg you data could have USA but you want to display 'America'.
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
