<?php
$key = "Row Pinning";
$pageTitle = "ag-Grid Pinned Rows";
$pageDescription = "ag-Grid Pinned Rows";
$pageKeyboards = "ag-Grid Pinned Rows";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="floating-rows">Row Pinning</h1>

    <p>
        Pinned rows appear either above or below the normal rows of a table.
        This feature in other grids is also known as <i>Frozen Rows</i> or <i>Pinned Rows</i>.
    </p>

    <p>
        To put pinned rows into your grid, set <code>pinnedTopRowData</code> or <code>pinnedBottomRowData</code>
        in the same way as you would set normal data into <code>rowData</code>.
    </p>

    <p>
        After the grid is created, you can update the pinned rows by calling <i>api.setPinnedTopRowData(rows)</i>
        and <i>setPinnedBottomRowData(rows)</i>
    </p>

    <h3 id="cell-editing">Cell Editing</h3>

    <p>
        Cell editing can take place as normal on pinned rows.
    </p>

    <h3 id="cell-rendering">Cell Rendering</h3>

    <p>
        Cell rendering can take place as normal on pinned rows. There is an additional
        <code>colDef.pinnedRowCellRenderer</code> property you can use to give pinned row cell a
        different cellRenderer to the other cells. If both cellRenderer and pinnedRowCellRenderer
        are provided, pinned rows will use pinnedRowCellRenderer over cellRenderer.
    </p>

    <h1 id="example">Example</h1>

    <p>
        Example below shows pinned rows. Select the number of rows you want to pin at the top and the
        bottom using the selection above the grid.
    </p>

    <p>In this example we're using Components to render custom pinned row values for Athlete and Age (color blue and italics
    respectively).</p>

    <?= example('Row Pinning', 'row-pinning', 'generated') ?>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
