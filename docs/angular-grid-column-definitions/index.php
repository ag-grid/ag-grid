<?php
$key = "Column Definitions";
$pageTitle = "Column Definitions";
$pageDescription = "Angular Grid Column Definitions";
$pageKeyboards = "Angular Grid Column Definitions";
include '../documentation_header.php';
?>

<div>

    <h2>Column Definitions</h2>

    Each column in the grid is defined using a column definition. Below is the set off all the
    properties you can set for a column definition.

    <p/>

    <table class="table">
        <tr>
            <th>Attribute</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>headerName</th>
            <td>The name to render in the column header</td>
        </tr>
        <tr>
            <th>field</th>
            <td>The field of the row to get the cells data from</td>
        </tr>
        <tr>
            <th>headerValueGetter(params)</th>
            <td>Expression or function to get the cells value.</td>
        </tr>
        <tr>
            <th>colId</th>
            <td>The unique ID to give the column. This is optional. If missing, the ID will default to the field.
            If both field and colId are missing, a unique ID will be generated. This ID is used to identify
            the column in the API for sorting, filtering etc.</td>
        </tr>
        <tr>
            <th>hide</th>
            <td>Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field
            'visible' and mark it false to hide, however we want all default values to be false and we want columns to be
            visible by default.</td>
        </tr>
        <tr>
            <th>headerTooltip</th>
            <td>Tooltip for the column header</td>
        </tr>
        <tr>
            <th>headerClass</th>
            <td>Class to use for the cell. Can be string, array of strings, or function.</td>
        </tr>
        <tr>
            <th>valueGetter(params)</th>
            <td>Expression or function to get the cells value.</td>
        </tr>
        <tr>
            <th>width</th>
            <td>Initial width, in pixels, of the cell</td>
        </tr>
        <tr>
            <th>minWidth</th>
            <td>The minimum width of the column while resizing.</td>
        </tr>
        <tr>
            <th>maxWidth</th>
            <td>The maximum width of the column while resizing.</td>
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
            <th>cellRenderer(params)</th>
            <td>A function for rendering a cell.</td>
        </tr>
        <tr>
            <th>floatingCellRenderer(params)</th>
            <td>A function for rendering floating cells. If both cellRenderer and floatingCellRenderer are
            provided, frozen cells will use floatingCellRenderer if available, if not then cellRenderer.</td>
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
            <th>aggFunc</th>
            <td>Name of function to use for aggregation. One of [sum,min,max].</td>
        </tr>
        <tr>
            <th>comparator(valueA, valueB, nodeA, nodeB, isInverted)</th>
            <td>Comparator function for custom sorting.</td>
        </tr>
        <tr>
            <th>checkboxSelection</th>
            <td>Set to true to render a selection checkbox in the column.</td>
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
            <th>unSortIcon</th>
            <td>Set to true if you want the unsorted icon to be shown when no sort is applied to this column.</td>
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
            <th>suppressSizeToFit</th>
            <td>Set to true if you want this columns width to be fixed during 'size to fit' operation.</td>
        </tr>
        <tr>
            <th>suppressResize</th>
            <td>Set to true if you do not want this column to be resizable by dragging it's edge.</td>
        </tr>
        <tr>
            <th>headerGroup</th>
            <td>If grouping columns, the group this column belongs to.</td>
        </tr>
        <tr>
            <th>headerGroupShow</th>
            <td>Whether to show the column when the group is open / closed.</td>
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
            <th>template<br/>templateUrl</th>
            <td>Cell template (or specify URL to load template from) to use for cell.
                Useful for AngularJS cells.</td>
        </tr>
    </table>

<?php include '../documentation_footer.php';?>
