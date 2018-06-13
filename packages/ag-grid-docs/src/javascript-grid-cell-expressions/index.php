<?php
$pageTitle = "Cell Expressions: A Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Expressions which allows you to use simple strings instead of functions for value getters, setters, formatters and parsers. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Cell Expressions";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>Expressions</h1>

    <p>
        Expressions can be used in two different ways as follows:
    </p>

    <ol>
        <li>
            <b>Column Definition Expressions: </b>Inside column definitions instead of functions for <code>valueGetter</code>, <code>valueSetter</code>,
            <code>valueFormatter</code> and <code>valueParser</code>.
        </li>
        <li>
            <b>Cell Expressions:</b>Inside cells within the grid, similar to placing expressions in cells in Excel.
        </li>
    </ol>

    <h2 id="expressions-column-definitions">Column Definition Expressions</h2>

    <p>
        Expressions can be used inside column definitions instead of using functions for the getters, setters,
        formatters and parsers. To use an expression instead of a function, just put what the body of the function
        into a string.
    </p>

    <snippet>
// this is using standard functions
colDef = {
    valueGetter: function(params) { return params.data.firstName; },
    valueFormatter: function(params) { return params.value.toUpperCase(); }
    ...
};

// this is the same as above but using expressions
colDef = {
    valueGetter: 'data.firstName',
    valueFormatter: 'value.toUpperCase()'
    ...
};</snippet>

    <h2>Example Column Definition Expressions</h2>

    <p>
        Below is a very similar example to <a href="../javascript-grid-value-getters/#example-value-getter">
            "Example - Getters, Setters, Formatters, Parsers"</a>.
        The difference is that expressions are used instead of functions. For example, where a
        <code>valueGetter</code> is used, a string is provided instead of a function.
    </p>

    <?= example('Column Definition Expressions', 'column-definition-expressions', 'generated') ?>

    <h2>Variables to Expressions</h2>

    <p>
        The following variables are available to the expression with the following params mapping:
    </p>

    <ul class="content">
        <li><code>x</code> => Mapped from params.value</li>
        <li><code>value</code> => Mapped from params.value</li>
        <li><code>oldValue</code> => Mapped from params.oldValue</li>
        <li><code>newValue</code> => Mapped from params.newValue</li>
        <li><code>node</code> => Mapped from params.node</li>
        <li><code>data</code> => Mapped from params.data</li>
        <li><code>colDef</code> => Mapped from params.colDef</li>
        <li><code>column</code> => Mapped from params.column</li>
        <li><code>columnGroup</code> => Mapped from params.columnGroup</li>
        <li><code>getValue</code> => Mapped from params.getValue</li>
        <li><code>api</code> => Mapped from params.api</li>
        <li><code>columnApi</code> => Mapped from params.columnApi</li>
        <li><code>ctx</code> => Mapped from params.context</li>
    </ul>

    <p>
        For example, for <code>valueFormatter</code>'s, you can access to the value via
        the 'x' and 'value' attributes. However in <code>valueGetter</code>'s, the 'x'
        and 'value' will be undefined as these are not part of the <code>valueGetter</code>
        params.
    </p>

    <h2>Column Definition Expressions vs Functions</h2>

    <p>
        Expressions and functions are two ways of achieving identical results. So why have two methods?
    </p>

    <p>
        The advantage of functions is that they are easier to work with for you. Functions will be treated
        by your IDE as functions and thus benefit from compile time checks, debugging e.t.c.
    </p>

    <p>
        The advantage of expressions are:
    </p>

    <ul class="content">
        <li>They keep your column definitions as simple JSON objects (just strings, no functions) which
            makes them candidates for saving in offline storage (eg storing a report definition in a database).</li>
        <li>They make the definitions more compact, thus may make your code more maintainable.</li>
    </ul>

    <h2 id="cell-expressions">Cell Expressions</h2>

    <p>
        Above we saw how you can have <code>expressions</code> instead of <code>valueGetters</code>.
        A shortcoming of this approach is that the expression belongs to the column and cannot be
        defined as part of the data, or in other words, the expression is for the entire column,
        it cannot be set to a particular cell.
    </p>
    <p>
        Cell Expressions bring the expression power to the cell level, so your grid can act
        similar to how spreadsheets work.
    </p>

    <note>
        Although you can put expressions into cells like Excel, the intention is that your application
        will decide what the expressions are. It is not intended that you give this power to your user
        and have the cells editable. This is because ag-Grid is not trying to give Excel expressions
        to the user, rather ag-Grid is giving you, the developer, the power to design reports and
        include JavaScript logic inside the cells.
    </note>

    <p>
        To enable cell expressions, set <code>enableCellExpressions=true</code> in the gridOptions.
        Then, whenever the grid comes across a value starting with '=', it will treat it
        as an expression.
    </p>
    <p>
        The cell expressions have the same parameters of value getter expressions.
    </p>

    <p>
        Because you have access to the context (ctx) in your expression, you can add functions to the
        context to be available in your expressions. This allows you limitless power in what you can
        calculated for your expression. For example, you could provide a function that takes values
        from outside of the grid.
    </p>

    <h2>Example Cell Expressions</h2>

    <p>
        This example demonstrates cell expressions. The second column values in the LHS (Left Hand Side)
        grid all have expressions. The following can be noted:
    </p>

    <ul class="content">
        <li>
            'Number Squared' and 'Number x 2' both take the number from the header as an input.
        </li>
        <li>
            'Today's Date' prints the date.
        </li>
        <li>
            'Sum A' and 'Sum B' both call a user provided function that is attached to the context.
        </li>
    </ul>

    <?= example('Cell Expressions', 'cell-expressions', 'multi') ?>

    <h2>How Expressions Work</h2>

    <p>
        When you provide and expression to the grid, the grid converts the expression into a function
        for you and then executes the function. Consider the example below, the example provides
        <code>data.firstName</code> as the expression. This snippet of code
        then gets wrapped into a function with all the params attributes as function attributes.
    </p>

    <snippet>
// this is a simple expression on the column definition
colDef.valueGetter = 'data.firstName';

// the grid will then compile the above to this:
___compiledValueGetter = function(node, data, colDef, column, api, columnApi, context, getValue) {
    return data.firstName;
}</snippet>

    <p>
        If your expression has the word <code>return</code> in it, then the grid will assume it is a multi line
        expression and will not wrap it.
    </p>

    <p>
        If your valueGetter does not have the word 'return' in it, then the grid will insert the
        'return' statement and the ';' for you.
    </p>

    <p>
        If your expression has many lines, then you will need to provide the ';' at the end of each
        line and also provide the 'return' statement.
    </p>



<?php include '../documentation-main/documentation_footer.php';?>
