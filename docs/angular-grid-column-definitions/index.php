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
            <th>displayName</th>
            <td>The name to render in the column header</td>
        </tr>
        <tr>
            <th>headerTooltip</th>
            <td>Tooltip for the column header</td>
        </tr>
        <tr>
            <th>field</th>
            <td>The field of the row to get the cells data from</td>
        </tr>
        <tr>
            <th>width</th>
            <td>Initial width, in pixels, of the cell</td>
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
            <th>cellRenderer</th>
            <td>A function for rendering a cell.</td>
        </tr>
        <tr>
            <th>cellClicked</th>
            <td>Function callback, gets called when a cell is clicked.</td>
        </tr>
        <tr>
            <th>cellDoubleClicked</th>
            <td>Function callback, gets called when a cell is double clicked.</td>
        </tr>
        <tr>
            <th>comparator</th>
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
            <th>suppressSizeToFit</th>
            <td>Set to true if you want this columns width to be fixed during 'size to fit' operation.</td>
        </tr>
        <tr>
            <th>group</th>
            <td>If grouping columns, the group this column belongs to.</td>
        </tr>
        <tr>
            <th>editable</th>
            <td>Set to true if this col is editable, otherwise false. Can also be a function
                to have different rows editable.</td>
        </tr>
        <tr>
            <th>newValueHandler, cellValueChanged</th>
            <td>Callbacks for editing. See editing section for further details.</td>
        </tr>
        <tr>
            <th>volatile</th>
            <td>If true, this cell gets refreshed when api.softRefreshView() gets called.</td>
        </tr>
        <tr>
            <th>cellTemplate, cellTemplateUrl</th>
            <td>Cell template (or specify URL to load template from) to use for cell.
                Useful for AngularJS cells.</td>
        </tr>
    </table>

<?php include '../documentation_footer.php';?>
