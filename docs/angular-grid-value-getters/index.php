<?php
$key = "Value Getters";
$pageTitle = "AngularJS Angular Grid Value Getters";
$pageDescription = "Angular Grid uses Value Getters to allow you to specify exactly where a value comes from. This page explains how to use Value Getters in Angular Grid";
$pageKeyboards = "AngularJS Angular Grid Value Getters";
include '../documentation_header.php';
?>

<div>

    <h2>Value Getters</h2>

    <p>
        The default way to get a value from a cell is provide a field value to the grid. However that may not always
        be possible. If you need more control over how a value is calculated, then use Value Getters.
    </p>

    <p>
        A value getter is either a function or an expression for getting the value for a cell. The result of the value
        getter is then forwarded to the cell renderer for rendering. Thus it is possible to have a value getter for
        example calculating a total of columns, and then a cell renderer for rendering currency, that renders decoupled
        form how the value is generated.
    </p>

    <p>
        The parameters provided to valueGetters are similar to that of cellRenderers except
        a) no value (as it's the valueGetters responsibiliy to create the value) and b)
        no rowIndex (as the value should exist outside the concept of rendering to a particular
        row - for example, the valueGetter could be called for a row that is not being rendered).
    </p>

    <h3>Value Getter Functions</h3>

    <p>
        Value getter functions are similar to value renderers in their operation. You provide a function that takes
        a params object and return a result. The result is then rendered in the same way as normal, either by placing
        the value into the cell (the default), or by using the provided cell renderer.
    </p>

    <p>
        The example below uses a valueGetter function for calculating the 'Age Now' column.
    </p>

    <h3>Value Getter Expressions</h3>

    <p>
        Value getter expressions work in the same was as functions, except you pass an expression. The expression
        has access to the same attributes as the function which are:

        <ul>
            <li><b>ctx</b>: maps context</li>
            <li><b>node</b>: maps node</li>
            <li><b>data</b>: maps data</li>
            <li><b>colDef</b>: maps colDef</li>
            <li><b>api</b>: maps api</li>
        </ul>

        The example below uses a valueGetter expression to calculate the Total Medals column.

    </p>

    <show-example example="example1"></show-example>

</div>

<?php include '../documentation_footer.php';?>
