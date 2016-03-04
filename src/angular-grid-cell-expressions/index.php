<?php
$key = "Cell Expressions";
$pageTitle = "AngularJS Angular Grid Cell Expressions";
$pageDescription = "Angular Grid provides the ability to have expressions as cell values, just like in Excel. This page describes how to do this.";
$pageKeyboards = "AngularJS Angular Grid Cell Expressions";
include '../documentation_header.php';
?>

<div>

    <h2>Cell Expressions</h2>

    <p>
        In the section on <a href="../angular-grid-value-getters/index.php">value getters</a>
        you will have seen how you can use expressions when defining how to get the value for
        a cell. However a shortcoming of this approach, is that the expression belongs to
        the column and cannot be defined as part of the data.
    </p>
    <p>
        Cell Expressions bring the expression power to the cell level, so your grid can act
        similar to how spreadsheets work.
    </p>
    <p>
        To enable cell expressions, set <i>enableCellExpressions=true</i> in the gridOptions.
        Then, whenever the grid comes across a value starting with '=', it will treat it
        as an expression.
    </p>
    <p>
        The cell expression has the same parameters of value getter expressions, which are as follows:
        <ul>
            <li><b>ctx</b>: maps context</li>
            <li><b>node</b>: maps node</li>
            <li><b>data</b>: maps data</li>
            <li><b>colDef</b>: maps colDef</li>
            <li><b>api</b>: maps api</li>
            <li><b>getValue</b>: maps getValue</li>
        </ul>
    </p>

    <p>
        Because you have access to the context (ctx) in your expression, you can add functions to the
        context to be available in your expressions. This allows you limitless power in what you can
        calculated for your expression. For example, you could provide a function that takes values
        from outside of the grid.
    </p>

    <h3>Example</h3>

    <p>
        The example blow shows cell expressions in action. The second column values in the LHS (Left Hand Side)
        grid all have expressions.
    </p>

    <p>
        'Number Squared' and 'Number x 2' both take the number from the header as an input.
    </p>

    <p>
        'Todays Date' prints the date.
    </p>

    <p>
        'Sum A' and 'Sum B' both call a user provided function that is attached to the context.
    </p>

    <show-example example="exampleCellExpressions"></show-example>
</div>

<?php include '../documentation_footer.php';?>
