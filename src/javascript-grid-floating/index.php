<?php
$key = "Floating";
$pageTitle = "ag-Grid Floating Header & Floating Footer";
$pageDescription = "ag-Grid Floating Header & Floating Footer";
$pageKeyboards = "ag-Grid Floating Header & Floating Footer";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="floating-rows">Floating Rows</h2>

    <p>
        Floating rows hang either above or below the normal rows of a table. This feature is also called
        Frozen rows in other grids. In ag-Grid they are called Floating Rows.
    </p>

    <p>
        To put floating rows into your grid, set <i>floatingTopRowData</i> or <i>floatingBottomRowData</i>
        in the same way as you would set normal data into <i>rowData</i>.
    </p>

    <p>
        After the grid is created, you can update the floating rows by calling <i>api.setFloatingTopRowData(rows)</i>
        and <i>setFloatingBottomRowData(rows)</i>
    </p>

    <h4 id="cell-editing">Cell Editing</h4>

    <p>
        Cell editing can take place as normal on floating rows.
    </p>

    <h4 id="cell-rendering">Cell Rendering</h4>

    <p>
        Cell rendering can take place as normal on floating rows. There is an additional <i>floatingCellRenderer</i>
        callback you can use to give floating cells a different cellRenderer to the other cells. If both cellRenderer
        and floatingCellRenderer are provided, frozen cells will use floatingCellRenderer if available, if not then
        cellRenderer.
    </p>

    <h3 id="example">Example</h3>

    <p>
        Example below shows floating rows.
    </p>

    <show-example example="examplePinnedRow" example-height="450px"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
