<?php
$key = "Events";
$pageTitle = "ag-Grid Events";
$pageDescription = "Learn how each events impacts ag-Grid.";
$pageKeyboards = "javascript data grid ag-Grid events";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="events" class="first-h1">Grid Events</h1>

    <table id="ag-grid-events" class="table">

        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Selection</td>
        </tr>

        <tr>
            <th>cellClicked</th>
            <td>Cell is clicked.</td>
        </tr>
        <tr>
            <th>cellDoubleClicked</th>
            <td>Cell is double clicked.</td>
        </tr>
        <tr>
            <th>cellFocused</th>
            <td>Cell is focused.</td>
        </tr>
        <tr>
            <th>rowClicked</th>
            <td>Row is clicked.</td>
        </tr>
        <tr>
            <th>rowDoubleClicked</th>
            <td>Row is double clicked.</td>
        </tr>
        <tr>
            <th>rowSelected</th>
            <td>Row is selected or deselected.</td>
        </tr>
        <tr>
            <th>selectionChanged</th>
            <td>Row selection is changed. Use the grid API to get the new row selected.</td>
        </tr>
        <tr>
            <th>cellContextMenu</th>
            <td>Cell is right clicked.</td>
        </tr>
        <tr>
            <th>rangeSelectionChanged</th>
            <td>A change to range selection has occurred.</td>
        </tr>
        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Editing</td>
        </tr>

        <tr>
            <th>cellValueChanged</th>
            <td>Value has changed after editing.</td>
        </tr>
        <tr>
            <th>rowValueChanged</th>
            <td>A cells value within a row has changed.</td>
        </tr>
        <tr>
            <th>rowEditingStarted</th>
            <td>Editing a row has started (when row editing is enabled). When row editing, this event will be fired
                once, and <code>cellEditingStarted</code> will be fired for each cell being edited.
            </td>
        </tr>
        <tr>
            <th>rowEditingStopped</th>
            <td>Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired
                once, and <code>cellEditingStopped</code> will be fired for each cell being edited.
            </td>
        </tr>
        <tr>
            <th>cellEditingStarted</th>
            <td>Editing a cell has started.</td>
        </tr>
        <tr>
            <th>cellEditingStopped</th>
            <td>Editing a cell has stopped.</td>
        </tr>
        <tr>
            <th>itemsAdded</th>
            <td>Client added a new row.</td>
        </tr>
        <tr>
            <th>itemsRemoved</th>
            <td>Client removed a row.</td>
        </tr>
        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Sort & Filter</td>
        </tr>

        <tr>
            <th>sortChanged</th>
            <td>
                Sort has changed, grid also listens for this and updates the model.<br/>
            </td>
        </tr>
        <tr>
            <th>filterChanged</th>
            <td>
                Filter has changed, grid also listens for this and updates the model.<br/>
            </td>
        </tr>

        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Columns</td>
        </tr>

        <tr>
            <th>columnEverythingChanged</th>
            <td>Shotgun - gets called when either a) new columns are set or b) columnApi.setState() is used, so
                everything has changed.
            </td>
        </tr>
        <tr>
            <th>rowGroupOpened</th>
            <td>A row group was opened or closed.</td>
        </tr>
        <tr>
            <th>columnVisible</th>
            <td>A column, or group of columns, was hidden / shown.</td>
        </tr>
        <tr>
            <th>columnPinned</th>
            <td>A column, or group of columns, was pinned / unpinned.</td>
        </tr>
        <tr>
            <th>columnResized</th>
            <td>A column was resized.</td>
        </tr>
        <tr>
            <th>columnRowGroupChanged</th>
            <td>A row group column was added or removed.</td>
        </tr>
        <tr>
            <th>columnValueChanged</th>
            <td>A value column was added or removed.</td>
        </tr>
        <tr>
            <th>columnMoved</th>
            <td>A column was moved. To find out when the column move is finished you can use the dragStopped event below.
            </td>
        </tr>
        <tr>
            <th>columnGroupOpened</th>
            <td>A column group was opened / closed.</td>
        </tr>
        <tr>
            <th>virtualColumnsChanged</th>
            <td>The list of rendered columns has changed (only columns in the visible scrolled viewport are rendered by
                default).
            </td>
        </tr>
        <tr>
            <th>newColumnsLoaded</th>
            <td>User has set in new columns.</td>
        </tr>
        <tr>
            <th>columnPivotModeChanged</th>
            <td>The pivot mode flag was changed</td>
        </tr>
        <tr>
            <th>columnRowGroupChanged</th>
            <td>A row group column was added, removed or order changed.</td>
        </tr>
        <tr>
            <th>columnPivotChanged</th>
            <td>A pivot column was added, removed or order changed.</td>
        </tr>
        <tr>
            <th>gridColumnsChanged</th>
            <td>The list of grid columns has changed.</td>
        </tr>
        <tr>
            <th>displayedColumnsChanged</th>
            <td>The list of displayed columns has changed, can result from columns open / close, column move, pivot,
                group, etc
            </td>
        </tr>

        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Pagination</td>
        </tr>
        <tr>
            <th>paginationReset</th>
            <td>
                Pagination service is reset.
            </td>
        </tr>
        <tr>
            <th>paginationPageLoaded</th>
            <td>
                Pagination page load is finished.
            </td>
        </tr>
        <tr>
            <th>paginationPageRequested</th>
            <td>
                Pagination page load is requested.
            </td>
        </tr>

        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2">Miscellaneous</td>
        </tr>
        <tr>
            <th>gridReady</th>
            <td>ag-Grid has initialised. The name 'ready'
                was influenced by the authors time programming the Commodore 64. Use this event if,
                for example, you need to use the grid's API to fix the columns to size.
            </td>
        </tr>
        <tr>
            <th>gridSizeChanged</th>
            <td>The grid had to lay out again because it changed size.</td>
        </tr>
        <tr>
            <th>modelUpdated</th>
            <td>Displayed rows have changed. Happens following sort, filter or tree expand / collapse events.</td>
        </tr>
        <tr>
            <th>floatingRowDataChanged</th>
            <td>The client has set new floating data into the grid</td>
        </tr>
        <tr>
            <th>virtualRowRemoved</th>
            <td>A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row.</td>
        </tr>
        <tr>
            <th>viewportChanged</th>
            <td>Informs when rows rendered into the DOM changes.</td>
        </tr>
        <tr>
            <th>bodyScroll</th>
            <td>Informs when the body is scrolled horizontally or vertically.</td>
        </tr>
        <tr>
            <th>dragStarted, dragStopped</th>
            <td>When column dragging starts or stops. Useful if you want to wait until after a drag
                event before doing an action.
            </td>
        </tr>
        <tr>
            <th>rowDataChanged</th>
            <td>The client has set new data into the grid</td>
        </tr>
        <tr>
            <th>componentStateChanged</th>
            <td>
                Only used by React, Angular 2+, Web Components, Aurelia and VueJS ag-Grid components
                (not used if doing plain JavaScript or Angular 1.x). If the grid receives changes due
                to bound properties, this event fires after the grid has finished processing the
                change.
            </td>
        </tr>
    </table>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
