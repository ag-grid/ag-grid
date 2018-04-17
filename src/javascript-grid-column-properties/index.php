<?php
$pageTitle = "ag-Grid Reference: Column Properties";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. The columns of the datagrid are controlled by properties, this page outlines each of the Column Properties available.";
$pageKeyboards = "ag-Grid Column Properties";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>
    <h1 id="columns" class="first-h1">Column Properties</h1>

    <p class="lead">
        For column groups, the property <code>children</code> is mandatory. When the grid sees <code>children</code>
        it knows it's a column group.
    </p>

    <table class="table reference">
        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2"><h2>Columns and Column Groups</h2></td>
        </tr>
        <tr>
            <th>headerName</th>
            <td>The name to render in the column header. If not specified and field is specified, the field name would
            be used as the header name.</td>
        </tr>
        <tr>
            <th>columnGroupShow</th>
            <td>Whether to show the column when the group is open / closed.</td>
        </tr>
        <tr>
            <th>headerClass</th>
            <td>Class to use for the header cell. Can be string, array of strings, or function.</td>
        </tr>
        <tr>
            <th>toolPanelClass</th>
            <td>Class to use for the tool panel cell. Can be string, array of strings, or function.</td>
        </tr>
        <tr>
            <th>suppressToolPanel</th>
            <td>Set to true if you do not want this column or group to appear in the tool panel.</td>
        </tr>
        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2"><h2>Columns Only</h2></td>
        </tr>
        <tr>
            <th>field</th>
            <td>The field of the row to get the cells data from</td>
        </tr>
        <tr>
            <th>colId</th>
            <td>The unique ID to give the column. This is optional. If missing, the ID will default to the field.
                If both field and colId are missing, a unique ID will be generated. This ID is used to identify
                the column in the API for sorting, filtering etc.</td>
        </tr>
        <tr>
            <th>type</th>
            <td>A comma separated string or array of strings containing ColumnType keys which can be used as a template for
                a column. This helps to reduce duplication of properties when you have a lot of common column properties.</td>
        </tr>
        <tr>
            <th>width, minWidth, maxWidth</th>
            <td>Initial width, min width and max width for the cell. Always stated in pixels (never percentage values).</td>
        </tr>
        <tr>
            <th>filter<br/>filterFramework</th>
            <td>Filter component to use for this column.</td>
        </tr>
        <tr>
            <th>floatingFilterComponent<br/>floatingFilterComponentFramework</th>
            <td>Floating filter component to use for this column.</td>
        </tr>
        <tr>
            <th>floatingFilterComponentParams</th>
            <td>Custom params to be passed to <code>floatingFilterComponent</code> or <code>floatingFilterComponentFramework</code> </td>
        </tr>
        <tr>
            <th>hide</th>
            <td>Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field
                'visible' and mark it false to hide, however we want all default values to be false and we want columns to be
                visible by default. <span style="font-style: italic;">Note</span>: this property is called <code>hideCol</code> when used with Aurelia.</td>
        </tr>
        <tr>
            <th>pinned</th>
            <td>Set to 'left' or 'right' to pin.</td>
        </tr>
        <tr>
            <th>lockPosition</th>
            <td>Set to true to always have column displayed first.</td>
        </tr>
        <tr>
            <th>lockVisible</th>
            <td>Set to true block making column visible / hidden via the UI (API will still work).</td>
        </tr>
        <tr>
            <th>lockPinned</th>
            <td>Set to true block pinning column via the UI (API will still work).</td>
        </tr>
        <tr>
            <th>sort</th>
            <td>Set to 'asc' or 'desc' to sort by this column by default.</td>
        </tr>
        <tr>
            <th>sortedAt</th>
            <td>If doing multi sort by default, this column should say when the sort for each column was done
                in milliseconds, so the grid knows which order to execute the sort.</td>
        </tr>

        <tr>
            <th>headerTooltip</th>
            <td>Tooltip for the column header</td>
        </tr>
        <tr>
            <th>tooltipField</th>
            <td>The field of the tooltip to apply to the cell.</td>
        </tr>
        <tr>
            <th>tooltip</th>
            <td>A callback that takes (value, valueFormatted, data, node , colDef, rowIndex and api) It must return the
                string used as a tooltip. <code>tooltipField</code> takes precedence.</td>
        </tr>
        <tr>
            <th>checkboxSelection</th>
            <td>Boolean or Function. Set to true (or return true from function) to render a selection checkbox in the column.</td>
        </tr>
        <tr>
            <th>rowDrag</th>
            <td>Boolean or Function. Set to true (or return true from function) to render a row drag area in the column.</td>
        </tr>
        <tr>
            <th>cellClass</th>
            <td>Class to use for the cell. Can be string, array of strings, or function.</td>
        </tr>
        <tr>
            <th>cellStyle</th>
            <td>An object of css values. Or a function returning an object of css values.</td>
        </tr>
        <tr>
            <th>editable</th>
            <td>Set to true if this col is editable, otherwise false. Can also be a function
                to have different rows editable.</td>
        </tr>
        <tr>
            <th>onCellValueChanged(params)</th>
            <td>Callback for after the value of a cell has changed, due to editing or the application calling api.setValue().</td>
        </tr>
        <tr>
            <th>cellRenderer<br/>cellRendererFramework</th>
            <td>cellRenderer to use for this column.</td>
        </tr>
        <tr>
            <th>floatingCellRenderer<br/>floatingCellRendererFramework</th>
            <td>cellRenderer to use for pinned rows in this column. Floating cells will use floatingCellRenderer if available,
                if not then cellRenderer.</td>
        </tr>
        <tr>
            <th>cellEditor<br/>cellEditorFramework</th>
            <td>cellEditor to use for this column.</td>
        </tr>

        <?php include '../javascript-grid-value-getters/gettersAndFormattersProperties.php' ?>
        <?php printPropertiesRows($gettersAndFormattersProperties) ?>

        <?php include '../javascript-grid-value-setters/settersAndParsersProperties.php' ?>
        <?php printPropertiesRows($settersAndParsersProperties) ?>

        <tr>
            <th>keyCreator(params)</th>
            <td>Function to return the key for a value - use this if the value is an object (not a primitive type) and you
                want to a) use set filter on this field or b) group by this field.</td>
        </tr>
        <tr>
            <th>getQuickFilterText</th>
            <td>A function to tell the grid what quick filter text to use for this column if you don't want
                to use the default (which is calling toString on the value).</td>
        </tr>
        <tr>
            <th>aggFunc</th>
            <td>Name of function to use for aggregation. One of [sum,min,max,first,last]. 
                Or provide your own agg function.</td>
        </tr>
        <tr>
            <th>allowedAggFuncs</th>
            <td>
                Aggregation functions allowed on this column eg ['sum','avg']. If missing, all installed functions are allowed.
                This will restrict what the GUI allows to select only, does not impact when you set columns
                function via the API.
            </td>
        </tr>
        <tr>
            <th>rowGroupIndex</th>
            <td>Set this in columns you want to group by. If only grouping by one column, set this to any number (eg 0).
            If grouping by multiple columns, set this to where you want this column to be in the group (eg 0 for first, 1 for second, and so on).</td>
        </tr>
        <tr>
            <th>pivotIndex</th>
            <td>Set this in columns you want to pivot by. If only pivoting by one column, set this to any number (eg 0).
            If pivoting by multiple columns, set this to where you want this column to be in the order of pivots (eg 0 for first, 1 for second, and so on).</td>
        </tr>
        <tr>
            <th>comparator(valueA, valueB, nodeA, nodeB, isInverted)</th>
            <td>Comparator function for custom sorting.</td>
        </tr>
        <tr>
            <th>pivotComparator(valueA, valueB)</th>
            <td>Comparator to use when ordering the pivot columns, when this column is used to pivot on. The values will
            always be strings, as the pivot service uses strings as keys for the pivot groups.</td>
        </tr>
        <tr>
            <th>unSortIcon</th>
            <td>Set to true if you want the unsorted icon to be shown when no sort is applied to this column.</td>
        </tr>
        <tr>
            <th>enableRowGroup</th>
            <td>(ag-Grid-Enterprise only) Set to true if you want to be able to row group by this column via the GUI.
                This will not block if the API or properties are used to achieve row grouping.</td>
        </tr>
        <tr>
            <th>enablePivot</th>
            <td>(ag-Grid-Enterprise only) Set to true if you want to be able to pivot by this column via the GUI.
                This will not block if the API or properties are used to achieve pivot.</td>
        </tr>
        <tr>
            <th>pivotTotals</th>
            <td>(ag-Grid-Enterprise only) Set to true if you want to introduce pivot total columns when in pivot mode.</td>
        </tr>
        <tr>
            <th>enableValue</th>
            <td>(ag-Grid-Enterprise only) Set to true if you want to be able to aggregate by this column via the GUI.
                This will not block if the API or properties are used to achieve aggregation.</td>
        </tr>
        <tr>
            <th>enableCellChangeFlash</th>
            <td>Set to true to get grid to flash the cell when it's refreshed.</td>
        </tr>
        <tr>
            <th>menuTabs</th>
            <td>Set to an array containing zero, one or many of the following options 'filterMenuTab', 'generalMenuTab'
                and 'columnsMenuTab'. This is used to figure out which menu tabs and in which order the tabs are shown</td>
        </tr>
        <tr>
            <th>suppressMenu</th>
            <td>Set to true if no menu should be shown for this column header.</td>
        </tr>
        <tr>
            <th>suppressSorting</th>
            <td>Set to true if no sorting should be done for this column.</td>
        </tr>
        <tr>
            <th>suppressSizeToFit</th>
            <td>Set to true if you want this columns width to be fixed during 'size to fit' operation.</td>
        </tr>
        <tr>
            <th>suppressMovable</th>
            <td>Set to true if you do not want this column to be movable via dragging.</td>
        </tr>
        <tr>
            <th>suppressFilter</th>
            <td>Set to true to not allow filter on this column.</td>
        </tr>
        <tr>
            <th>suppressResize</th>
            <td>Set to true if you do not want this column to be resizable by dragging its edge.</td>
        </tr>
        <tr>
            <th>suppressNavigable</th>
            <td>Set to true if this col is not navigable (ie cannot be tabbed into), otherwise false.
                Can also be a function to have different rows navigable.</td>
        </tr>
        <tr>
            <th>suppressCellFlash</th>
            <td>
                Set to true then this column will not flash changes. Only applicable if cell flashing is
                turned on for the grid.
            </td>
        </tr>
        <tr>
            <th>suppressKeyboardEvent(params)</th>
            <td>
                Function to allow skipping default keyboard behaviour of the grid. Eg if you don't want the
                grid to move focus up on up arrow key while editing, implement this method to return
                true when params.editing=true and params.event.keyCode=[key code for up arrow key].
            </td>
        </tr>
        <tr>
            <th>onCellClicked(params)</th>
            <td>Function callback, gets called when a cell is clicked.</td>
        </tr>
        <tr>
            <th>onCellDoubleClicked(params)</th>
            <td>Function callback, gets called when a cell is double clicked.</td>
        </tr>
        <tr>
            <th>onCellContextMenu(params)</th>
            <td>Function callback, gets called when a cell is right clicked.</td>
        </tr>
        <tr>
            <th>autoHeight</th>
            <td>Set to true to have the grid calculate height of row based on contents of this column.</td>
        </tr>


        <tr class="title-row">
            <!-- TITLE ROW -->
            <td colspan="2"><h2>Column Groups Only</h2></td>
        </tr>
        <tr>
            <th>groupId</th>
            <td>The unique ID to give the column. This is optional. If missing, a unique ID will be generated.
                This ID is used to identify the column group in the column API.</td>
        </tr>
        <tr>
            <th>children</th>
            <td>A list containing a mix of columns and column groups.</td>
        </tr>
        <tr>
            <th>marryChildren</th>
            <td>Set to 'true' to keep columns in this group beside each other in the grid. Moving the columns outside
                of the group (and hence breaking the group) is not allowed.</td>
        </tr>
        <tr>
            <th>openByDefault</th>
            <td>Set to 'true' if this group should be opened by default.</td>
        </tr>
        <tr>
            <th>headerGroupTooltip</th>
            <td>Tooltip for the column group header</td>
        </tr>
    </table>

<?php include '../documentation-main/documentation_footer.php';?>
