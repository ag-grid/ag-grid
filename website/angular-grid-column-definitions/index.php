<?php
$pageTitle = "Angular Compiling";
$pageDescription = "Angular Grid Angular Compiling";
$pageKeyboards = "Angular Grid Angular Compiling";
include '../documentation_header.php';
?>

<div>

    <h2>Column Definitions</h2>

    Each column in the grid is defined using a column definition. A list of column
    definitions is passed into the grid for rendering.

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
            <td>Function callback, gets called when a cell is clicked..</td>
        </tr>
        <tr>
            <th></th>
            <td></td>
        </tr>
    </table>

    <h4>cellClass</h4>

    Provides a class for the cells in this column. Can be a string (a class), array of strings
    (array of classes), or a function (that returns a string or an array of strings).

    <pre><code>// return same class for each row
var colDef1 = {
    name: 'Static Class',
    field' 'field1',
    cellClass: 'my-class'
}
// return same array of classes for each row
var colDef2 = {
    name: 'Static Array of Classes',
    field' 'field2',
    cellClass: ['my-class1','my-class2']
}
// return class based on function
var colDef3 = {
    name: 'Function Returns String',
    field' 'field3',
    cellClass: function(value, data, colDef) { return (value==='something'?'my-class-1':'my-class-2'); }
}
// return array of classes based on function
var colDef4 = {
    name: 'Function Returns Array',
    field' 'field4',
    cellClass: function(value, data, colDef) { return ['my-class-1','my-class-2']; }
}
    </code></pre>

    <h4>cellStyle</h4>
    Used to provide CSS styles directly (not using a class) to the cell. Can be either an object
    of CSS styles, or a function returning an object of CSS styles.

    <pre><code>// return same style for each row
var colDef = {
    name: 'Static Styles',
    field' 'field1',
    cellStyle: {color: red, background-color: green}
}
// return different styles for each row
var colDef = {
    name: 'Dynamic Styles',
    field' 'field2',
    cellStyle: function(value, data, colDef, $childScope) {
        if (value=='Police') {
            //mark police cells as red
            return {color: red, background-color: green};
        } else {
            return null;
        }
    }
}
    </code></pre>

    Both cellClass and cellStyle functions have the following attributes:<br/>

    value: The value to be rendered.<br/>
    data: The row (from the rowData array, where value was taken) been rendered.<br/>
    colDef: The colDef been rendered.<br/>
    $childScope: If compiling to Angular, is the row's child scope, otherwise null.<br/>

    <h4>cellRenderer</h4>
    A function that when called, returns HTML (either a Dom or Node element, or an HTML string)

<pre><code>var colDef = {
    name: 'Col Name',
    field' 'Col Field',
    cellRenderer: function(value, data, colDef, $childScope) {
                    if (value=='Police') {
                        return '<b>POLICE</b>';
                    } else {
                        return value.toUpperCase();
                    }
                }
}</code></pre>

    value: The value to be rendered.<br/>
    data: The row (from the rowData array, where value was taken) been rendered.<br/>
    colDef: The colDef been rendered.<br/>
    $childScope: If compiling to Angular, is the row's child scope, otherwise null.<br/>

    <h4>Example: Formatting Cells</h4>

    The below example shows three columns formatted, demonstrating each of the three
    methods above.
    <p/>
    'Athlete' column uses cellStyle to format each cell in the column with the same style.
    <p/>
    'Age' column uses cellStyle to format each cell with the capital letter 'C'.
    <p/>
    'Gold' column renders the cell from scratch, by adding a gold star image for each
    gold medal won.

    <show-example example="example1"></show-example>

</div>

<?php include '../documentation_footer.php';?>
