<?php
$pageTitle = "Printing: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Layout For Print. Use For Print to have the grid render without using any scrollbars. This is useful for printing the grid, where all rows should be printed, not just what's visible on the screen. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Printing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Printing</h1>

    <p class="lead">
        When printing an instance of the grid, it is best to remove all scrollbars, to enable
        each cell to be printed. This section explains how to achieve this.
    </p>

    <p>
        Removing all scrollbars is done in two steps. The first is adjusting the height to fit the rows.
        The second is adjusting the width to fix the columns.
    </p>

    <h2>Adjusting the Height</h2>

    <p>
        In order to print all the grid's rows you need all the rows to be visible without scrolling.
        This is done by adjusting the grid's height.
    </p>
    <p>
        To adjust the height to fit the rows, call the api method <code>api.setGridAutoHeight(true)</code>.
        This uses <a href="../javascript-grid-width-and-height/#auto-height">Grid Auto Height</a> feature
        to allow the grid to automatically size itself to fit the height.
    </p>

    <snippet>
// example setting the grid to auto-height for printing
api.setGridAutoHeight(true)

// and then un-set again after printing is complete
api.setGridAutoHeight(false)
    </snippet>

    <h2>Adjusting the Width</h2>

    <p>
        In order to print all the grid's columns you need all the columns to be visible without scrolling.
        This is done by adjusting the grid's width.
    </p>

    <p>
        There is no automatic way to adjust the grids with to fit the columns similar to adjusting the height
        to fit rows. This is due to the DOM having different rules for fitting content vertically and horizontally.
    </p>

    <p>
        To get the preferred width of the grid to fit columns, call the api method <code>api.getPreferredWidth()</code>.
        This will return a number value that you should then use to set the grid's width. You may need to add some pixels
        to cater for grid borders.
    </p>

    <snippet>
// set the width of the grid to match the preferred width
var preferredWidth = gridOptions.api.getPreferredWidth();

// add 2 pixels for the grid border
preferredWidth += 2;

// set the width onto the grid DOM element
eGridDiv.style.width = preferredWidth + 'px';

    </snippet>

    <h2>Example Changing Width and Height</h2>

    <p>
        Below shows adjusting the width and height to fit the grids rows and columns. Note the following:
        <ul>
            <li>Clicking 'Printer Friendly' will lay the grid out such that all rows are columns are visible
            without using any grid scrolling (although the browser / iFrame may need scrolling).</li>
            <li>Clicking 'Normal' will set the grid back to it's original size using grid scrolling to view
            all the rows and columns.</li>
        </ul>
    </p>

    <?= example('For Print Simple', 'for-print-simple', 'generated') ?>

    <h2>Example Full Printing</h2>

    <p>
        Below shows using the techniques described as well as getting the web page to print.
        There is one additional concern when changing the width and height of the grid: After you finish
        setting the width and the height of the gird, due to the grid's use of animation frames, the grid
        will not be drawn and ready to print for a time after the width and height are set. To get
        around this use the method <code>api.isAnimationFrameQueueEmpty()</code> (to know if the grid has
        animation frames pending) and event <code>animationQueueEmpty</code> to be notified when no longer
        animation frames are pending.
    </p>

    <p>
        In the example below, when print is pressed, the following happens:
        <ol>
            <li>
                The grid's width and height are set to show all rows and columns.
            </li>
            <li>
                The application waits for the grid's animation frames to finish, so all rows and columns are
                drawn into the DOM.
            </li>
            <li>
                The once animation frames are complete, the grid calls <code>window.print()</code> to
                print the page.
            </li>
            <li>
                Once printing is finished, the grid's width and height are set back to the original sizes.
            </li>
        </ol>
    </p>

    <?= example('For Print Complex', 'for-print-complex', 'generated') ?>

    <h2>Don't Print Large Data</h2>

    <p>
        Do not use this technique for printing if you are showing a large number of rows or columns.
        This is not a problem with the grid, it is a limitation on browsers on how much data they can
        easily display in one web page. If you try to render lots of data into the web page, the web page
        will inevitably. ag-Grid normally gets around this problem by virtualising the rows and columns.
    </p>

    <p>
        If you want to allow printing large data sets it's best to get your users to export to CSV or Excel
        and then print from another non-web based application.
    </p>

    <h2 id="printing-constraints">Printing Constraints</h2>

    <p>
        It is not possible for a web page to know about the dimensions of the paper it is getting printed on.
        For this reason, you will have the following issues when printing grids that span pages:
    </p>

    <ul>
        <li>
            The grid may be clipped horizontally if the grid does not fit horizontally on the printed page and
            the print setup does not cater for the web page exceeding the width fo the printable area.
        </li>
        <li>
            The grid will be split across pages vertically with no consideration towards page height, grid height
            or row height. This will have the following effect:
            <ul>
                <li>
                    The grid header will only appear once. It will not appear at the start of each printed page.
                </li>
                <li>
                    The grid rows may be cut mid way through the row.
                </li>
            </ul>
        </li>
    </ul>

    <p>
        These are restrictions with printing web pages in general. It is not something that can be solved by a grid
        component. If you need better support for printing, especially around splitting the grid across multiple
        printed pages, then it's best export the data to CSV or Excel and print in another non-web based application.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>
