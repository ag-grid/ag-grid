<?php
$pageTitle = "Cell Styles: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Cell Styling. Use CSS rules to define Cell Style based on data content, e.g. put a red background onto cells that have negative values, and green on values greater than 100. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Cell Styles";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h1>Cell Styles</h1>

    <p>
        Cell customisation is done a the column level via the column definition. You can mix and match any
        of the following mechanisms:
    </p>
        <ul class="content">
            <li><b>Cell Style:</b> Providing a CSS style for the cells.</li>
            <li><b>Cell Class:</b> Providing a CSS class for the cells.</li>
            <li><b>Cell Class Rules:</b> Providing rules for applying CSS classes.</li>
        </ul>

    <p>
        Each of these approaches are presented in the following sections.
    </p>

    <h2>Cell Style</h2>

    <p>
        Used to provide CSS styles directly (not using a class) to the cell. Can be either an object
        of CSS styles, or a function returning an object of CSS styles.
    </p>


    <snippet>
// return same style for each row
var colDef = {
    name: 'Static Styles',
    field: 'field1',
    cellStyle: {color: 'red', 'background-color': 'green'}
}
// return different styles for each row
var colDef = {
    name: 'Dynamic Styles',
    field: 'field2',
    cellStyle: function(params) {
        if (params.value=='Police') {
            //mark police cells as red
            return {color: 'red', backgroundColor: 'green'};
        } else {
            return null;
        }
    }
}</snippet>


    <h2>Cell Class</h2>

    <p>
        Provides a class for the cells in this column. Can be a string (a class), array of strings
        (array of classes), or a function (that returns a string or an array of strings).
    </p>

    <snippet>
// return same class for each row
var colDef1 = {
    name: 'Static Class',
    field: 'field1',
    cellClass: 'my-class'
}

// return same array of classes for each row
var colDef2 = {
    name: 'Static Array of Classes',
    field: 'field2',
    cellClass: ['my-class1','my-class2']
}

// return class based on function
var colDef3 = {
    name: 'Function Returns String',
    field: 'field3',
    cellClass: function(params) { return (params.value==='something'?'my-class-1':'my-class-2'); }
}

// return array of classes based on function
var colDef4 = {
    name: 'Function Returns Array',
    field: 'field4',
    cellClass: function(params) { return ['my-class-1','my-class-2']; }
}</snippet>


    <h2>Cell Class Rules</h2>

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

    <h2>Cell Style, Cell Class & Cell Class Rules Params</h2>

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
</p>

        <ul class="content">
            <li><code>x</code>: maps value</li>
            <li><code>ctx</code>: maps context</li>
            <li><code>node</code>: maps node</li>
            <li><code>data</code>: maps data</li>
            <li><code>colDef</code>: maps colDef</li>
            <li><code>rowIndex</code>: maps rowIndex</li>
            <li><code>api</code>: maps api</li>
        </ul>

<p>
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

    <h2>Refresh of Styles</h2>

    <p>
        If you refresh a cell, or a cell is updated due to editing, the cellStyle,
        cellClass and cellClassRules are all applied again. This has the following
        effect:
    </p>
        <ul class="content">
            <li><code>cellStyle</code>: All new styles are applied. If a new style is the
            same as an old style, the new style overwrites the old style.</li>
            <li><code>cellClass</code>: All new classes are applied. Old classes are not
            removed so be aware that classes will accumulate. If you want to remove
            old classes, then use cellClassRules.</li>
            <li><code>cellClassRules</code>: Rules that return true will have the class
            applied the second time. Rules tha return false will have the class removed
            second time.</li>
        </ul>

    <h2>Example Cell Styling</h2>

    <p>Below shows both cssClassRules snippets above in a full working example. The example
    demonstrates the following:
    </p>
        <ul class="content">
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

    <?= example('Cell Styling', 'cell-styling', 'generated') ?>


<?php include '../documentation-main/documentation_footer.php';?>
