<?php
$pageTitle = "ag-Grid - Working with Data: Setters and Parsers";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Setters and Parsers. Value Setters and Value Parsers are the inverse of value getters and value formatters. Value setters are for placing values into data when field cannot be used. Value parser is for parsing edited values, e.g. removing formatting before storing into the data. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Value Setters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>Value Setters & Value Parsers</h1>

    <p class="lead">
        The section <a href="../javascript-grid-value-getters">Getters and Formatters</a>
        explained how to use <code>valueGetter</code> and <code>valueFormatter</code>
        to get and format the value before displaying it. This section explains their
        counterparts; <code>valueSetter</code> and <code>valueParser</code>, which are used for saving
        edited values.
    </p>

    <p>
        Use a <code>valueSetter</code> to set a value into your data after editing when the
        normal <code>colDef.field</code> attribute will not suffice.
    </p>

    <p>
        Use a <code>valueParser</code> to parse a value after editing.
    </p>

    <h2>Properties for Setters and Parsers</h2>

    <p>
        Below shows the column definition properties for valueSetters and valueParsers.
    </p>

    <table class="table reference">
        <?php include './settersAndParsersProperties.php' ?>
        <?php printPropertiesRows($settersAndParsersProperties) ?>
    </table>

    <p>
        These can be a function or an <a href="../javascript-grid-cell-expressions/">expression</a>.
        This page assumes functions. Once you understand this page, you can go to
        <a href="../javascript-grid-cell-expressions/">expression</a> to learn how to specify them as
        expressions.
    </p>

    <h2 id="example-value-getter">Example - Setters and Parsers</h2>

    <p>
        The example below demonstrates <code>valueGetter</code>, <code>valueSetter</code>,
        <code>valueFormatter</code> and <code>valueParser</code>.
        Some of the columns are editable. When you finish editing, the row data is printed to the console so you can take
        a look at the impact of the edits. The following should be noted from the demo:
    </p>

    <ul class="content">
        <li>
            <b>Column 'Simple':</b> This is a simple string column using field. It is a simple string column,
            so doesn't need any special treatment.
        </li>
        <li>
            <b>Column 'Bad Number':</b> This is editable. The value start as numbers. However the numbers
            after editing are stored as strings. This is bad, we should store the values after editing
            as numbers.
        </li>
        <li>
            <b>Column 'Good Number':</b> This is editable. The number is formatted for displaying using
            a <code>valueFormatter</code> and the result of editing is parsed to a number using <code>valueParser</code>.
        </li>
        <li>
            <b>Column 'Name':</b> This is editable. The name value is a combination of <code>firstName</code> and
            <code>lastName</code>. A <code>valueGetter</code> is used to combine the parts for display, and a
            <code>valueSetter</code> is used for setting the parts back into the grid (eg if you type 'Sam Boots',
            then 'Sam' gets set as the first name and 'Boots' as the last name.
        </li>
    </ul>

    <?= example('Setters and Parsers', 'setters-and-parsers', 'generated') ?>

    <h2>Value Saving Flow</h2>

    <p>
        The flow diagram below shows the flow of a value after it is edited using the UI.
    </p>

    <img src="valueSetterFlow.svg" class="img-fluid">

    <h2 id="value-setter">Value Setter</h2>

    <p>
        A <code>valueSetter</code> is the inverse of a <code>valueGetter</code>, it allows you to put
        values into your data in a way other than using the standard <code>colDef.field</code>.
        The interface for <code>valueSetter</code> is as follows:
    </p>

    <snippet>
// function for valueSetter
function valueSetter(params: ValueSetterParams) =&gt; boolean;

// interface for params
interface ValueGetterParams {
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

// example value setter, put into a particular part of the data
colDef.valueSetter = function(params) {
    // see if values are different, if you have a complex object,
    // it would be more complicated to do this.
    if (params.oldValue!==params.newValue) {
        params.data[someField] = params.newValue;
        // get grid to refresh the cell
        return true;
    } else {
        // no change, so no refresh needed
        return false;
    }
}</snippet>
    <h2 id="value-parser">Value Parser</h2>

    <p>
        A <code>valueParser</code> allows you to parse values after an edit (or after the user sets
        a value using the grid API).
        The interface for <code>valueParser</code> is as follows:
    </p>

    <snippet>
// function for valueParser
function valueParser(params: ValueParserParams) =&gt; any;

// interface for params
interface ValueParserParams {
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

// example value parser, convert a string to a number
colDef.valueParser = function(params) {
    // this is how to convert a string to a number using JavaScript
    return Number(params.newValue);
}</snippet>



<?php include '../documentation-main/documentation_footer.php';?>
