<?php
$key = "API";
$pageTitle = "Angular Compiling";
$pageDescription = "Angular Grid Angular Compiling";
$pageKeyboards = "Angular Grid Angular Compiling";
include '../documentation_header.php';
?>

<div>
    <h2>API</h2>

    Angular Grid exposes an API for the rest of your application to interact with it.

    <p/>

    The API is placed inside the grid options wrapper with the parameter 'api'. You
    do not need to create the API object, Angular Grid does this for you.

    <p/>
    The methods exposed through the API are as follows:

    <table class="table">
        <tr>
            <th>Function</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>onNewRows()</th>
            <td>Call to inform the grid that the rows have changed. The grid will assume the rows are brand new
                and draw all rows from scratch.</td>
        </tr>
        <tr>
            <th>onNewCols()</th>
            <td>Call to inform the grid that the columns have changed. The grid will redraw all the colum headers,
                and then redraw all of the rows. The rows will not be discarded, so any selections, scrolling or groups
                open, will stay.</td>
        </tr>
        <tr>
            <th>unselectAll()</th>
            <td>Clear all row selections.</td>
        </tr>
        <tr>
            <th>selectIndex(index, multi, suppressEvents)</th>
            <td>Select the row at the given index. If multi is true, then previous selections will be kept (ie allow
                multi-select). If multi is false, any previously selected row will be unselected. If suppressEvents
                is true, then <i>rowSelected</i> and <i>selectionChanged</i> will not be called during the selection.</td>
        </tr>
        <tr>
            <th>refreshView()</th>
            <td>Redraw all visible rows. Handy has a blanked 'redraw all' if changes have been made to the row data.</td>
        </tr>
        <tr>
            <th>getModel()</th>
            <td>Returns the row model inside the table. From here you can see the original rows, rows after filter has
            been applied, rows after aggregation has been applied, and the final set of 'to be displayed' rows.</td>
        </tr>
        <tr>
            <th>onGroupExpandedOrCollapsed()</th>
            <td>If after getting the model, you expand or collapse a group, call this method to inform the grid. It will
            work out the final set of 'to be displayed' rows again (ie expand or collapse the group visually).</td>
        </tr>
        <tr>
            <th>expandAll()</th>
            <td>Expand all groups.</td>
        </tr>
        <tr>
            <th>collapseAll()</th>
            <td>Collapse all groups.</td>
        </tr>
        <tr>
            <th>rowDataChanged(rows)</th>
            <td>Inform the table that the provided rows have changed. If any of the rows are currently visible (ie
                due to row virtualisation, these rows have corresponding DOM elements) then only these rows are redrawn.
                If none of the rows are visible, nothing is done. The table uses object reverence comparison (ie row1 == row2)
                to check the provided rows with the original rows, to find the corresponding rows.</td>
        </tr>
        <tr>
            <th>setQuickFilter(quickFilter)</th>
            <td>Pass a quick filter text into Angular Grid for filtering. If using Angular, the grid watched the 'quickFilterText'
                attribute of the gridOptions. If you won't want to use quickFilterText (ie if not using AngularJS) then you can
                call this method instead to apply a quick filter.
            </td>
        </tr>
        <tr>
            <th>addVirtualRowListener(rowIndex, callback)</th>
            <td>Register a callback for notifications about a particular virtualised row. When
                the row is removed from the table (due to virtualisation), the callback is removed.
                This callback is intended for cell renderers, that want to register for events
                for the rendered row - thus if the row is no longer rendered on the screen, the
                callbacks stop. If the row is redrawn, then the cell renderer must register
                another callback.
            </td>
        </tr>
        <tr>
            <th>showLoading(show)</th>
            <td>Show or hide the loading icon. Pass either true or false. If the method onNewRows
                is called, the loading icon is automatically hidden.
            </td>
        </tr>
        <tr>
            <th>recomputeAggregates()</th>
            <td>Recomputes the aggregates in the model and refreshes all the group rows.
            </td>
        </tr>
    </table>

</div>

<?php include '../documentation_footer.php';?>
