<?php
$key = "Grid API";
$pageTitle = "Angular Compiling";
$pageDescription = "Angular Grid API";
$pageKeyboards = "Angular Grid API";
include '../documentation_header.php';
?>

<div>
    <h2>Grid API</h2>

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
            <td>Inform the grid that the rows have changed. The grid will assume the rows are brand new
                and draw all rows from scratch.</td>
        </tr>
        <tr>
            <th>setRows(rows)</th>
            <td>Set new rows into the grid. This is the same as setting new rows in gridOptions and then calling
                onNewRows()</td>
        </tr>
        <tr>
            <th>onNewDatasource()</th>
            <td>Inform the grid that a new datasource has been set. The grid will reset all paging
                and load the first page..</td>
        </tr>
        <tr>
            <th>setDatasource(datasource)</th>
            <td>Set new datasource into the gird. This is the same as setting a new datasource in gridOptions
            and then calling onNewDatasource()</td>
        </tr>
        <tr>
            <th>onNewCols()</th>
            <td>Call to inform the grid that the columns have changed. The grid will redraw all the colum headers,
                and then redraw all of the rows. The rows will not be discarded, so any selections, scrolling or groups
                open, will stay.</td>
        </tr>
        <tr>
            <th>selectAll()</th>
            <td>Select all rows (even rows that are not visible due to grouping being and their groups not expanded).</td>
        </tr>
        <tr>
            <th>deselectAll()</th>
            <td>Clear all row selections.</td>
        </tr>
        <tr>
            <th>selectIndex(index, multi, suppressEvents)<br/>selectNode(node, multi, suppressEvents)</th>
            <td>Select the row at the given index / node. If multi is true, then previous selections will be kept (ie allow
                multi-select). If multi is false, any previously selected row will be unselected. If suppressEvents
                is true, then <i>rowSelected</i> and <i>selectionChanged</i> will not be called during the selection.</td>
        </tr>
        <tr>
            <th>deselectIndex(index)<br/>deselectNode(node</th>
            <td>Deselects the row node at the given index / node.</td>
        </tr>
        <tr>
            <th>getSelectedNodes()</th>
            <td>Returns a list of selected nodes. Getting the underlying node (rather than the data) is useful
                when working with tree / aggregated data, as the node can be traversed.</td>
        </tr>
        <tr>
            <th>isNodeSelected(node)</th>
            <td>Returns true if the node is selected, or false if it is not selected. If the node is a group node,
                and the group selection is set to 'children', then this will return true if all child (and grand child)
                nodes are selected, false if all unselected, of undefined if a mixture. This is particularly useful
                for group selection 'children' as in this mode, the group nodes never appear in the selected rows (as
                selecting a group implies selecting children).
        </tr>
        <tr>
            <th>getBestCostNodeSelection()</th>
            <td>Returns a list of all selected nodes at 'best cost' - a feature to be used
                with groups / trees. If a group has all it's children selected,
                then the group appears in the result, but not the children.
                Designed for use with 'children' as the group selection type,
                where groups don't actually appear in the selection normally.</td>
        </tr>
        <tr>
            <th>refreshView()</th>
            <td>Rip out and re-insert all visible rows. Handy has a blanket 'redraw all' if changes have been made to the row data.</td>
        </tr>
        <tr>
            <th>softRefreshView()</th>
            <td>Leave the rows intact. Each cell that has been market as volatile (via colDef attribute) will be redrawn. Any cells that
                are not marked as volatile will be left alone, hence keeping any context or state that they have.</td>
        </tr>
        <tr>
            <th>refreshHeader()</th>
            <td>Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed.</td>
        </tr>
        <tr>
            <th>refreshGroupRows()</th>
            <td>Rip out and re-insert all visible header and footer rows only. Only need to call if update the aggregate data yourself,
            as this gets called after <i>recomputeAggregates()</i> anyway.</td>
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
                If none of the rows are visible, nothing is done. The table uses object reference comparison (ie row1 === row2)
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
            <th>getRenderedNodes()</th>
            <td>Retrieve rendered nodes. Due to virtulisation this will contain only the current visible rows and the amount in the buffer.
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
        <tr>
            <th>ensureIndexVisible(index)</th>
            <td>Ensures the index is visible, scrolling the table if needed.</td>
        </tr>
        <tr>
            <th>ensureColIndexVisible(index)</th>
            <td>Ensures the column index is visible, scrolling the table if needed.</td>
        </tr>
        <tr>
            <th>ensureNodeVisible(comparator)</th>
            <td>Ensures a node is visible, scrolling the table if needed. Provide one of a) the node
                b) the data object c) a comparator function (that takes the node as a parameter, and returns
                true for match, false for no match)</td>
        </tr>
        <tr>
            <th>forEachInMemory(callback)</th>
            <td>The callback gets called once for each node that is in browser memory. If pagination,
                then gets called for the currently loaded page. If virtual paging, then gets called
                for each virtual page loaded in the page cache. If doing neither pagination or virtual
                paging, then gets called for every single node (including group nodes).
            </td>
        </tr>
        <tr>
            <th>getFilterApi(col)</th>
            <td>Returns the API for the filter for the column. Either provide the colDef (matches on object
                reference) or the column field attribute (matches on string comparison). Matching by field
                is normal. Matching by colDef is useful when field is missing or not unique.
            </td>
        </tr>
        <tr>
            <th>onFilterChanged()</th>
            <td>Informs the grid that a filter has changed. This is typically called after a filter
                change through one of the filter APIs.
            </td>
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
        <tr>
            <th>getFocusedCell()</th>
            <td>Returns the focused cell as an object containing the rowIndex, colIndex and cell node.</td>
        </tr>
        <tr>
            <th>setFocusedCell(rowIndex, colIndex)</th>
            <td>Scrolls the grid to ensure the cell is visible and then puts focus on the cell.</td>
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
            <td>Force the grid to lay out it's components. The grid, by default, resizes to fit
                the div the grid lives in. This is done a) on initialisation b) window resize
                and c) every 500ms. You should call this if something happens in your application
                where the grid size has changed and you want to lay the grid out without waiting
                for the next 500ms refresh.</td>
        </tr>
        <tr>
            <th>getValue(colDef, data, node)</th>
            <td>Gets the value for a cell. This is what gets passed to the cellRenderer for rendering.
                This is useful if you want the raw value eg for csv export.</td>
        </tr>
        <tr>
            <th>setGroupHeaders(value)</th>
            <td>To set group headers (true / false) after the grid has initialised.</td>
        </tr>
        <tr>
            <th>setHeaderHeight(value)</th>
            <td>To set the header height (in pixels) after the grid has initialised. Set to null or undefined
            to use the default.</td>
        </tr>

    </table>

</div>

<?php include '../documentation_footer.php';?>
