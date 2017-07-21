<?php
$key = "Setters and Parsers";
$pageTitle = "ag-Grid Value Setters and Parsers";
$pageDescription = "ag-Grid uses Value Setters and Parsers to allow you to specify how to store values and how to parse them. This page explains how to use Value Setters and parsers in ag-Grid";
$pageKeyboards = "ag-Grid Value Setters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="value-getters">Value Setters & Value Parsers</h1>

    <p>
        The section <a href="../javascript-grid-value-getters">Getters and Formatters</a>
        explained how to use <i>valueGetter</i> and <i>valueFormatter</i>
        to get and format the value for displaying. This section explains their
        equivalents <i>valueSetter</i> and <i>valueParser</i> that are used for saving
        edited values.
    </p>

    <p>
        Use a <code>valueSetter</code> to set a value into you data after editing when the
        normal <code>colDef.field</code> attribute will not suffice.
    </p>
    <p>
        Use a <code>valueParser</code> to parse a value after editing.
    </p>

    <h2>Properties for Setters and Parsers</h2>

    <p>
        Below shows the column definition properties for valueSetters and valueParsers.
    </p>

    <table class="table">
        <?php include './settersAndParsersProperties.php' ?>
        <?php printPropertiesRows($settersAndParsersProperties) ?>
    </table>

    <p>
        These can be a function or <a href="../javascript-grid-cell-expressions/">expression</a>.
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

    <ul>
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
            <b>Column 'Name':</b> This is editable. The name value is a combination of <i>firstName</i> and
            <i>lastName</i>. A <code>valueGetter</code> is used to combine the parts for display, and a
            <code>valueSetter</code> is used for setting the parts back into the grid (eg if you type 'Sam Boots',
            then 'Sam' gets set as the first name and 'Boots' as the last name.
        </li>
    </ul>

    <show-example example="exampleSettersAndParsers"></show-example>

    <h2>Value Saving Flow</h2>

    <p>
        The flow diagram below shows the flow of a value after it is edited using the UI.
    </p>

    <img src="valueSetterFlow.svg"/>

    <h2>Value Setter</h2>

    <p>
        A <code>valueSetter</code> is the inverse of a <code>valueGetter</code>, it allows you to put
        values into your data in a way other than using the standard <code>colDef.field</code>.
        The interface for <code>valueSetter</code> is as follows:
    </p>

    <pre><span class="codeComment">// function for valueSetter</span>
function valueSetter(params: ValueSetterParams) => boolean;

<span class="codeComment">// interface for params</span>
interface ValueGetterParams {
    oldValue: any, <span class="codeComment">// the value before the change</span>
    newValue: any, <span class="codeComment">// the value after the change</span>
    data: any, <span class="codeComment">// the data you provided for this row</span>
    node: RowNode, <span class="codeComment">// the row node for this row</span>
    colDef: ColDef, <span class="codeComment">// the column def for this column</span>
    column: Column, <span class="codeComment">// the column for this column</span>
    api: GridApi, <span class="codeComment">// the grid API</span>
    columnApi: ColumnApi, <span class="codeComment">// the grid Column API</span>
    context: any  <span class="codeComment">// the context</span>
}

<span class="codeComment">// example value setter, put into a particular part of the data</span>
colDef.valueSetter = function(params) {
    <span class="codeComment">// see if values are different, if you have a complex object,</span>
    <span class="codeComment">// it would be more complicated to do this.</span>
    if (params.oldValue!==params.newValue) {
        params.data[someField] = params.newValue;
        <span class="codeComment">// get grid to refresh the cell</span>
        return true;
    } else {
        <span class="codeComment">// no change, so no refresh needed</span>
        return false;
    }
}</pre>


    <h2>Value Parser</h2>

    <p>
        A <code>valueParser</code> allows you to parse values after an edit (or after the user sets
        a value using the grid API).
        The interface for <code>valueParser</code> is as follows:
    </p>

    <pre><span class="codeComment">// function for valueParser</span>
function valueParser(params: ValueParserParams) => any;

<span class="codeComment">// interface for params</span>
interface ValueParserParams {
    oldValue: any, <span class="codeComment">// the value before the change</span>
    newValue: any, <span class="codeComment">// the value after the change</span>
    data: any, <span class="codeComment">// the data you provided for this row</span>
    node: RowNode, <span class="codeComment">// the row node for this row</span>
    colDef: ColDef, <span class="codeComment">// the column def for this column</span>
    column: Column, <span class="codeComment">// the column for this column</span>
    api: GridApi, <span class="codeComment">// the grid API</span>
    columnApi: ColumnApi, <span class="codeComment">// the grid Column API</span>
    context: any  <span class="codeComment">// the context</span>
}

<span class="codeComment">// example value parser, convert a string to a number</span>
colDef.valueParser = function(params) {
    <span class="codeComment">// this is how to convert a string to a number using JavaScript</span>
    return Number(params.value);
}</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
