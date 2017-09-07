<?php
$key = "Getters and Formatters";
$pageTitle = "ag-Grid Value Getters";
$pageDescription = "ag-Grid uses Value Getters to allow you to specify exactly where a value comes from. This page explains how to use Value Getters in ag-Grid";
$pageKeyboards = "ag-Grid Value Getters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="value-getters">Value Getters and Value Formatters</h1>

    <p>
        The grid displays values from your data. The easiest way to configure this is to set <code>colDef.field</code>.
        The grid then pulls the gets and sets (after editing) the data to this location and does no formatting
        for the value.
    </p>

    <pre><span class="codeComment">// the grid is told to use the 'country' field for this column</span>
var countryColDef = {
    field: 'country',
    ...
}</pre>

    <p>
        You should use <code>colDef.field</code> most of the time. However you may require to get / set the data
        another way, or you may wish to format (for display) or parse (after editing) the data if you do not
        display the data 'as is'. For these reasons, the grid provides the following additional methods:
    </p>

    <h2>Properties for Getters and Formatters</h2>

    <p>
        Below shows the column definition properties for valueGetters and valueFormatters.
    </p>

    <table class="table">
        <?php include './gettersAndFormattersProperties.php' ?>
        <?php printPropertiesRows($gettersAndFormattersProperties) ?>
    </table>

    <p>
        All the above can be a function or <a href="../javascript-grid-cell-expressions/">expression</a>.
        This page assumes functions. Once you understand this page, you can go to
        <a href="../javascript-grid-cell-expressions/">expression</a> to learn how to specify them as
        expressions.
    </p>

    <h2 id="example-value-getter">Example - Getters and Formatters</h2>

    <p>
        The example below demonstrates <code>valueGetter</code> and <code>valueFormatter</code>.
        The following can be noted from the demo:
    </p>

    <ul>
        <li>Column 'Number' is a simple column with a <code>field</code> to get the data and without formatting.</li>
        <li>Column 'Formatted' uses the same field, however it formats the value.</li>
        <li>Column 'A + B' uses a value getter to sum the contents of cells 'A' and 'B'.</li>
        <li>
            Column 'Chain' uses a value getter than references the result of the 'A + B' value
            getter, demonstrating how the value getter's can chain result from one to the other.
        </li>
        <li>Column 'Const' uses a value getter to always return back the same string value.</li>
    </ul>

    <show-example example="exampleGettersAndFormatters"></show-example>

    <h2>Rendering Value Flow</h2>

    <p>
        The flow diagram below shows the flow of the value to displaying it on the screen.
    </p>

    <img src="valueGetterFlow.svg"/>

    <h2 id="value-getter">Value Getter</h2>

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

    <note>
        All valueGetter's must be pure functions. That means, given the same state of your
        data, it should consistently return the same result. This is important as the grid will only call your
        valueGetter once during a redraw, even though the value may be used multiple times. For example, the
        value will be used to display the cell value, however it can additionally be used to provide values
        to an aggregation function when grouping, or can be used as input to another valueGetter via the
        params.getValue() function.
    </note>

    <h2 id="value-formatter">Value Formatter</h2>

    <p>
        A <code>valueFormatter</code> allows you to format or transform the value for display purposes. The section on
        <a href="../javascript-grid-reference-data">Reference Data</a> describes how to transform reference data using a
        <code>valueFormatter</code> to display names rather than codes.
    </p>

    <p>
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
        A <a href="../javascript-grid-cell-rendering-components/">cell renderer</a> allows you to put whatever HTML
        you want into a cell. This sounds like a <code>valueFormatter</code> and and a <code>cellRenderer</code>
        have cross purposes, so you may be wondering, when do you use each one and not the other?
    </p>

    <p>
        The answer is: <code>valueFormatter</code>'s are for text formatting / value transformations.
        <code>cellRenderer</code>'s are for when you want
        to include HTML markup and potentially functionality to the cell.
        So for example, if you want to put punctuation into a value, use a <code>valueFormatter</code>,
        if you want to put buttons or HTML links use a <code>cellRenderer</code>.
        It is possible to use a
        combination of both, in which case the result of the <code>valueFormatter</code> will be
        passed to the <code>cellRenderer</code>.
    </p>

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
        for pinned rows. If you don't specify a <code>colDef.floatingCellFormatter</code>, then <code>cellFormatter</code>
        will get used instead if it is present.
    </p>

    <note>
        You can use the same formatter for pinned rows and normal rows and check the row type.
        You can check if the row is floating by checking params.node.floating property.
    </note>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
