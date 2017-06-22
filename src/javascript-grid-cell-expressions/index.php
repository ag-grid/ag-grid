<?php
$key = "Cell Expressions";
$pageTitle = "ag-Grid Cell Expressions";
$pageDescription = "ag-Grid provides the ability to have expressions as cell values, just like in Excel. This page describes how to do this.";
$pageKeyboards = "ag-Grid Cell Expressions";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<style>
    .codeHighlight { background-color: #bde2e5}
</style>

<div>

    <h1 class="first-h1" id="expressions">Expressions</h1>

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

    <pre><span class="codeComment">// this is using standard functions</span>
colDef = {
    valueGetter: function(params) { return params.<span class="codeHighlight">data.firstName</span>; },
    valueFormatter: function(params) { return params.<span class="codeHighlight">value.toUpperCase()</span>; }
    ...
};

<span class="codeComment">// this is the same as above but using expressions</span>
colDef = {
    valueGetter: '<span class="codeHighlight">data.firstName</span>',
    valueFormatter: '<span class="codeHighlight">value.toUpperCase()</span>'
    ...
};</pre>

    <h2>Example Column Definition Expressions</h2>

    <p>
        Below is a very similar example to <a href="../javascript-grid-value-getters/#example-value-getter">
            "Example - Getters, Setters, Formatters, Parsers"</a>.
        The difference is that expressions are used instead of functions. For example, where a
        <code>valueGetter</code> is used, a string is provided instead of a function.
    </p>

    <show-example example="exampleValuesAndFormattersExpressions"></show-example>

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
    <ul>
        <li>They keep your column definitions as simple JSON objects (just strings, no functions) which
            makes them candidates for saving in offline storage (eg storing a report definition in a database).</li>
        <li>They make the definitions more compact, thus may make your code more maintainable.</li>
    </ul>
    </p>

    <h2>How Expressions Work</h2>

    <p>
        When you provide and expression to the grid, the grid converts the expression into a function
        for you and then executes the function. Consider the example below, the example provides
        <span class="codeHighlight">data.firstName</span> as the expression. This snippet of code
        then gets wrapped into a function with all the params attributes as function attributes.
    </p>

    <pre><span class="codeComment">// this is a simple expression on the column definition</span>
colDef.valueGetter = '<span class="codeHighlight">data.firstName</span>';

<span class="codeComment">// the grid will then compile the above to this:</span>
___compiledValueGetter = function(node, data, colDef, column, api, columnApi, context, getValue) {
    return <span class="codeHighlight">data.firstName</span>;
}</pre>

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

    <h3 id="example-expressions">Example Cell Expressions</h3>

    <p>
        This example demonstrates cell expressions. The second column values in the LHS (Left Hand Side)
        grid all have expressions. The following can be noted:
    </p>

    <ul>
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

    <show-example example="exampleCellExpressions"></show-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
