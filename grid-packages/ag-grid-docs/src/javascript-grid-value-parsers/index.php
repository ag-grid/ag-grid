<?php
$pageTitle = "ag-Grid - Value Parsers";
$pageDescription = "Value parsers are the inverse of value formatters. They change formatted text into values.";
$pageKeyboards = "ag-Grid Value Parsers";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Value Parsers</h1>

<p class="lead">
    After editing cells in the grid you have the opportunity to parse the value before inserting
    it into your data. This is done using Value Parsers.
</p>

<p>
    A Value Parser is the inverse of a <a href="../javascript-grid-value-formatters/">Value Formatter</a>.
</p>

<p>
    The parameters passed to a value parser are as follows:
</p>

<snippet>
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
}</snippet>

<p>
    The return value of a value parser should be the result of the parse, i.e. return the value
    you want stored in the data.
</p>

<h2 id="example-value-parser">Example: Value Parser</h2>

<p>
    Below shows an example using value parsers. The following can be noted:
</p>

<ul class="content">
    <li>
        All columns are editable. After any edit, the console prints the new data for that row.
    </li>
    <li>
        Column 'Name' is a string column. No parser is needed.
    </li>
    <li>
        Column 'Bad Number' is bad because after an edit, the value is stored as a string in the data,
        whereas the data value should be number type.
    </li>
    <li>
        Column 'Good Number' is good because after an edit, the value is converted to a number using
        the value parser.
    </li>
</ul>

<?= example('Value Parsers', 'example-parsers', 'generated', array('processVue' => true)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
