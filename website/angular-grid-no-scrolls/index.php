<?php
$key = "No Scrolls";
$pageTitle = "AngularJS Angular Grid No Scrolls";
$pageDescription = "AngularJS Angular Grid No Scrolls";
$pageKeyboards = "AngularJS Angular Grid No Scrolls";
include '../documentation_header.php';
?>

<div>

    <h2>Grid No Scrolls</h2>

    No scrolls renders the table without using any scrollbars. The table will flow outside the
    viewable area of the browser if it is large enough, leaving the user to have to scroll using
    the browser to view the table data.

    </div>
    When using 'no scrolls', there are no pinned columns and row virtualisation does not happen.
    Because there is no row virtualisation, be careful not to have to many rows in your page,
    as a large number of rows could have a large impact on how long it takes for the browser
    to render the page.

    <h4>Why No Scrolls</h4>

    You will want to use 'no scrolls' for one of the following reasons:
    <ul>
        <li>
            The table is small (rows and / or columns) and you want the table to be compact,
            thus you don't want the extra overhead of unused background and scrollbars.
        </li>
        <li>
            You want to use the scroll bars of the browser to view the table.
        </li>
        <li>
            You want to print the table. Printing the table normally will have parts of the
            table clipped with the scrolling viewport. However using 'no scrolls' renders
            the entire table, perfect for printing.
        </li>
    </ul>

    <p/>

    <h4>Example</h4>

    Below is an example table using no scrolls. The table is also fitted with a border, to
    highlight where the table ends (both right hand side and bottom). Notice you can resize
    the columns, and the table will widen or narrow to suit. Also notice you can filter
    the table, and the removed rows will make the table take up less space on the page.

    <p/>
    Note: If you do see scrolls below, it is the scrolls of the example iFrame, not the grid.
    <show-example example="example1"></show-example>
</div>

<?php include '../documentation_footer.php';?>
