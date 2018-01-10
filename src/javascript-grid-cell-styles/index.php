<?php
$pageTitle = "ag-Grid Cell Styles";
$pageDescription = "You can change the CSS cell styles in ag-Grid. This is done by providing style and class callbacks in the column definition.";
$pageKeyboards = "ag-Grid Cell Styles";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h2 id="cell-styling">Cell Styles</h2>

    <p>
        Cell customisation is done a the column level via the column definition. You can mix and match any
        of the following mechanisms:
        <ul>
            <li><b>Cell Style:</b> Providing a CSS style for the cells.</li>
            <li><b>Cell Class:</b> Providing a CSS class for the cells.</li>
            <li><b>Cell Class Rules:</b> Providing rules for applying CSS classes.</li>
        </ul>
    </p>

    <p>
        Each of these approaches are presented in the following sections.
    </p>

    <h3 id="column-definition-cellstyle">Cell Style</h3>

    <p>
        Used to provide CSS styles directly (not using a class) to the cell. Can be either an object
        of CSS styles, or a function returning an object of CSS styles.
    </p>


    <snippet>
// return same style for each row
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
}</snippet>


    <h3 id="cellClass">Cell Class</h3>

    <p>
        Provides a class for the cells in this column. Can be a string (a class), array of strings
        (array of classes), or a function (that returns a string or an array of strings).

    <snippet>
// return same class for each row
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
}</snippet>

    </p>

    <h3 id="cellClassRules">Cell Class Rules</h3>

    <p>
        You can define rules which can be applied to include certain CSS classes via via <code>colDef.cellClassRules</code>.
        These rules are provided as a JavaScript map where the keys are the class names and the values are expressions
        that if evaluated to true, the class gets used. The expression can either be a JavaScript function,
        or a string which is treated as a shorthand for a function by the grid.
    </p>

    <p>
        The following snippet is cellClassRules using functions on a year column:
    </p>

        <snippet>
cellClassRules: {
    // apply green to 2008
    'rag-green-outer': function(params) { return params.value === 2008},
    // apply amber 2004
    'rag-amber-outer': function(params) { return params.value === 2004},
    // apply red to 2000
    'rag-red-outer': function(params) { return params.value === 2000}
}</snippet>
    <h3 id="cell-style-cell-class-params">Cell Style, Cell Class & Cell Class Rules Params</h3>

    <p>
        All cellClass cellStyle and cellClassRules functions take a params object that implements the following interface:
    </p>

    <snippet>
export interface CellClassParams {
    // The value to be rendered.
    value: any,
    // The row (from the rowData array, where value was taken) been rendered.
    data: any,
    // The node associated to this row
    node: RowNode,
    // The colDef been rendered
    colDef: ColDef,
    // The index of the row about to be rendered
    rowIndex: number,
    // If compiling to Angular, is the row's child scope, otherwise null.
    $scope: any,
    // A reference to the ag-Grid API.
    api: GridApi,
    // If provided in gridOptions, a context object
    context: any,
}</snippet>


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

    <snippet>
cellClassRules: {
    'rag-green': 'x &lt; 20',
    'rag-amber': 'x &gt;= 20 && x &lt; 25',
    'rag-red': 'x &gt;= 25'
}</snippet>

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

    <?= example('Cell Styling', 'cell-styling', 'generated') ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
