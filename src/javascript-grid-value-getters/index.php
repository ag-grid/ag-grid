<?php
$key = "Getters and Formatters";
$pageTitle = "ag-Grid Value Getters";
$pageDescription = "ag-Grid uses Value Getters to allow you to specify exactly where a value comes from. This page explains how to use Value Getters in ag-Grid";
$pageKeyboards = "ag-Grid Value Getters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="value-getters">Getters, Setters, Formatters & Parsers</h1>

    <p>
        The grid displays values from your data. The easiest way to configure this is to set <code>colDef.field</code>.
        The grid then pulls the gets and sets (after editing) the data to this location and does not formatting
        for the value.
    </p>

    <pre><span class="codeComment">// the grid is told to use the 'country' field for this column</span>
var countryColDef = {
    field: 'country',
    ...
}</pre>

    <p>
        You should use <code>colDef.field</code> most of the time. However you may require to get/set the data
        another way, or you may wish to format (for display) or parse (after editing) the data if you do not
        display the data 'as is'. For these reasons, the grid provides the following additional methods:
    </p>

    <h3>Column Definition Properties for Getters, Setters, Formatters & Parsers</h3>

    <table class="table">
        <?php include './valuesAndFormattersProperties.php' ?>
        <?php printPropertiesRows($valuesAndFormattersProperties) ?>
        <?php printPropertiesRows($valuesAndFormattersMoreProperties) ?>
    </table>

    <h2 id="example-value-getter">Example - Getters, Setters, Formatters, Parsers</h2>

    <p>
        The example below demonstrates <code>valueGetter</code>, <code>valueSetter</code>,
        <code>valueFormatter</code> and <code>valueParser</code> all
        using functions (<a href="../javascript-grid-cell-expressions/">expressions</a> are explained in the next section).
        Some of the columns are editable. When you finish editing, the row data is printed to the console so you can take
        a look at the impact of the edits. The following should be noted from the demo:
    </p>

    <note>
        You can provide all getters, setters, formatters and parsers as functions OR
        <a href="../javascript-grid-cell-expressions/">expressions</a>. Both achieve the same
        when added to the column definitions.
        <a href="../javascript-grid-cell-expressions/">Expressions</a> are explained in the next section.
    </note>

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
        <li>
            <b>Column 'A', 'B', 'A+B':</b> Columns A and B are simple number columns. Column A+B demonstrates
            using a <code>valueGetter</code> to calculate a value for display.
        </li>
    </ul>

    <show-example example="exampleValuesAndFormatters"></show-example>

    <h2>Value Getter Flow</h2>

    <p>
        The flow diagram below shows the flow of the value getter.
    </p>

    <img src="valueGetterFlow.svg"/>

    <h2>Value Setter Flow</h2>

    <p>
        The flow diagram below shows the flow of the value setter.
    </p>

    <img src="valueSetterFlow.svg"/>

    <h2>Value Getter</h2>

    <p>
        A <code>valueGetter</code> allows you to pull values from your data instead of using the standard
        <code>colDef.field</code> mechanism. The interface for <code>valueGetter</code> is as follows:
    </p>

    <pre><span class="codeComment">// function for valueGetter</span>
function valueGetter(params: ValueGetterParams) => any;

<span class="codeComment">// interface for params</span>
interface ValueGetterParams {
    data: any, <span class="codeComment">// the data you provided for this row</span>
    node: RowNode, <span class="codeComment">// the row node for this row</span>
    colDef: ColDef, <span class="codeComment">// the column def for this column</span>
    column: Column, <span class="codeComment">// the column for this column</span>
    api: GridApi, <span class="codeComment">// the grid API</span>
    columnApi: ColumnApi, <span class="codeComment">// the grid Column API</span>
    context: any,  <span class="codeComment">// the context</span>
    getValue: (colId: string) => any  <span class="codeComment">// a utility method, for getting other column values</span>
}

<span class="codeComment">// example value getter, adds two fields together</span>
colDef.valueGetter = function(params) {
    return params.data.firstName + params.data.lastName;
}</pre>


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



    <h2>Value Formatter</h2>

    <p>
        A <code>valueFormatter</code> allows you to format the value for display purposes.
        The interface for <code>valueFormatter</code> is as follows:
    </p>

    <pre><span class="codeComment">// function for valueFormatter</span>
function valueFormatter(params: ValueGetterParams) => any;

<span class="codeComment">// interface for params</span>
interface ValueFormatterParams {
    value: any, <span class="codeComment">// the value before the change</span>
    data: any, <span class="codeComment">// the data you provided for this row</span>
    node: RowNode, <span class="codeComment">// the row node for this row</span>
    colDef: ColDef, <span class="codeComment">// the column def for this column</span>
    column: Column, <span class="codeComment">// the column for this column</span>
    api: GridApi, <span class="codeComment">// the grid API</span>
    columnApi: ColumnApi, <span class="codeComment">// the grid Column API</span>
    context: any  <span class="codeComment">// the context</span>
}

<span class="codeComment">// example value formatter, simple currency formatter</span>
colDef.valueFormatter = function(params) {
    return '£' + params.value;
}</pre>

    <h2>Value Formatter vs Cell Renderer</h2>

    <p>
        A <a href="../javascript-grid-cell-rendering-components/">cellRenderer</a> allows you to put whatever HTML
        you want into a cell. This sounds like a <code>valueFormatter</code> and and a <code>cellRenderer</code>
        have cross purposes, so you may be wondering, when do you use each one and not the other?
    </p>

    <p>
        The answer is: <code>valueFormatter</code>'s are for text formatting.
        <code>cellRenderer</code>'s are for when you want
        to include HTML markup and potentially functionality to the cell.
        So for example, if you want to put punctuation into a value, use a <code>valueFormatter</code>,
        if you want to put buttons or HTML links use a <code>cellRenderer</code>.
        It is possible to use a
        combination of both, in which case the result of the <code>valueFormatter</code> will be
        passed to the <code>cellRenderer</code>.
    </p>


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


    <h2>Header Value Getters</h2>

    <p>
        Use <code>headerValueGetter</code> instead of <code>colDef.headerName</code> to allow dynamic header names.
    </p>

    <p>
        The parameters for <code>headerValueGetter</code> differ from standard <code>valueGetter</code> as follows:
    </p>

    <ul>
        <li>Only one of column or columnGroup will be present, depending on whether it's
            a column or a column group.</li>
        <li>Parameter <i>location</i> allows you to have different column names depending on
            where the column is appearing, eg you might want to have a different name when the column
            is in the column drop zone or the toolbar.</li>
    </ul>

    <p>
        See the <a href="../javascript-grid-tool-panel/#toolPanelExample">Tool Panel Example</a> for an example of <i>headerValueGetter</i>
        used in different locations, where you can change the header name depending on where the name appears.
    </p>

    <h2>Floating Cell Formatter</h2>

    <p>
        Use <b>floatingCellFormatter</b> instead of <code>colDef.cellFormatter</code> to allow different formatting
        for floating rows. If you don't specify a <code>colDef.floatingCellFormatter</code>, then <code>cellFormatter</code>
        will get used instead if it is present.
    </p>

    <note>
        You can use the same formatter for floating rows and normal rows and check the row type.
        You can check if the row is floating by checking params.node.floating property.
    </note>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
