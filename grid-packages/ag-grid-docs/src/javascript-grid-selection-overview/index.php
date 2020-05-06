<?php
$pageTitle = "ag-Grid Rows";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers downloading the JavaScript packages for ag-Grid and ag-Grid Enterprise.";
$pageKeywords = "JavaScript Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1>Selection Overview</h1>

    <p class="lead">
        Users can select rows, ranges or use a simple text selection from inside the grid.
    </p>

    <h2>Row Selection</h2>

    <p>
        <a href="../javascript-grid-selection/">Row Selection</a> selects rows, i.e. data entries from the provided
        data set.
    </p>

    <p>
        <img class="selection-image" src="./rowSelection.png" title="Row Selection"/>
    </p>


    <h2>Range Selection</h2>

    <p>
        <a href="../javascript-grid-range-selection/">Range Selection</a> selects ranges of cells, i.e. a rectangular
        block of cells.
    </p>

    <p>
        <img class="selection-image" src="./rangeSelection.png" title="Range Selection"/>
    </p>


    <h2>Cell Text Selection</h2>

    <p>
        If you want to use a regular text selection as if the grid were a regular table. Use <code>enableCellTextSelection=true</code>
        in the gridOptions.
    </p>

    <p>
        <img class="selection-image" src="./cellTextSelection.png" title="Cell Text Selection" />
    </p>

    <note>This config should be used in combination with <code>ensureDomOrder=true</code> in the gridOptions.


<?php include '../documentation-main/documentation_footer.php'; ?>

