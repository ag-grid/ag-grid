<?php
$pageTitle = "ag-Grid - Working with Data: Setters and Parsers";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more.One such feature is Setters and Parsers. Value Setters and Value Parsers are the inverse of value getters and value formatters. Value setters are for placing values into data when field cannot be used. Value parser is for parsing edited values, e.g. removing formatting before storing into the data. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Value Setters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Value Setters</h1>

<p class="lead">
    After editing a cell, the grid normally inserts the new value into your data using the column
    definition <code>field</code>
    attribute. If it's not possible to use a field attribute, you can provide a Value Setter instead.
</p>

<p>
    A Value Setter is the inverse of a <a href="../javascript-grid-value-getters/">Value Getter</a>.
    Where the value getter allows getting values from your data using a function rather than
    a field, the value setter allows you to set values into your data using a function rather
    than specifying a field.
</p>

<p>
    The parameters provided to a value setter are as follows:
</p>

<snippet>
// interface for params
interface ValueSetterParams {
    oldValue: any, // the value before the change
    newValue: any, // the value after the change
    data: any, // the data you provided for this row
    node: RowNode, // the row node for this row
    colDef: ColDef, // the column def for this column
    column: Column, // the column for this column
    api: GridApi, // the grid API
    columnApi: ColumnApi, // the grid Column API
    context: any  // the context
}
</snippet>

<p>
    A value setter should return <code>true</code> if the value was updated successfully and <code>false</code>
    if the value was not updated (including if the value was not changed). When you return <code>true</code>, the
    grid knows it must refresh the cell.
</p>

<p>
    The following is an example of how you would configure a column using the field attribute
    and then follows how the same can be done using value getters and value setters.
</p>

<snippet>
// Option 1 - using field
colDef = {
    field: 'name';
};

// Options 2 - using valueGetter and valueSetter
// value getter used to get data
colDef = {
    valueGetter: function(params) {
        return params.data.name;
    },
    valueSetter: function(params) {
        params.data.name = params.newValue;
        return true;
    }
};
</snippet>

<h2 id="example-value-getter">Example: Value Setter</h2>

<p>
    The example below demonstrates value setters working alongside value getters
    (value setters are typically only used alongside value getters). Note
    the following:
</p>

<ul>
    <li>
        All columns are editable. After an edit, the example prints the updated row data to the console
        to show the impact of the edit.
    </li>
    <li>
        Column A uses <code>field</code> for both getting and setting the value. This is the simple case for
        comparison.
    </li>
    <li>
        Column B uses <code>valueGetter</code> and <code>valueSetter</code> instead of field for getting and
        setting the value. This allows the value to be parsed into the correct type before being saved.
    </li>
    <li>
        Column Name uses <code>valueGetter</code> to combine the value from the two attributes
        <code>firstName</code> and <code>lastName</code> and
        <code>valueSetter</code> is used to break the value up into the two same attributes.
    </li>
    <li>
        Column C.X and C.Y use <code>valueGetter</code> to get the value from an embedded object.
        They then use <code>valueSetter</code> to set the value into the embedded object while also
        making sure the correct structure exists (this structure creation would not happen if using field).
    </li>
</ul>

<?= grid_example('Value Setters', 'example-setters', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php';?>
