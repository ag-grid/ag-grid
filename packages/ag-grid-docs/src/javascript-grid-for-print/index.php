<?php
$pageTitle = "Printing: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Layout For Print. Use For Print to have the grid render without using any scrollbars. This is useful for printing the grid, where all rows should be printed, not just what's visible on the screen. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Printing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Printing</h1>

    <p class="lead">
        This section explains how to user the Print Layout feature of the grid.
    </p>

    <p>
        A grid using print layout will not use any scrollbars so all rows and columns
        will get printed. The grid will auto-size width and height to fit all contents.
        This means if the grid is printed on paper all the cells will get included,
        as apposed to printing a grid with scrollbars and only cells within the visible
        area will get printed.
    </p>

    <p>
        The example below shows print layout. The following can be noted:
        <ul>
            <li>
                Pressing the button 'Printer Friendly Layout' turns the grid
                into print layout and removes all scrolls.
            </li>
            <li>
                Pressing the button 'Normal Layout' returns the grid back
                to normal.
            </li>
        </ul>
    </p>

    <?= example('For Print Simple', 'for-print-simple', 'generated') ?>

    <h2>Toggling Print Layout</h2>

    <p>
        Print layout can be turned on by setting the property <code>domLayout='print'</code>
        or by calling the grid API <code>setDomLayout('print')</code>. Similarly the layout
        can be set back to normal by unsetting the <code>domLayout</code> property or
        calling the grid API <code>setDomLayout(null)</code>.
    </p>

<snippet>
    // setting the grid layout to 'print'
    api.setDomLayout('print');

    // resetting the layout back to normal
    api.setDomLayout(null);
</snippet>

    <h2>Toggling Grid Size</h2>

    <p>
        The grid width and height will adjust automatically to fit the contents of all cells.
        For this to work the application should <b>not</b> set a width or height onto the grid component.
        If using print layout, make sure you have no width or height set for the grid.
    </p>

    <p>
        All the examples on this page set width and height initially on the grid and then remove the width and
        height when print layout is set.
    </p>

    <h2>Page Break</h2>

    <p>
        When in print layout all rows will have the CSS property <code>page-break-inside: avoid</code>
        so rows will not be split across pages (eg the top half of the row on one printed page with the
        other half on the next printed page).
    </p>

    <h2>Detailed Printing Example</h2>

    <p>
        Below shows a more detailed example and also automatically shows the print dialog.
        From the example, the following can be noted:
        <ul>
            <li>
                When 'Print' is pressed, the grid will do the following:
                <ul>
                    <li>Set the grid into print layout.</li>
                    <li>Remove the height and width settings from the grid to allow the grid to auto-fit it's size.</li>
                    <li>Wait for two seconds (to allow the browser to redraw with the new settings) and
                        then bring up the print dialog.</li>
                    <li>Set the grid back to normal when the print dialog is closed.</li>
                </ul>
            </li>
            <li>
                The first column 'ID' is pinned. When in print layout, the column is not pinned
                as pinning makes no sense when there are no horizontal scrolls.
            </li>
            <li>
                The data is grouped and the group row spans the width of the grid. This group row
                is included in print layout as normal.
            </li>
        </ul>
    </p>

    <?= example('For Print Complex', 'for-print-complex', 'generated', array("enterprise" => 1)) ?>

    <h2>Animations & Redraw</h2>

    <p>
        When the grid is in print layout, the grid does <b>not</b> use absolute positioning for the rows,
        rather the rows are laid out using normal flow. In other words normally the grid places each row
        using exact pixel positioning - this makes things such as row animation possible where the grid
        moves the row by changing absolute pixel position and uses CSS transition for the row to animate
        to the new location. This happens usually after filtering or sorting. When in print
        mode, the rows are laid out in the order they appear in the dom - this makes things such as page
        breaks possible but removes the possibility of animations.
    </p>

    <p>
        When in print layout the grid will redraw the entire grid any time there is a change to the rows.
        If just one row is added / removed, or a filter or sort is applied, the entire DOM is removed and
        all rows are inserted again from top to bottom. This makes print layout best for non-interactive
        grids (ie for printing) as you will loose animations and changes to the grid will be expensive
        (the grid redraws everything on every change).
    </p>

    <h2>Don't Print Large Data</h2>

    <p>
        Do not use this technique for printing if you are showing a large number of rows or columns.
        This is not a problem with the grid, it is a limitation on browsers on how much data they can
        easily display in one web page. If you try to render lots of data into the web page, the web page
        will create lots of DOM elements and will either slow things down or simply hang the browser.
        ag-Grid gets around this problem by virtualising the rows and columns. However if you render the whole
        grid, there is no possibility of virtualising the rows or columns.
    </p>

    <p>
        If you want to allow printing large data sets it's best to get your users to export to CSV or Excel
        and then print from another non-web based application.
    </p>

    <h2>Keep Print Layout for Print Only</h2>

    <p>
        When the grid is in print layout, it will be rendering all cells without using row virtualisation.
        This means that the grid will be slower given the amount of DOM it is rendering. Only use
        print layout when you actually want to print. All of the functions (filtering, sorting, dragging columns
        etc) will work, however the performance will be impacted if the data set is large and will frustrate
        your users. For this reason it's best keeping print layout for printing only and normal (or auto-height)
        layout at all other times.
    </p>

    <h2>Row Models</h2>

    <p>
        The only <a href="../javascript-grid-row-models/">Row Model</a> that print layout works with is
        the default <a href="../javascript-grid-client-side-model/">Client Side</a> row model. It will
        not work with the others (
        <a href="../javascript-grid-infinite-scrolling/">Infinite</a></b>,
        <a href="../javascript-grid-server-side-model/">Server-side</a> or
        <a href="../javascript-grid-viewport/">Viewport</a>). This is because the grid will render the
        entire data-set which goes against the philosophy of the other row models which lazy load data.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>
