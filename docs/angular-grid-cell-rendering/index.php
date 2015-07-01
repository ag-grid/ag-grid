<?php
$key = "Cell Rendering";
$pageTitle = "Angular Grid Cell Rendering";
$pageDescription = "You can customise every cell in Angular Grid. This is done by providing cell renderers. This page describe creating cell renderers.";
$pageKeyboards = "Angular Grid Cell Renderers";
include '../documentation_header.php';
?>

<div>

    <h2>Cell Rendering</h2>

    <p>
        Cell Rendering - this is a very powerful feature in Angular Grid. With this, you can put whatever
        you want in the grid. The job of the grid is to lay out the cells. What goes into the cells,
        that's where you come in!
    </p>

    <p>
        A cell renderer is a function that when called, returns HTML (either a Dom or Node element, or an HTML string).
    </p>

    <p>
        You can use a cell renderer for the following reasons:
        <ul>
            <li>The data needs to be formatted before displaying.</li>
            <li>The cell should be rendered using more complex HTML thanks just a string.</li>
        </ul>
    </p>

    <p>
        Below are some simple examples of cell rendering:
    </p>

<pre><code><b>// example - make the value upper case</b>
var colDef = {
    name: 'Col Name',
    field' 'Col Field',
    cellRenderer: function(params) {
        if (params.value=='Police') {
            return '<b>POLICE</b>';
        } else {
            return params.value.toUpperCase();
        }
    }
}

<b>// example - grab the field from a complex object (although possible, you should do this in a valueGetter)</b>
var colDef = {
    name: 'Col Name',
    cellRenderer: function(params) {
        return params.data.field.deepObject.someName.value;
    }
}

<b>// example - join two fields together (but you would probably do this with a value getter)</b>
var colDef = {
    name: 'Col Name',
    cellRenderer: function(params) {
        return params.data.firstName + ' ' + params.data.lastName;
    }
}

<b>// complex html, no Angular JS</b>
var colDef = {
    name: 'Col Name',
    cellRenderer: function(params) {
        return '&lt;span title="the tooltip">'+params.data.value+'&lt;/span>';
    }
}

<b>// complex html, with Angular JS - need to have angularCompileRows=true in gridOptions</b>
var colDef = {
    name: 'Col Name',
    cellRenderer: function(params) {
        return '&lt;span title="the tooltip"><code ng-non-bindable>{{value}}</code>&lt;/span>';
    }
}</code></pre>

    <h4>Cell Renderer Params</h4>

    Cell renderer functions take a params object with the following values:<br/>

    value: The value to be rendered.<br/>
    data: The row (from the rowData array, where value was taken) been rendered.<br/>
    colDef: The colDef been rendered.<br/>
    $scope: If compiling to Angular, is the row's child scope, otherwise null.<br/>
    rowIndex: The index of the row renderer, after sorting and filtering.<br/>
    api: A reference to the Angular Grid api.<br/>
    context: The context as set on the gridOptions.<br/>
    refreshCell: A callback function, to tell the grid to refresh this cell and reapply all css styles and classes.<br/>

    <h4>Angular Compiling</h4>

    When using Angular Compiling, a new scope is created for each row. The data for the
    row is attached to the scope as 'data'.

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
