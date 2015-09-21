<?php
$key = "For Print";
$pageTitle = "ag-Grid Printing";
$pageDescription = "If you want to print your grid, then it should be rendered without scrolls. This page shows you how to do it.";
$pageKeyboards = "ag-Grid Printing";
include '../documentation_header.php';
?>

<div>

    <h2>For Print</h2>

    <p>
        'For Print' renders the table without using any scrollbars. The grid will flow outside the
        viewable area of the browser if it is large enough, leaving the user to have to scroll using
        the browser to view the table data.
    </p>

    <p>
        When using 'for print', there are no pinned columns and row virtualisation does not happen.
        Because there is no row virtualisation, be careful not to have to many rows in your page,
        as a large number of rows could have a large impact on how long it takes for the browser
        to render the page.
    </p>

    <h4>Why 'For Print'</h4>

    <p>
        You will want to use 'for print' for printing. The table normally will have parts of the
        table clipped with the scrolling viewport. However using 'for print' renders
        the entire table, perfect for printing.
    </p>

    <h4>Example</h4>

    <p>
        Below is an example table using 'for print'. The table is also fitted with a border, to
        highlight where the table ends (both right hand side and bottom). Notice you can resize
        the columns, and the table will widen or narrow to suit. Also notice you can filter
        the table, and the removed rows will make the table take up less space on the page.
    </p>

    <p>
        Note: If you do see scrolls below, it is the scrolls of the example iFrame, not the grid.
    </p>

    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
