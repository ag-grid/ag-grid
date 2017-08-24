<?php
$key = "Cell Styling";
$pageTitle = "ag-Grid Cell Styling";
$pageDescription = "You can change the CSS style in ag-Grid. This is done by providing style and class callbacks in the column definition.";
$pageKeyboards = "ag-Grid Cell Styling CSS";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="cell-styling">Cell Styling</h2>

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

    <h3 id="column-definition-cellstyle">Column Definition cellStyle</h3>

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


    <h3 id="cellClass">Column Definition cellClass</h3>

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

    <h3 id="cell-style-cell-class-params">Cell Style & Cell Class Params</h3>

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

    <h3 id="cellClassRules">Column Definition cellClassRules</h3>

    <p>
        ag-Grid allows rules to be applied to include certain CSS classes The Rules are provided
        as a JavaScript map. The keys are class names and the values are expressions
        that if evaluated to true, the class gets used. The expression can either be a JavaScript function,
        or a string which is treated as a shorthand for a function by the grid.
    </p>

    <p>
        The following snippet is cellClassRules using functions on a year column:
    </p>

        <pre>cellClassRules: {
    <span class="codeComment">// apply green to 2008</span>
    'rag-green-outer': function(params) { return params.value === 2008},
    <span class="codeComment">// apply amber 2004</span>
    'rag-amber-outer': function(params) { return params.value === 2004},
    <span class="codeComment">// apply red to 2000</span>
    'rag-red-outer': function(params) { return params.value === 2000}
}</pre>

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

    <p>
        The following snippet is cellClassRules using expressions on an age column:
    </p>

    <pre>cellClassRules: {
    'rag-green': 'x < 20',
    'rag-amber': 'x >= 20 && x < 25',
    'rag-red': 'x >= 25'
}</pre>

    <h4>Refresh of Styles</h4>

    <p>
        If you refresh a cell, or a cell is updated due to editing, the cellStyle,
        cellClass and cellClassRules are all applied again. This has the following
        effect:
        <ul>
            <li><b>cellStyle</b>: All new styles are applied. If a new style is the
            same as an old style, the new style overwrites the old style.</li>
            <li><b>cellClass</b>: All new classes are applied. Old classes are not
            removed so be aware that classes will accumulate. If you want to remove
            old classes, then use cellClassRules.</li>
            <li><b>cellClassRules</b>: Rules that return true will have the class
            applied the second time. Rules tha return false will have the class removed
            second time.</li>
        </ul>
    </p>

    <h2>Example Cell Styling</h2>

    <p>Below shows both cssClassRules snippets above in a full working example. The exmaple
    demonstrates the following:
        <ul>
            <li>Age uses <code>cellClassRules</code> with expressions (strings instead of functions).
            Editing the cell will update the style.</li>
            <li>Year uses <code>cellClassRules</code> with functions. Editing the cell will update the style.</li>
            <li>Date and Sport use <code>cellClass</code>, Date sets explicitly, Sport sets
            using a function. Because a function is used for Sport, it can select class based
            on data value. Editing Sport will have undetermined results as the class values will accumulate.</li>
            <li>Gold sets <code>cellStyle</code> implicitly. It is not dependent on the cell value.</li>
            <li>Silver and Bronze set <code>cellStyle</code> using a function and depends on the value.
            Editing will update the cellStyle.</li>
        </ul>
    </p>

    <show-example example="exampleCellStyling"></show-example>

    <h1 id="rowStyling">Row Styling</h1>

    <p>
        You can add CSS styles and classes to each row. This is done with with the following:

        <ul>
        <li><b>rowStyle</b>: Property to set style for all rows. Set to an object of key (style names) and values (style values).</li>
        <li><b>getRowStyle</b>: Callback to set style for each row individually.</li>
        <li><b>rowClass</b>: Property to set CSS class for all rows. Provide either a string (class name) or array of string (array
            of class names).</li>
        <li><b>getRowClass</b>: Callback to set class for each row individually.</li>
    </ul>
    </p>

    <pre>
<span class="codeComment">// set background color on every row</span>
<span class="codeComment">// this is probably bad, should be using CSS classes</span>
gridOptions.rowStyle = {background: 'black'};

<span class="codeComment">// set background color on odd rows</span>
<span class="codeComment">// again, this looks bad, should be using CSS classes</span>
gridOptions.getRowStyle = function(params) {
    if (params.node.rowIndex % 2 === 0) {
    return { background: 'red' }
    }
}

<span class="codeComment">// all rows assigned CSS class 'my-green-class'</span>
gridOptions.rowClass = 'my-green-class';

<span class="codeComment">// all odd rows assigned 'my-shaded-effect'</span>
gridOptions.getRowClass = function(params) {
    if (params.node.rowIndex % 2 === 0) {
        return 'my-shaded-effect';
    }
}
</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
