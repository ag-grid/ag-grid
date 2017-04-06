<?php
$key = "Value Getters";
$pageTitle = "ag-Grid Value Getters";
$pageDescription = "ag-Grid uses Value Getters to allow you to specify exactly where a value comes from. This page explains how to use Value Getters in ag-Grid";
$pageKeyboards = "ag-Grid Value Getters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="value-getters">Value Getters</h2>

    <p>
        The default way to get a value from a cell is provide a field value to the grid. However that may not always
        be possible. If you need more control over how a value is calculated, then use Value Getters.
    </p>

    <p>
        A value getter is either a function or an expression for getting the value for a cell. The result of the value
        getter is then forwarded to the cell renderer for rendering. Thus it is possible to have a value getter for
        example calculating a total of columns, and then a cell renderer for rendering currency, that renders decoupled
        from how the value is generated.
    </p>

    <p>
        The parameters provided to valueGetters are as follows:<br/>
        <ul>
        <li><b>data</b>: The row (from the rowData array, where value was taken) been rendered.</li>
        <li><b>node</b>: The node to be rendered.</li>
        <li><b>colDef</b>: The colDef in question, as provided through the gridOptions.</li>
        <li><b>api</b>: The API for the grid.</li>
        <li><b>context</b>: The grid context.</li>
        <li><b>getValue()</b>: A function, give it a column field name, and it returns the value for that column. Useful for chaining value getters.</li>
        </ul>
    </p>

    <p>
        The parameters to the value getter are similar to that of cellRenderers except with the following
        interesting differences:<br/>
        a) No value - as it's the valueGetters responsibiliy to create the value). <br/>
        b) No rowIndex - as the value should exist outside the concept of rendering to a particular
        row - for example, the valueGetter could be called for a row that is not being rendered.
    </p>

    <h3 id="value-getter-functions">Value Getter Functions</h3>

    <p>
        Value getter functions are similar to value renderers in their operation, in that you
        provide the value getter function as a function attached to the column definition.
    </p>

    <p>
        The example below uses a valueGetter function for calculating the 'Age Now' column.
    </p>

    <h3 id="value-getter-expressions">Value Getter Expressions</h3>

    <p>
        Value getter expressions work in the same was as functions, except you pass an expression. The expression
        has access to the same attributes as the function which are:

        <ul>
            <li><b>ctx</b>: maps context</li>
            <li><b>node</b>: maps node</li>
            <li><b>data</b>: maps data</li>
            <li><b>colDef</b>: maps colDef</li>
            <li><b>api</b>: maps api</li>
            <li><b>getValue</b>: maps getValue</li>
        </ul>

        The example below uses a valueGetter expression to calculate the Total Medals column.

    </p>

    <show-example example="example1"></show-example>

    <h2 id="headerValueGetter">Header Value Getters</h2>

    <p>
        Headers can also have values that change or are dependent on some extra data. For example,
        you might have a column that has the name of the current calendar month, and changes depending
        on what month the report is looking at.
    </p>

    <p>
        As with cell valueGetters, a headerValueGetter can be a function or an expression. It is
    provided with the parameters:

        <ul>
            <li><b>column</b>: The column, or null if it's a column group.</li>
            <li><b>columnGroup</b>: The column group, or null if it's a column.</li>
            <li><b>location</b>: Where the name will be used, one of {csv, clipboard, toolPanel, columnDrop, header}.</li>
            <li><b>colDef</b>: The column definition.</li>
            <li><b>ctx</b>: Grid context.</li>
            <li><b>api</b>: Grid API.</li>
        </ul>

    The only item not normal in the parameters is as follows:<br/>
    <ol>
        <li>Only one of column or columnGroup will be present, depending on whether it's
        a column or a column group.</li>
        <li>Parameter <i>location</i> allows you to have different column names depending on
        where the column is appearing, eg you might want to have a different name when the column
        is in the column drop zone or the toolbar.</li>
    </ol>

    See the <a href="../javascript-grid-tool-panel/#toolPanelExample">Tool Panel Example</a> for an example of <i>headerValueGetter</i>.

    </p>

    <p>
        If you want to update the columns (say after a change in the data which requires a new column name)
        then get the grid to update by calling <i>api.refreshHeader()</i>.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
