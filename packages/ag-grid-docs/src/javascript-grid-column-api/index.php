<?php
$pageTitle = "ag-Grid Reference Guide: Column API";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference guide covers the methods available in the Column API. It also covers how to save and restore the column state. This includes column widths, aggregation fields and visibility.";
$pageKeyboards = "ag-Grid Column API";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>
        <h1 id="column-api">Column API</h1>

        <p class="lead">
            Below are listed all the column API methods.
        </p>

        <h2 id="column-keys">Column Keys</h2>

        <p>
            Some of the API methods take Column Key (named <code>colKey</code>) which has type <code>Column|string</code>.
            This means you can pass either a Column object (that
            you receive from calling one of the other methods) or you pass in the Column ID (which is a string).
            The Column ID is a property of the column definition. If you do not provide the Column ID, the grid will
            create one for you (first by trying to use the field if it is unique, otherwise it will generate and ID).
        </p>

        <table class="table reference">
            <tr>
                <th>sizeColumnsToFit(width)</th>
                <td>
                    Gets the grid to size the columns to the specified with, eg sizeColumnsToFix(900).
                    To have the grid fit the columns to the grid's width, use the Grid API
                    <code>gridApi.sizeColumnsToFit()</code> instead.
                </td>
            </tr>
            <tr>
                <th>setColumnGroupOpened(group, newValue)</th>
                <td>Call this if you want to open or close a column group.</td>
            </tr>
            <tr>
                <th>getColumnGroup(name)</th>
                <td>Returns the column group with the given name.</td>
            </tr>
            <tr>
                <th>getDisplayNameForColumn(column)</th>
                <td>Returns the display name for a column. Useful if you are doing your own header rendering
                    and want the grid to work out if headerValueGetter is used, or if you are doing your own
                    column management GUI, to know what to show as the column name.
                </td>
            </tr>
            <tr>
                <th>getDisplayNameForColumnGroup(columnGroup)</th>
                <td>Returns the display name for a column group (when grouping columns).</td>
            </tr>
            <tr>
                <th>getColumn(colKey)</th>
                <td>Returns the column with the given 'key'. The key can either be the colId (a string)
                    or the colDef (an object).
                </td>
            </tr>
            <tr>
                <th>getColumnState()</th>
                <td>Gets the state of the columns. Typically used when saving column state.</td>
            </tr>
            <tr>
                <th>setColumnState(columnState)</th>
                <td>Sets the state of the columns from a previous state. Returns false if one or more columns could not be found.</td>
            </tr>
            <tr>
                <th>resetColumnState()</th>
                <td>Sets the state back to match the originally provided column definitions.</td>
            </tr>

            <tr>
                <th>getColumnGroupState()</th>
                <td>Gets the state of the column groups. Typically used when saving column group state.</td>
            </tr>
            <tr>
                <th>setColumnGroupState(columnState)</th>
                <td>Sets the state of the column group state from a previous state.</td>
            </tr>
            <tr>
                <th>resetColumnGroupState()</th>
                <td>Sets the state back to match the originally provided column definitions.</td>
            </tr>

            <tr>
                <th>isPinning()</th>
                <td>Returns true if pinning left or right, otherwise false.</td>
            </tr>
            <tr>
                <th>isPinningLeft()</th>
                <td>Returns true if pinning left, otherwise false.</td>
            </tr>
            <tr>
                <th>isPinningRight()</th>
                <td>Returns true if pinning right, otherwise false.</td>
            </tr>
            <tr>
                <th>getDisplayedColAfter(col)</th>
                <td>Returns the column to the right of the provided column, taking into consideration open / closed
                    column groups and visible columns. This is useful if you need to know what column is beside yours eg
                    if implementing your own cell navigation.
                </td>
            </tr>
            <tr>
                <th>getDisplayedColBefore(col)</th>
                <td>Same as getVisibleColAfter except gives col to the left.</td>
            </tr>
            <tr>
                <th>setColumnVisible(colKey, visible)</th>
                <td>Sets the visibility of a column. Key can be the column id or Column object.</td>
            </tr>
            <tr>
                <th>setColumnsVisible(colKeys, visible)</th>
                <td>Same as setColumnVisible, but provide a list of column keys.</td>
            </tr>
            <tr>
                <th>setColumnPinned(colKey, pinned)</th>
                <td>Sets the column pinned / unpinned. Key can be the column id, field, ColDef object or Column
                    object.
                </td>
            </tr>
            <tr>
                <th>setColumnsPinned(colKeys, pinned)</th>
                <td>Same as setColumnPinned, but provide a list of column keys.</td>
            </tr>
            <tr>
                <th>autoSizeColumn(colKey)</th>
                <td>Auto-sizes a column based on its contents.</td>
            </tr>
            <tr>
                <th>autoSizeColumns(colKeys)</th>
                <td>Same as autoSizeColumn, but provide a list of column keys.</td>
            </tr>
            <tr>
                <th>getAllColumns()</th>
                <td>Returns all the columns, regardless of visible or not.</td>
            </tr>
            <tr>
                <th>getAllGridColumns()</th>
                <td>Returns all the grid columns, same as getAllColumns(), except a) it has the order of the columns
                    that are presented in the grid and b) it's after the 'pivot' step, so if pivoting, has the value
                    columns for the pivot.
                </td>
            </tr>
            <tr>
                <th>getAllDisplayedVirtualColumns()</th>
                <td>Same as getAllGridColumns(), except only returns rendered columns - ie columns not within the
                    viewport
                    that are not rendered, due to column virtualisation, are not displayed.
                </td>
            </tr>
            <tr>
                <th>getDisplayedCenterColumns(), getDisplayedLeftColumns(), getDisplayedRightColumns(),
                    getAllDisplayedColumns()
                </th>
                <td>Returns all columns currently displayed (eg are visible and if in a group, the group is showing
                    the columns) for the pinned left, center and pinned right portions of the grid.
                </td>
            </tr>
            <tr>
                <th>getLeftDisplayedColumnGroups(), getCenterDisplayedColumnGroups(), getRightDisplayedColumnGroups(),
                    getAllDisplayedColumnGroups()
                </th>
                <td>Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you
                    are grouping,
                    these return the top level groups - you can navigate down through each one to get the other lower
                    level
                    headers and finally the columns at the bottom.
                </td>
            </tr>
            <tr>
                <th>moveColumn(colKey, toIndex)</th>
                <td>Moves a column to toIndex. The column is first removed, then added at the 'toIndex' location, thus
                    index locations will change to the right of of the column after the removal
                </td>
            </tr>
            <tr>
                <th>moveColumns(colKeys[], toIndex)</th>
                <td>Same as moveColumn but works on list.</td>
            </tr>
            <tr>
                <th>moveColumnByIndex(fromIndex, toIndex)</th>
                <td>Same as moveColumn but works on index locations.</td>
            </tr>

            <tr>
                <th>setColumnAggFunc(column, aggFunc)</th>
                <td>Sets the agg function for a column. Set to one of [min,max,sum].</td>
            </tr>
            <tr>
                <th>setColumnWidth(column, newWidth, finished=true)</th>
                <td>Sets the column width. The finished flag gets included in the resulting event and not used
                    internally
                    by the grid. The finished flag is intended for dragging, where a dragging action will produce many
                    'columnWidth' events, so the consumer of events knows when it receives the last event in a stream.
                    The finished parameter is optional, it defaults to 'true'.
                </td>
            </tr>

            <tr>
                <th>getRowGroupColumns(), addRowGroupColumn(colKey), addRowGroupColumns(colKeys),
                    removeRowGroupColumn(colKey), removeRowGroupColumns(colKeys), setRowGroupColumns(colKeys),
                    moveRowGroupColumn(fromIndex, toIndex)
                </th>
                <td>
                    Methods for management of column row groups.
                </td>
            </tr>

            <tr>
                <th>
                    getPivotColumns(), setPivotColumns(colKeys), removePivotColumn(),
                    removePivotColumns(colKeys), addPivotColumn(colKey),
                    addPivotColumns(colKeys)
                </th>
                <td>
                    Methods for management of column pivots.
                </td>
            </tr>

            <tr>
                <th>
                    isPivotMode(), setPivotMode(mode)
                </th>
                <td>
                    Methods to get / set the pivot mode.
                </td>
            </tr>

            <tr>
                <th>
                    getSecondaryPivotColumn(pivotKeys, valueColId)
                </th>
                <td>
                    Returns the pivot column for the given pivotKeys and valueColumn. Useful to then call
                    operations on the pivot column.
                </td>
            </tr>

            <tr>
                <th>
                    getValueColumns(),
                    removeValueColumn(colKey),
                    removeValueColumns(colKeys),
                    addValueColumn(colKey),
                    addValueColumns(colKeys)
                </th>
                <td>
                    Methods for management of value column aggregates (for aggregating when grouping or pivoting).
                </td>
            </tr>
        </table>



<?php include '../documentation-main/documentation_footer.php'; ?>