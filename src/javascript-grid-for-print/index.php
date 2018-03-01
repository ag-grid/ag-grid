<?php
$pageTitle = "Layout for Print: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Layout For Print. Use For Print to have the grid render without using any scrollbars. This is useful for printing the grid, where all rows should be printed, not just what's visible on the screen. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Printing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Layout For Print</h1>

    <p>
        The 'For Print' renders the table without using any scrollbars. The grid will flow outside the
        viewable area of the browser if it is large enough, leaving the user to have to scroll using
        the browser to view the table data. To set 'For Print', set the property
        <code>domLayout=forPrint</code>.
    </p>

    <p>
        When using 'for print', there are no pinned columns and row virtualisation does not happen.
        Because there is no row virtualisation, be careful not to have to many rows in your page,
        as a large number of rows could have a large impact on how long it takes for the browser
        to render the page.
    </p>

    <h2>Why 'For Print'</h2>

    <p>
        You will want to use 'for print' for printing. The table normally will have parts of the
        table clipped with the scrolling viewport. However using 'for print' renders
        the entire table, perfect for printing.
    </p>

    <h2>Simple Example</h2>

    <p>
        Below is an example table using 'for print'. The table is also fitted with a border, to
        highlight where the table ends (both right hand side and bottom). Notice you can resize
        the columns, and the table will widen or narrow to suit. Also notice you can filter
        the table, and the removed rows will make the table take up less space on the page.
    </p>

    <p>
        Note: If you do see scrolls below, it is the scrolls of the example iFrame, not the grid.
    </p>

    <?= example('For Print Simple', 'for-print-simple', 'generated') ?>

    <h2>Complex Example</h2>

    <p>
        The following example demonstrates for print when used in combination with pinned rows,
        pinned columns and fullWidth rows. For each of these, the grid should flatten out all the
        rows so all are printed and none hidden. This is the same as the first example is the
        section on <a href="../javascript-grid-master-detail/">full width rows</a> with the exception of for print is turned on.
    </p>

    <p>
        The example below appears to have horizontal and vertical scrolls. These are the scrolls
        of the iFrame only, the grid itself has no scrolls. This means that everything inside the
        scrolls will be printed if you tried to print the contents of the iFrame.
    </p>

    <?= example('For Print Complex', 'for-print-complex', 'generated') ?>

    <h2>For Print and RTL</h2>

    <p>
        If you are using RTL (for Right to Left languages), it will work but you need to be careful. The
        grid will expect the browser the horizontally scroll to the left. This means you have to set CSS
        <code>direction=rtl</code> on the body element of your document. This is demonstrated in the example
        below.
    </p>

    <?= example('RTL For Print', 'for-print-rtl', 'generated') ?>

    <h2>For Print and Master Detail Grids</h2>

    <p>
        It is not possible to have one grid embedded inside another grid with the forPrint setting
        different for each grid. So if doing master / detail and have one grid INSIDE another grid,
        then both grids must have either domLayout="forPrint" on or off.
    </p>



<?php include '../documentation-main/documentation_footer.php';?>
