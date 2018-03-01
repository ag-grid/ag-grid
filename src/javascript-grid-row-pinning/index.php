<?php
$pageTitle = "Row Pinning: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Row Pinning. Use Pinned Rows to pin one or more rows to the top or the bottom. Pinned rows are always present and not impacted by vertical scroll. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Pinned Rows";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1 class="first-h1" id="floating-rows">Row Pinning</h1>

    <p class="lead">
        Pinned rows appear either above or below the normal rows of a table.
        This feature in other grids is also known as <strong>Frozen Rows</strong> or <strong>Pinned Rows</strong>.
    </p>

    <p>
        To put pinned rows into your grid, set <code>pinnedTopRowData</code> or <code>pinnedBottomRowData</code>
        in the same way as you would set normal data into <code>rowData</code>.
    </p>

    <p>
        After the grid is created, you can update the pinned rows by calling <code>api.setPinnedTopRowData(rows)</code>
        and <code>setPinnedBottomRowData(rows)</code>.
    </p>

    <h2>Cell Editing</h2>

    <p>
        Cell editing can take place as normal on pinned rows.
    </p>

    <h2>Cell Rendering</h2>

    <p>
        Cell rendering can take place as normal on pinned rows. There is an additional
        <code>colDef.pinnedRowCellRenderer</code> property you can use to give pinned row cell a
        different <code>cellRenderer</code> to the other cells. If both <code>cellRenderer</code> and <code>pinnedRowCellRenderer</code>
        are provided, pinned rows will use <code>pinnedRowCellRenderer</code> over <code>cellRenderer</code>.
    </p>

    <h2>Example</h2>

    <p>
        Example below shows pinned rows. Select the number of rows you want to pin at the top and the
        bottom using the selection above the grid.
    </p>

    <p>In this example we're using Components to render custom pinned row values for Athlete and Age (color blue and italics
    respectively).</p>

    <?= example('Row Pinning', 'row-pinning', 'generated') ?>


<?php include '../documentation-main/documentation_footer.php'; ?>
