<?php
$pageTitle = "ag-Grid Highlighting Rows and Columns";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It stores the data in Row Models. Each piece of row data provided to the datgrid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeyboards = "ag-Grid data row model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

    <h1 id="highlighting-rows-and-columns">Highlighting Rows and Columns</h1>

    <p class="lead">
        The class <code>ag-row-hover</code> and <code>ag-column-hover</code> are added
        to cells as the mouse is dragged over the cells row or column.
    </p>

    <p>
        The example below demonstrates the following:
    <ul>
        <li>
            CSS class <code>ag-row-hover</code> has background color added to it,
            so when you hover over a cell, the row will be highlighted.
        </li>
        <li>
            CSS class <code>ag-column-hover</code> has background color added to it,
            so when you hover over a cell or a header, the column will be highlighted.
        </li>
        <li>
            If you hover over a header group, all columns in the group will be highlighted.
        </li>
    </ul>
    </p>

    <?= example('Highlight Rows And Columns', 'highlight-rows-and-columns', 'generated', array('processVue' => true)) ?>


<?php include '../documentation-main/documentation_footer.php';?>