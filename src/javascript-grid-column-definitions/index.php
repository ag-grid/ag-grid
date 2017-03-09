<?php
$key = "columnDefs";
$pageTitle = "Column Definitions";
$pageDescription = "ag-Grid Column Definitions";
$pageKeyboards = "ag-Grid Column Definitions";
$pageGroup = "interfacing";
include '../documentation-main/documentation_header.php';
?>

    <h2 id="columns">Columns</h2>

    <p>
        Each column in the grid is defined using a column definition. Below is the set off all the
        properties you can set for column definitions. The section
        <a href="../javascript-grid-grouping-headers/">column groups</a>
        details how to group columns in the headers.
    </p>

    <p>
        Every property below is optional with the exception of <i>children</i>. For column groups, <i>children</i>
        is mandatory and that's also how the grid is able to distinguish a column from a column group
        (if <i>children</i> is present, it knows it's a group).
    </p>

    <h2 id="defaultProperties">Default Column Definition</h2>

    <p>
        As well as defining columns, you can define default properties for the columns, so you don't
        have to repeat the item everywhere. Use grid property <i>defaultColDef</i> for properties common
        to all columns and <i>defaultColGroupDef</i> for properties common to column groups.
        For example the following provides defaults for columns and groups.
    </p>

    <pre>var gridOptions = {
    rowData: myRowData,

    <span class="codeComment">// define 3 columns for this grid</span>
    columnDefs: {
        {headerName: 'Col A', field: 'a'}
        {headerName: 'Col B', field: 'b'}
        <span class="codeComment">// this column overrides the stated default, and  uses the number filter</span>
        {headerName: 'Col C', field: 'c', filter: 'number'}
    },

    <span class="codeComment">// the default col def, gets applied to every col</span>
    defaultColDef: {
        <span class="codeComment">// make every column editable</span>
        editable: true,
        <span class="codeComment">// make every column use 'text' filter by default</span>
        filter: 'text'
    },

    <span class="codeComment">// if we had column groups, we could provide default group items here</span>
    defaultColGroupDef: {}
}</pre>

    <h2 id="properties-for-column-groups-columns">Properties for Column Groups & Columns</h2>

    <table class="table">
        <tr>
            <th>headerName</th>
            <td>The name to render in the column header</td>
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
    </table>

    <h2 id="properties-for-columns">Properties for Columns</h2>

    <table class="table">
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
            <td>Custom params to be passed to floatingFilterComponent/floatingFilterComponentFramework </td>
        </tr>
        <tr>
            <th>hide</th>
            <td>Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field
                'visible' and mark it false to hide, however we want all default values to be false and we want columns to be
                visible by default.</td>
        </tr>
        <tr>
            <th>pinned</th>
            <td>Set to 'left' or 'right' to pin.</td>
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
            <th>checkboxSelection</th>
            <td>Boolean or Function. Set to true (or return true from function) to render a selection checkbox in the column.</td>
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
            <th>newValueHandler(params)<br/>onCellValueChanged(params)</th>
            <td>Callbacks for editing. See editing section for further details.</td>
        </tr>
        <tr>
            <th>volatile</th>
            <td>If true, this cell gets refreshed when api.softRefreshView() gets called.</td>
        </tr>
        <tr>
            <th>cellRenderer<br/>cellRendererFramework</th>
            <td>cellRenderer to use for this column.</td>
        </tr>
        <tr>
            <th>floatingCellRenderer<br/>floatingCellRendererFramework</th>
            <td>cellRenderer to use for floating rows in this column. Floating cells will use floatingCellRenderer if available,
                if not then cellRenderer.</td>
        </tr>
        <tr>
            <th>cellEditor<br/>cellEditorFramework</th>
            <td>cellEditor to use for this column.</td>
        </tr>
        <tr>
            <th>cellFormatter</th>
            <td>A function for formatting a cell.</td>
        </tr>
        <tr>
            <th>floatingCellFormatter</th>
            <td>A function for formatting a floating cell. Floating cells will use floatingCellRenderer if available,
                if not then cellFormatter.</td>
        </tr>
        <tr>
            <th>valueGetter(params)</th>
            <td>Expression or function to get the cells value.</td>
        </tr>
        <tr>
            <th>headerValueGetter(params)</th>
            <td>Expression or function to get the cells value.</td>
        </tr>
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
            <th>enableValue</th>
            <td>(ag-Grid-Enterprise only) Set to true if you want to be able to aggregate by this column via the GUI.
                This will not block if the API or properties are used to achieve aggregation.</td>
        </tr>
        <tr>
            <th>enableCellChangeFlash</th>
            <td>Set to true to get grid to flash the cell when it's refreshed.</td>
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
            <td>Set to true if you do not want this column to be resizable by dragging it's edge.</td>
        </tr>
        <tr>
            <th>suppressNavigable</th>
            <td>Set to true if this col is not navigable (ie cannot be tabbed into), otherwise false.
                Can also be a function to have different rows navigable.</td>
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
    </table>

    <h2 id="properties-for-column-groups">Properties for Column Groups</h2>

    <table class="table">
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
    </table>

<?php include '../documentation-main/documentation_footer.php';?>
