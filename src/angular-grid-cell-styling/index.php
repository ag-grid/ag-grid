<?php
$key = "Cell Styling";
$pageTitle = "Angular Grid Cell Styling";
$pageDescription = "You can change the CSS style in Angular Grid. This is done by providing style and class callbacks in the column definition.";
$pageKeyboards = "Angular Grid Cell Styling CSS";
include '../documentation_header.php';
?>

<div>

    <h2>Cell Styling</h2>

    <p>
        Cell customisation is done a the column level via the column definition. You can mix and match any
        of the following mechanisms:
        <ul>
            <li><b>Cell Class:</b> Providing a CSS class for the cells.</li>
            <li><b>Cell Class Rules:</b> Providing rules for applying CSS classes.</li>
            <li><b>Cell Style:</b> Providing a CSS style for the cells.</li>
            <li><b>Cell Renderer:</b> Take complete control and provide how the cell should look.</li>
        </ul>
    </p>

    <p>
        This section discusses the first three, setting style via cellClass, cellClasRules and cellStyle attributes of
        the column definition.
    </p>

    <h3>Column Definition cellStyle</h3>

    <p>
        Used to provide CSS styles directly (not using a class) to the cell. Can be either an object
        of CSS styles, or a function returning an object of CSS styles.
    </p>


    <pre><code>// return same style for each row
var colDef = {
    name: 'Static Styles',
    field' 'field1',
    cellStyle: {color: 'red', 'background-color': 'green'}
}
// return different styles for each row
var colDef = {
    name: 'Dynamic Styles',
    field' 'field2',
    cellStyle: function(params) {
        if (params.value=='Police') {
            //mark police cells as red
            return {color: 'red', backgroundColor: 'green'};
        } else {
            return null;
        }
    }
}
    </code></pre>


    <h3>Column Definition cellClass</h3>

    <p>
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
    cellClass: function(params) { return (params.value==='something'?'my-class-1':'my-class-2'); }
}

// return array of classes based on function
var colDef4 = {
    name: 'Function Returns Array',
    field' 'field4',
    cellClass: function(params) { return ['my-class-1','my-class-2']; }
}
        </code></pre>

    </p>

    <h3>Cell Style & Cell Class Params</h3>

    <p>
        Both cellClass and cellStyle functions take a params object with the following values:
    </p>

    <p>
        value: The value to be rendered.<br/>
        data: The row (from the rowData array, where value was taken) been rendered.<br/>
        colDef: The colDef been rendered.<br/>
        context: The context as set on the gridOptions.<br/>
        api: A reference to the ag-Grid API.<br/>
        $scope: If compiling to Angular, is the row's child scope, otherwise null.<br/>
    </p>

    <h3>Column Definition cellClassRules</h3>

    <p>
        ag-Grid allows rules to be applied to include certain classes. If you use AngularJS, then
        this is similar to ng-class, where you specify classes as Javascript object keys, and rules
        as object values.
    </p>

    <p>
        Rules are provided as a Javascript class. The keys are class names and the values are expressions
        that if evaluated to true, the class gets used. The expression can either be a Javascript function,
        or a string which is treated as a shorthand for a function by the grid.
    </p>

    <p>
        This is best explained using the example below. The Year column has the following cellClassRules:
    </p>

        <pre>cellClassRules: {
    'rag-green-outer': function(params) { return params.value === 2008},
    'rag-amber-outer': function(params) { return params.value === 2004},
    'rag-red-outer': function(params) { return params.value === 2000}
},</pre>

    <p>
        When a function is provided the params object has the attributes: <i>value, data, node,
        colDef, rowIndex, api</i> and <i>context</i>.
    </p>

    <p>
        As an alternative, you can also provide shorthands of the functions using an expression.
        The column Age in the example uses expressions. An expression is evaluated by the grid
        by executing the string as if it were a Javascript expression. The expression
        has the following attributes available to it (mapping the the attributes of the equivalent
        params object):

        <ul>
            <li><b>x</b>: maps value</li>
            <li><b>ctx</b>: maps context</li>
            <li><b>node</b>: maps node</li>
            <li><b>data</b>: maps data</li>
            <li><b>colDef</b>: maps colDef</li>
            <li><b>rowIndex</b>: maps rowIndex</li>
            <li><b>api</b>: maps api</li>
        </ul>

        In other words, x and ctx map value and context, all other attributes map the parameters of the same name.

    </p>

    <pre>cellClassRules: {
    'rag-green': 'x < 20',
    'rag-amber': 'x >= 20 && x < 25',
    'rag-red': 'x >= 25'
}</pre>

    <show-example example="example1"></show-example>


</div>

<?php include '../documentation_footer.php';?>
