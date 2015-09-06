<?php
$key = "Floating";
$pageTitle = "AngularJS Angular Grid Floating Header & Floating Footer";
$pageDescription = "AngularJS Angular Grid Floating Header & Floating Footer";
$pageKeyboards = "AngularJS Angular Grid Floating Header & Floating Footer";
include '../documentation_header.php';
?>

<div>

    <h2>Floating Rows</h2>

    <p>
        Floating rows hang either above or below the normal rows of a table. This feature is also called
        Frozen rows in other grids. In ag-Grid they are called Floating rows.
    </p>

    <p>
        To put floating rows into your grid, set <i>floatingTopRowData</i> or <i>floatingBottomRowData</i>
        in the same way as you would set normal data into <i>rowData</i>.
    </p>

    <p>
        After the grid is created, you can update the floating rows by calling <i>api.setFloatingTopRowData(rows)</i>
        and <i>setFloatingBottomRowData(rows)</i>
    </p>

    <h4>Selection / Cell Navigation</h4>

    <p>
        Selection and cell navigation are turned off for floating rows. This was done by choice. Maybe in the future,
        if the requirement is there, this will be provided as an option. However the most common use case for
        floating rows is for header / footer information, which normally do not partake in the row selection process.
    </p>

    <h4>Cell Editing</h4>

    <p>
        Cell editing can take place as normal on floating rows.
    </p>

    <h4>Cell Rendering</h4>

    <p>
        Cell rendering can take place as normal on floating rows. There is an additional <i>floatingCellRenderer</i>
        callback you can use to give floating cells a different cellRenderer to the other cells. If both cellRenderer
        and floatingCellRenderer are provided, frozen cells will use floatingCellRenderer if available, if not then
        cellRenderer.
    </p>

    <show-example example="exampleFloating" example-height="450px"></show-example>

</div>

<?php include '../documentation_footer.php';?>
