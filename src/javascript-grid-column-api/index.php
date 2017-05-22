<?php
$key = "Column API";
$pageTitle = "ag-Grid Column API";
$pageDescription = "ag-Grid allows you to save and restore the column state. This includes column widths, agg fields and visibility.";
$pageKeyboards = "ag-Grid Column API";
$pageGroup = "interfacing";
include '../documentation-main/documentation_header.php';
?>

    <div>

        <h2 id="column-api">Column API</h2>

        <p>
            The column api has methods for interacting with the columns of the grid. Using the column API, you
            have FULL control of how the columns are displayed. It has everything you need should you wish
            to build your own column management GUI (instead of what's provided in the tool panel).
        </p>

        <pre><code>gridOptions.columnApi.setColumnVisible('country', false);</code></pre>

        <note>
            It is important to NEVER update the details of a column directly (I'm talking about a Column,
            not a colDef). The grid should be left to update the attributes of the column. For example, if
            you want to change a columns width, do NOT change the width on the Column object, use the
            columnApi.setColumnWidth() method instead.
        </note>

        <p>
            Below lists all the methods on the column API. At the bottom of this page there is an example.
            Note that when talking about columns, a Column Group refers to grouping of the columns in
            the header, a Row Group refers to grouping of the data when doing aggregation and grouping
            of rows.
        </p>

        <p>
            Most of the methods below work with Columns, not colDef's. A Column is a grid internal
            representation for a column. When you pass a list of colDefs to the grid (via gridOptions.colDefs)
            the grid wraps each of these colDefs in a Column object. It is the Column object that
            contains the run-time information about the column. For example, if the column width changes,
            the actual column width is updated in the Column object, the colDef never has it's details changed.
            The fact that the colDef is never changed allows you to use the same colDef across many grids
            (probably only useful to a select few of you).
        </p>

        <p>
            The grid API exposes functions that go beyond events and properties that
            you application can call. The grid needs to be initialised before the API
            can be accessed.
        </p>

        <?php if (isFrameworkJavaScript()) { ?>
            <div>
                <h4>
                    <img  src="/images/javascript.png" height="20"/>
                    Javascript
                </h4>
                <p>
                    Use columnApi placed inside gridOptions by the grid during initialisation.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkAngular1()) { ?>
            <div>
                <h4>
                    <img src="/images/angularjs.png" height="20px"/>
                    AngularJS 1.x
                </h4>
                <p>
                    Use columnApi placed inside gridOptions by the grid during initialisation.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkReact()) { ?>
            <div>
                <h4>
                    <img src="/images/react.png" height="20px"/>
                    React
                </h4>
                <p>
                    Use the column API passed to you via the onGridReady callback of the React component. You can also
                    use the columnApi placed inside gridOptions by the grid during initialisation.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkAngular2()) { ?>
            <div>
                <h4>
                    <img src="/images/angular2.png" height="20px"/>
                    Angular 2
                </h4>
                <p>
                    Use columnApi placed inside gridOptions by the grid during initialisation. You can also
                    use columnApi directly on the Angular grid component.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkVue()) { ?>
            <div>
                <h4>
                    <img src="/images/vue_large.png" height="20px"/>
                    VueJS
                </h4>
                <p>
                    Use columnApi placed inside gridOptions by the grid during initialisation. You can also
                    use columnApi directly on the VueJS grid component.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkAurelia()) { ?>
            <div>
                <h4>
                    <img src="/images/aurelia.png" height="20px"/>
                    Aurelia Components
                </h4>
                <p>
                    Use columnApi placed inside gridOptions by the grid during initialisation. You can also
                    use columnApi directly on the DOM element.
                </p>
            </div>
        <?php } ?>

        <?php if (isFrameworkWebComponents()) { ?>
            <div>
                <h4>
                    <img src="../images/webComponents.png" height="20px"/>
                    Web Components
                </h4>
                <p>
                    Use columnApi placed inside gridOptions by the grid during initialisation. You can also
                    use columnApi directly on the DOM element.
                </p>
            </div>
        <?php } ?>

        <h2 id="column-keys">Column Keys</h2>

        <p>
            Some of the API methods take Column Key (named colKey). This means you can pass either a column object (that
            you receive from calling one of the other methods) or you pass in the Column ID. The Column ID is either the
            id you provide in the column definition, the field of the columns, or a generated ID if both are missing.
            The grid also ensures column ID's are unique.
        </p>

        <h2 id="list-of-column-api-functions">List of Column API Functions</h2>

        <table class="table">
            <tr>
                <th>Function</th>
                <th>Description</th>
            </tr>
            <tr>
                <th>sizeColumnsToFit(width)</th>
                <td>Don't use this! You are better off using gridApi.sizeColumnsToFit(), which first
                    works out the available width, and then calls this method. Only use this method if you
                    want to size to something other than the available width.
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
                <th>setColumnState(columnState)</th>
                <td>Sets the state of the columns. See example below. Returns false if one or more columns
                    could not be found.
                </td>
            </tr>
            <tr>
                <th>resetColumnState()</th>
                <td>Sets the state back to match the originally provided column definitions.</td>
            </tr>
            <tr>
                <th>getColumnState()</th>
                <td>Gets the state of the columns. See example below.</td>
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
                <td>Auto-sizes a column based on it's contents.</td>
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

        <h2 id="deep-dive-save-restore-full-state">Deep Dive - Save / Restore Full State</h2>

        <p>
            It is also possible to store the entire state of the columns and restore them again via
            the API. This includes visibility, width, row groups and values.
        </p>

        <ul>
            <li><b>columnApi.getColumnState()</b>: Returns the state of a particular column.</li>
            <li><b>columnApi.setColumnState(state)</b>: To set the state of a particular column.</li>
        </ul>

        <p>
            The methods above get and set the state. The result is a Javascript array object that
            can be converted to / from JSON. An example of what the JSON might look like is as follows:
        </p>

        <pre>[
{colId: "athlete", aggFunc: "sum",  hide: false, rowGroupIndex: 0,    width: 150, pinned: null},
{colId: "age",     aggFunc: null,   hide: true,  rowGroupIndex: null, width: 90,  pinned: 'left'}
]
</pre>

        <p>
            It is intended that the values in the json mimic the values in the column definitions.
            So if you want to re-apply the state to a set of column definitions as the default
            values, override the values of the same name in the corresponding column definition.
        </p>

        <p>
            The values have the following meaning:
        <ul>
            <li><b>colId</b>: The ID of the column. See
                <a href="../javascript-grid-column-definitions/">column definitions</a> for explanation
                of column ID
            </li>
            <li><b>aggFunc</b>: If this column is a value column, this field specifies the aggregation function.
                If the column is not a value column, this field is null.
            </li>
            <li><b>hide</b>: True if the column is hidden, otherwise false.</li>
            <li><b>rowGroupIndex</b>: The index of the row group. If the column is not grouped, this field is null.
                If multiple columns are used to group, this index provides the order of the grouping.
            </li>
            <li><b>width</b>: The width of the column. If the column was resized, this reflects the new value.</li>
            <li><b>pinned</b>: The pinned state of the column. Can be either 'left' or 'right'</li>
        </ul>
        </p>

        <p>
            The example below shows hiding / showing columns as well as saving / restoring the entire state.
            The example also registers for column events, the result of which are printed to the console.
        </p>

        <show-example example="columnStateExample"></show-example>

        <h2 id="saving-restoring-state-sort-and-filter">Saving / Restoring State, Sort and Filter</h2>

        <p>
            The above example shows how to store the state of the columns. This does not include filters or sorts.
            To also store the filter and sort with the state, you will need to use all the following methods:
        <pre><span class="codeComment">// get / set state</span>
gridOptions.columnApi.getColumnState();
gridOptions.columnApi.setColumnState(json);

<span class="codeComment">// get / set sort</span>
gridOptions.api.getSortModel();
gridOptions.api.setSortModel(json);

<span class="codeComment">// get / set filter</span>
gridOptions.api.getFilterModel();
gridOptions.api.setFilterModel(json);</pre>
        </p>
    </div>

<?php include '../documentation-main/documentation_footer.php'; ?>