<?php
$key = "Pinned Rows";
$pageTitle = "ag-Grid Pinned Rows";
$pageDescription = "ag-Grid Pinned Rows";
$pageKeyboards = "ag-Grid Pinned Rows";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="floating-rows">Pinned Rows</h2>

    <p>
        Pinned rows appear either above or below the normal rows of a table.
        This feature in other grids is also known as <i>Frozen Rows</i> or <i>Floating Rows</i>.
    </p>

    <p>
        To put pinned rows into your grid, set <code>pinnedTopRowData</code> or <code>pinnedBottomRowData</code>
        in the same way as you would set normal data into <code>rowData</code>.
    </p>

    <p>
        After the grid is created, you can update the pinned rows by calling <i>api.setPinnedTopRowData(rows)</i>
        and <i>setPinnedBottomRowData(rows)</i>
    </p>

    <h4 id="cell-editing">Cell Editing</h4>

    <p>
        Cell editing can take place as normal on pinned rows.
    </p>

    <h4 id="cell-rendering">Cell Rendering</h4>

    <p>
        Cell rendering can take place as normal on pinned rows. There is an additional
        <code>colDef.pinnedRowCellRenderer</code> property you can use to give pinned row cell a
        different cellRenderer to the other cells. If both cellRenderer and pinnedRowCellRenderer
        are provided, pinned rows will use pinnedRowCellRenderer over cellRenderer.
    </p>

    <h3 id="example">Example</h3>

    <p>
        Example below shows pinned rows.
    </p>

    <show-example example="examplePinnedRow" example-height="450px"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
