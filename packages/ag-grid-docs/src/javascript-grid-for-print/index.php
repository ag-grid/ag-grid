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
        A grid using print layout will not use any scrollbars so all cells will get printed.
        In other words, the grid will auto-size to fit all contents.
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

    <h3>Grid Height</h3>

    <p>
        The grid height is automatically set by the grid when in print layout. For this to work
        the application should <b>not</b> set a height onto the grid component. If moving from
        normal layout to print layout and height is set for normal layout, then this height must
        be removed. This can be seen in the simple example above.
    </p>

    <h3>Grid Width</h3>

    <p>
        The grid width is <b>not</b> automatically set. The grid will assume the width of the grid
        is set by the application. To assist with this, the grid provides the API call
        <code>getPreferredWidth()</code> which returns the number of pixels the grid needs to
        render all the currently visible columns.
    </p>

    <p>
        It is up to the application to set the width of the grid to fit all columns.
    </p>

<snippet>
    // set the width of the grid to match the preferred width
    var preferredWidth = gridOptions.api.getPreferredWidth();

    // add 2 pixels for the grid border. this depends on how you have styled the grid.
    preferredWidth += 2;

    // set the width onto the grid DOM element
    eGridDiv.style.width = preferredWidth + 'px';
</snippet>

    <note>
        The grid deals with adjusting the height and width differently. The grid can manage the height by
        itself but needs application help for the width. This is due to the DOM having different rules for
        fitting content vertically and horizontally.
    </note>

    <h2>Page Break</h2>

    <p>
        When in print layout all cells will have the CSS property <code>page-break-inside: avoid</code>
        so cells will not be split across pages (eg the top half of the cell on one printed page with the
        other half on another printed page).
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
                    <li>Remove the height setting from the grid to allow the grid to auto-fit it's height.</li>
                    <li>Adjust the width of the grid to match it's preferred width.</li>
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

<?php include '../documentation-main/documentation_footer.php';?>
