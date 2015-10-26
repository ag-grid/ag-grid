<?php
$key = "Grid API";
$pageTitle = "Angular Compiling";
$pageDescription = "Angular Grid API";
$pageKeyboards = "Angular Grid API";
include '../documentation_header.php';
?>

<div>
    <h2>Grid API</h2>

    <p>
        The grid API exposes functions that go beyond events and properties that
        you application can call. The grid needs to be initialised before the API
        can be accessed.
    </p>

    <h4>
        <img src="/images/javascript.png" height="20"/>
        <img src="/images/angularjs.png" height="20px"/>
        Javascript and AngularJS 1.x
    </h4>
    <p>
        Use api placed inside gridOptions by the grid during initialisation.
    </p>

    <h4>
        <img src="/images/angular2.png" height="20px"/>
        AngularJS 2
    </h4>
    <p>
        Use api placed inside gridOptions by the grid during initialisation. You can also
        use api directly on the AngularJS 2 grid component.
    </p>

    <h4>
        <img src="/images/webComponents.png" height="20px"/>
        Web Components
    </h4>
    <p>
        Use api placed inside gridOptions by the grid during initialisation. You can also
        use api directly on the DOM element.
    </p>

    <h2>List of API Functions</h2>

    <table class="table">
        <tr>
            <th>Function</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>setRowData(rows)</th>
            <td>Set new rows into the grid.</td>
        </tr>
        <tr>
            <th>setDatasource(datasource)</th>
            <td>Set new datasource into the gird. The grid will reset all paging
                and load the first page. If you want to reset the paging but keep the
                datasource, call this method with the same datasource.</td>
        </tr>
        <tr>
            <th>setColumnDefs(colDefs)</th>
            <td>Call to set new column definitions into the grid. The grid will redraw all the column headers,
                and then redraw all of the rows. The rows will not be discarded, so any selections, scrolling or groups
                open, will stay.</td>
        </tr>
        <tr>
            <th>sizeColumnsToFit()</th>
            <td>Gets columns to adjust in size to fit the grid horizontally.</td>
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
            <th>deselectIndex(index, suppressEvents)<br/>deselectNode(node, suppressEvents)</th>
            <td>Deselects the row node at the given index / node.</td>
        </tr>
        <tr>
            <th>getSelectedNodes()</th>
            <td>Returns a list of selected nodes. Getting the underlying node (rather than the data) is useful
                when working with tree / aggregated data, as the node can be traversed.</td>
        </tr>
        <tr>
            <th>getSelectedNodesById()</th>
            <td>Returns a list of selected nodes by id. This is the internal representation for selection,
                useful to lookup nodes by their unique id.</td>
        </tr>
        <tr>
            <th>getSelectedRows()</th>
            <td>Returns a list of selected rows (ie row data that you provided).</td>
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
            <th>refreshRows(rowNodes)</th>
            <td>Rips out the virtual rows showing representing the provided list of row nodes and then redraws them.</td>
        </tr>
        <tr>
            <th>refreshCells(rowNodes, colIds)</th>
            <td>Gets the individual cells for the provided rowNodes to refresh, the row itself and all other cells stay intact.</td>
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
            <th>refreshPivot()</th>
            <td>Gets the grid to recompute the pivot row groups.</td>
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
            <td>Show or hide the loading icon. Pass either true or false. If the method setRowData
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
            <th>getFilterApi(col)</th>
            <td>Returns the API for the filter for the column. Either provide the colDef (matches on object
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
        <tr>
            <th>forEachNode(callback)</th>
            <td>Iterates through each node (row) in the grid and calls the callback for each node.
                This works similar to the 'forEach' method on a Javascript array. This is called
                for every node, ignoring any filtering or sorting applied within the grid.
                If pagination, then gets called for the currently loaded page.
                If virtual paging, then gets called for each virtual page loaded in the page cache.</td>
        </tr>
        <tr>
            <th>forEachNodeAfterFilter(callback)</th>
            <td>Similar to forEachNode, except skips any filtered out data.</td>
        </tr>
        <tr>
            <th>forEachNodeAfterFilterAndSort(callback)</th>
            <td>Similar to forEachNode, except skips any filtered out data and each the callback
                is called in the order the rows are displayed in the grid.</td>
        </tr>
        <tr>
            <th>exportDataAsCsv(params)</th>
            <td>Does a CSV export of the grid's data.</td>
        </tr>
        <tr>
            <th>getDataAsCsv(params)</th>
            <td>Similar to exportDataAsCsv, except returns result as a string rather than export it.</td>
        </tr>
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
            <th>dispatchEvent(eventType, event)</th>
            <td>Dispatch an event through the grid. Useful if you are doing a custom cellRenderer and want
                to fire events such as 'cellValueChanged'.</td>
        </tr>
        <tr>
            <th>destroy()</th>
            <td>Gets the grid to destroy and release resources. If you are using Angular (version 1 or 2)
            you do not need to call this, as the grid links in with the AngularJS lifecycle. However if you
            are using Web Components or native Javascript, you do need to call this, to avoid a memory
            leak in your application.</td>
        </tr>
    </table>

</div>

<?php include '../documentation_footer.php';?>
