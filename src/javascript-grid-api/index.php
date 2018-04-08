<?php
$pageTitle = "ag-Grid Reference Guide: Grid API";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference guide covers all of the methods available in the Grid API.";
$pageKeyboards = "ag-Grid API";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

    <h1 id="grid-api" class="first-h1">Grid API</h1>

    <h2>Columns</h2>
    <table class="table reference">
        <tr>
            <th>sizeColumnsToFit()</th>
            <td>Gets columns to adjust in size to fit the grid horizontally.</td>
        </tr>
        <tr>
            <th>setColumnDefs(colDefs)</th>
            <td>Call to set new column definitions into the grid. The grid will redraw all the column headers,
                and then redraw all of the rows.</td>
        </tr>

    </table>
    <h2>Data</h2>
    <table class="table reference">

        <tr>
            <th>setRowData(rows)</th>
            <td>Set new rows into the grid.</td>
        </tr>
        <tr>
            <th>updateRowData(transaction)</th>
            <td>Update row data into the grid. Pass a transaction object with lists for add, remove and update.</td>
        </tr>
        <tr>
            <th>setDatasource(datasource)</th>
            <td>Set new datasource into the grid. The grid will reset all paging
                and load the first page. If you want to reset the paging but keep the
                datasource, call this method with the same datasource.</td>
        </tr>
        <tr>
            <th>
                setPinnedTopRowData(rowData)<br/>
                setPinnedBottomRowData()<br/>
                getPinnedTopRowCount()<br/>
                getPinnedBottomRowCount()<br/>
                getPinnedTopRow(index)<br/>
                getPinnedBottomRow(index)
            </th>
            <td>
                Methods for getting and setting the data and getting the Row Nodes of the pinned rows.
            </td>
        </tr>
        <tr>
            <th>getModel()</th>
            <td>
                Returns the row model inside the table. From here you can see the original rows, rows after filter has
                been applied, rows after aggregation has been applied, and the final set of 'to be displayed' rows.
            </td>
        </tr>
        <tr>
            <th>refreshInMemoryRowModel(params)</th>
            <td>
                Gets the In Memory Row Model to refresh, executing the grouping, filtering and sorting again.
            </td>
        </tr>

    </table>
    <h2>Accessing Row Nodes</h2>
    <table class="table reference">

        <?php include '../javascript-grid-accessing-data/accessingDataProperties.php' ?>
        <?php printPropertiesRows($getRowNodeApi) ?>

    </table>
<h2>Master Detail</h2>
    <table class="table reference">
        <tr>
            <th>getDetailGridInfo(detailGridId)</th>
            <td>Returns the <code>DetailGridInfo</code> corresponding to the supplied <code>detailGridId</code>. See
                <a href="../javascript-grid-master-detail">Master Detail</a> for more details.
            </td>
        </tr>
        <tr>
            <th>forEachDetailGridInfo(callback)</th>
            <td>Iterates through each <code>DetailGridInfo</code> in the grid and calls the supplied callback on each.
                See <a href="../javascript-grid-master-detail">Master Detail</a> for more details.
            </td>
        </tr>

    </table>
<h2>Selection</h2>
    <table class="table reference">
        <tr>
            <th>selectAll()</th>
            <td>Select all rows (even rows that are not visible due to grouping being enabled and their groups not expanded).</td>
        </tr>
        <tr>
            <th>deselectAll()</th>
            <td>Clear all row selections.</td>
        </tr>
        <tr>
            <th>selectAllFiltered()</th>
            <td>Select all filtered rows.</td>
        </tr>
        <tr>
            <th>deselectAllFiltered()</th>
            <td>Clear all filtered selections.</td>
        </tr>
        <tr>
            <th>getSelectedNodes()</th>
            <td>Returns a list of selected nodes. Getting the underlying node (rather than the data) is useful when working
                with tree / aggregated data, as the node can be traversed.</td>
        </tr>
        <tr>
            <th>getSelectedRows()</th>
            <td>Returns a list of selected rows (ie row data that you provided).</td>
        </tr>
        <tr>
            <th>getBestCostNodeSelection()</th>
            <td>Returns a list of all selected nodes at 'best cost' - a feature to be used
                with groups / trees. If a group has all its children selected,
                then the group appears in the result, but not the children.
                Designed for use with 'children' as the group selection type,
                where groups don't actually appear in the selection normally.</td>
        </tr>
        <tr>
            <th>getRangeSelections()</th>
            <td>Returns the list of selected ranges.</td>
        </tr>
        <tr>
            <th>addRangeSelection(rangeSelection)</th>
            <td>Adds to the selected range.</td>
        </tr>
        <tr>
            <th>clearRangeSelection()</th>
            <td>Clears the selected range.</td>
        </tr>

    </table>
<h2>Refresh</h2>
    <table class="table reference">

        <tr>
            <th>refreshCells(params)</th>
            <td>Gets the grid to do change detection on all cells and refresh the cell if needed.</td>
        </tr>
        <tr>
            <th>redrawRows(params)</th>
            <td>Gets the grid to remove a row from the DOM and recreate it again from scratch.</td>
        </tr>
        <tr>
            <th>refreshHeader()</th>
            <td>Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed.</td>
        </tr>
        <tr>
            <th>flashCells(params)</th>
            <td>Flash rows, columns or individual cells. See <a href="../javascript-grid-data-update/#flashing">Flashing Cells</a>.</td>
        </tr>

    </table>
<h2>Sort & Filter</h2>
    <table class="table reference">

        <tr>
            <th>setQuickFilter(quickFilter)</th>
            <td>Pass a quick filter text into ag-Grid for filtering. If using Angular, the grid watched the 'quickFilterText'
                attribute of the gridOptions. If you won't want to use quickFilterText (ie if not using AngularJS) then you can
                call this method instead to apply a quick filter.
            </td>
        </tr>
        <tr>
            <th>isQuickFilterPresent()</th>
            <td>
                Returns true if the quick filter is set, otherwise false.
            </td>
        </tr>
        <tr>
            <th>isAdvancedFilterPresent()</th>
            <td>
                Returns true if the advanced filter is set, otherwise false.
            </td>
        </tr>
        <tr>
            <th>isAnyFilterPresent()</th>
            <td>
                Returns true if any filter is set. This includes quick filter, advanced filter or external filter.
            </td>
        </tr>
        <tr>
            <th>getFilterInstance(col)</th>
            <td>Returns the filter component instance for the column. Either provide the colDef (matches on object
                reference) or the column field attribute (matches on string comparison). Matching by field
                is normal. Matching by colDef is useful when field is missing or not unique.
            </td>
        </tr>
        <tr>
            <th>getFilterModel()</th>
            <td>Gets the current state of all the advanced filters. Used for saving filter state.
            </td>
        </tr>
        <tr>
            <th>setFilterModel(model)</th>
            <td>Sets the state of all the advanced filters. Provide it with what you get from getFilterModel()
                to restore filter state.
            </td>
        </tr>
        <tr>
            <th>onFilterChanged()</th>
            <td>Informs the grid that a filter has changed. This is typically called after a filter
                change through one of the filter APIs.
            </td>
        </tr>
        <tr>
            <th>destroyFilter()</th>
            <td>Destroys a filter, useful to create get a particular filter created from scratch again.</td>
        </tr>
        <tr>
            <th>onSortChanged()</th>
            <td>Gets the grid to act as if the sort was changed. Useful if you update some values in the grid and
                want to get the grid to reorder them according to the new values.</td>
        </tr>
        <tr>
            <th>setSortModel(model)</th>
            <td>Sets the sort state of the grid.
            </td>
        </tr>
        <tr>
            <th>getSortModel()</th>
            <td>Returns the sort state of the grid.
            </td>
        </tr>

    </table>
<h2>Navigation</h2>
    <table class="table reference">

        <tr>
            <th>getFocusedCell()</th>
            <td>Returns the focused cell as an object containing the rowIndex, column and floating (top, bottom or null).</td>
        </tr>
        <tr>
            <th>setFocusedCell(rowIndex, colKey, floating)</th>
            <td>Sets the focus to the specified cell. Set floating to null, 'top', or 'bottom'.</td>
        </tr>
        <tr>
            <th>clearFocusedCell()</th>
            <td>Clears the focused cell.</td>
        </tr>
        <tr>
            <th>tabToNextCell()</th>
            <td>Navigates the grid focus to the next cell, as if tabbing.</td>
        </tr>
        <tr>
            <th>tabToPreviousCell()</th>
            <td>Navigates the grid focus to the previous cell, as if shift-tabbing.</td>
        </tr>

    </table>
<h2>Editing</h2>
    <table class="table reference">
        <tr>
            <th>stopEditing(cancel?)</th>
            <td>
                If a cell is editing, it stops the editing. Pass 'true' if you want to cancel the editing
                (ie don't accept changes). See
                <a href="../javascript-grid-cell-editing/#editing-api">Editing API</a>
            </td>
        </tr>
        <tr>
            <th>startEditingCell(params)</th>
            <td>
                Gets the grid to start editing on a particular cell. See
                <a href="../javascript-grid-cell-editing/#editing-api">Editing API</a>
            </td>
        </tr>
        <tr>
            <th>getEditingCells()</th>
            <td>
                If the grid is editing, returns back details of the editing cell(s). See
                <a href="../javascript-grid-cell-editing/#editing-api">Editing API</a>
            </td>
        </tr>

    </table>
<h2>Export</h2>
    <table class="table reference">

        <tr>
            <th>exportDataAsCsv(params)</th>
            <td>Does a CSV export of the grid's data.</td>
        </tr>
        <tr>
            <th>getDataAsCsv(params)</th>
            <td>Similar to exportDataAsCsv, except returns result as a string rather than export it.</td>
        </tr>
        <tr>
            <th>exportDataAsExcel(params)</th>
            <td>Does a Excel export of the grid's data.</td>
        </tr>
        <tr>
            <th>getDataAsExcel(params)</th>
            <td>Similar to exportDataAsExcel, except returns result as a string rather than export it.</td>
        </tr>

    </table>
<h2>Events</h2>
    <table class="table reference">

        <tr>
            <th>addEventListener(eventType, listener)</th>
            <td>Add an event listener for the said event type. Works similar to addEventListener for a browser DOM element.</td>
        </tr>
        <tr>
            <th>addGlobalListener(listener)</th>
            <td>Add an event listener for all event types coming from the grid.</td>
        </tr>
        <tr>
            <th>removeEventListener(eventType, listener)</th>
            <td>Remove an event listener.</td>
        </tr>
        <tr>
            <th>removeGlobalListener(listener)</th>
            <td>Remove a global event listener.</td>
        </tr>
        <tr>
            <th>dispatchEvent(event)</th>
            <td>Dispatch an event through the grid. Useful if you are doing a custom cellRenderer and want
                to fire events such as 'cellValueChanged'.</td>
        </tr>

    </table>
<h2>Row Groups</h2>
    <table class="table reference">

        <tr>
            <th>expandAll()</th>
            <td>Expand all groups.</td>
        </tr>
        <tr>
            <th>collapseAll()</th>
            <td>Collapse all groups.</td>
        </tr>
        <tr>
            <th>onGroupExpandedOrCollapsed()</th>
            <td>
                If after getting the model, you expand or collapse a group, call this method to inform the grid. It will
                work out the final set of 'to be displayed' rows again (ie expand or collapse the group visually).
            </td>
        </tr>

    </table>
<h2>Rendering</h2>
    <table class="table reference">

        <tr>
            <th>getRenderedNodes()</th>
            <td>Retrieve rendered nodes. Due to virtualisation this will contain only the current
                visible rows and the amount in the buffer.
            </td>
        </tr>
        <tr>
            <th>getCellRendererInstances(params)</th>
            <td>
                Returns back the list of active
                <a href="../javascript-grid-cell-rendering-components/#accessing-cell-renderer-instances">Cell Renderer Instances</a>.
            </td>
        </tr>
        <tr>
            <th>getCellEditorInstances(params)</th>
            <td>
                Returns back the list of active
                <a href="../javascript-grid-cell-editor/#accessing-cell-editor-instances">Cell Editor Instances</a>.
            </td>
        </tr>

    </table>
<h2>Scrolling</h2>
    <table class="table reference">

        <tr>
            <th>ensureIndexVisible(index, position)</th>
            <td>Ensures the row index is visible by vertically scrolling the grid. The valid values for positions are
                <code>{'top', 'middle', 'bottom', undefined/null}</code>. If <code>top</code>, <code>middle</code>
                or <code>bottom</code>, the grid will scroll the row to place the row at top, middle or bottom.
                If <code>undefined</code> or <code>null</code> then grid will do the minimum scrolling to show
                the row, ie if grid needs to scroll up then it will scroll so that the row is at the top, if the grid
                needs to scroll down then it will scroll so that the row is at the bottom, if the row is already in view
                then the grid will do nothing.
        </tr>
        <tr>
            <th>ensureNodeVisible(comparator, position)</th>
            <td>Ensures a node is visible, scrolling the table if needed. Provide one of a) the node
                b) the data object c) a comparator function (that takes the node as a parameter, and returns
                true for match, false for no match). The valid values for positions are same as for
                <code>api.ensureIndexVisible()</code>.
        </tr>
        <tr>
            <th>ensureColumnVisible(colId)</th>
            <td>Ensures the column is visible, scrolling the table if needed.</td>
        </tr>
        <tr id="getVerticalPixelRange">
            <th>getVerticalPixelRange()</th>
            <td>Returns a JSON object with two properties:
                <ul class="content">
                    <li>
                        top: The top pixel position of the current scroll in the grid
                    </li>
                    <li>
                        bottom: The bottom pixel position of the current scroll in the grid
                    </li>
                </ul>
            </td>
        </tr>

    </table>
<h2>Overlays</h2>
    <table class="table reference">

        <tr>
            <th>showLoadingOverlay()</th>
            <td>Show the loading overlay.</td>
        </tr>
        <tr>
            <th>showNoRowsOverlay()</th>
            <td>Show the 'no rows' overlay.</td>
        </tr>
        <tr>
            <th>hideOverlay()</th>
            <td>Hides the overlay if showing.</td>
        </tr>

    </table>
<h2>Clipboard</h2>
    <table class="table reference">

        <tr>
            <th>copySelectedRangeToClipboard(includeHeaders)</th>
            <td>Copies the selected ranges to the clipboard.</td>
        </tr>
        <tr>
            <th>copySelectedRangeDown()</th>
            <td>Copies the selected range down, similar to Ctrl+D in Excel.</td>
        </tr>

    </table>
<h2>Pagination</h2>
    <table class="table reference">

        <?php include '../javascript-grid-pagination/paginationProperties.php' ?>
        <?php printPropertiesRows($paginationApi) ?>

    </table>
<h2>Headers</h2>
    <table class="table reference">

        <?php include '../javascript-grid-column-header/headerHeightProperties.php' ?>
        <?php printPropertiesRows($headerHeightApi) ?>

    </table>
<h2>Miscellaneous</h2>
    <table class="table reference">
        <tr>
            <th>setPopupParent(element)</th>
            <td>DOM element to use as <a href="../javascript-grid-context-menu/#popup-parent">popup parent</a> for grid popups (context menu, column menu etc).</td>
        </tr>
        <tr>
            <th>addRenderedRowListener(event, rowIndex, callback)</th>
            <td>Registers a callback to a virtual row. A virtual row is a row that
                is visually rendered on the screen (rows that are not visible because
                of the scroll position are not rendered).
                Unlike normal events, you do not need to unregister rendered row listeners.
                When the rendered row is removed from the grid, all associated rendered row listeners will
                also be removed. Currently only one event: 'virtualRowRemoved' - listen
                for this event if your cellRenderer needs to do clean down after the
                row no longer exists.
            </td>
        </tr>
        <tr>
            <th>showToolPanel(show)</th>
            <td>Shows (or hides) the tool panel.</td>
        </tr>
        <tr>
            <th>isToolPanelShowing()</th>
            <td>Returns true if the tool panel is showing, otherwise false.</td>
        </tr>
        <tr>
            <th>doLayout()</th>
            <td>Force the grid to lay out its components. The grid, by default, resizes to fit
                the div the grid lives in. This is done a) on initialisation b) window resize
                and c) every 500ms. You should call this if something happens in your application
                where the grid size has changed and you want to lay the grid out without waiting
                for the next 500ms refresh.</td>
        </tr>
        <tr>
            <th>getValue(colKey, node)</th>
            <td>Gets the value for a column for a particular rowNode (row).
                This is useful if you want the raw value of a cell eg implementing your own csv export.
            </td>
        </tr>
        <tr>
            <th>destroy()</th>
            <td>Gets the grid to destroy and release resources. If you are using Angular (version 1 or 2)
                you do not need to call this, as the grid links in with the AngularJS 1.x lifecycle. However if you
                are using Web Components or native Javascript, you do need to call this, to avoid a memory
                leak in your application.
            </td>
        </tr>
        <tr>
            <th>showColumnMenuAfterButtonClick(colKey, buttonElement), showColumnMenuAfterMouseClick(colKey, mouseEvent)</th>
            <td>Shows the column menu after and positions it relative to the provided element (button click) or mouse
                event. Use in conjunction with your own header template.</td>
        </tr>
        <tr>
            <th>checkGridSize()</th>
            <td>Gets the grid to check its size again. This is useful if you do not have the grid in the DOM
                when you create it, call this method after the grid is in the dom to get it to check its width
                and height again (which decides what columns and rows to render).</td>
        </tr>
        <tr>
            <th>resetRowHeights()</th>
            <td>Gets the grid to recalculated the row heights.</td>
        </tr>
        <tr>
            <th>onRowHeightChanged()</th>
            <td>Tells the grid a row height has changed. To be used after calling rowNode.setRowHeight(newHeight).</td>
        </tr>
        <tr>
            <th>copySelectedRowsToClipboard(includeHeaders, columnKeys)</th>
            <td>Copies the selected rows to the clipboard. Set includeHeaders = true to include the headers (default is false)
            set columnKeys to the list of columns if you don't want just specific columns.</td>
        </tr>
        <tr>
            <th>addAggFunc(key, aggFunc), addAggFuncs(aggFuncs), clearAggFuncs()</th>
            <td>Adding and clearing of aggregation functions.</td>
        </tr>
        <tr>
            <th>hidePopupMenu()</th>
            <td>
                Hides any showing <a href="../javascript-grid-context-menu">context menu</a>
                or <a href="../javascript-grid-column-menu">column menu</a>.
            </td>
        </tr>
        <tr>
            <th>setSuppressRowDrag(value)</th>
            <td>
                Sets teh suppressRowDrag property.
            </td>
        </tr>
    </table>


<?php include '../documentation-main/documentation_footer.php';?>
