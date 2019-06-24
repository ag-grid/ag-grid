<?php
$pageTitle = "ag-Grid - Working with Data: Value Getter & Value Formatter";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Value Getter & Value Formatter. Value Getters & Value Formatters are about getting and formatting the data to display. Use Value Getters when the data is not a simple field. Use Value Formatters to format values for display. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Value Getters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>Value Formatters</h1>

    <p class="lead">
        Value formatters allow you to format values for display. This is useful when data is one type (e.g. numeric)
        but needs to be converted for human reading (e.g. putting in currency symbols and number formatting).
    </p>

    <p>
        Below shows the column definition properties for value formatters.
    </p>

    <table class="table reference">
        <?php include './valueFormatterProperties.php' ?>
        <?php printPropertiesRows($valueFormatterProperties) ?>
    </table>

    <p>
        The interface for <code>valueFormatter</code> is as follows:
    </p>

    <snippet>
// function for valueFormatter
function valueFormatter(params: ValueGetterParams) =&gt; any;

// interface for params
interface ValueFormatterParams {
    value: any, // the value before the change
    data: any, // the data you provided for this row
    node: RowNode, // the row node for this row
    colDef: ColDef, // the column def for this column
    column: Column, // the column for this column
    api: GridApi, // the grid API
    columnApi: ColumnApi, // the grid Column API
    context: any  // the context
}

// example value formatter, simple currency formatter
colDef.valueFormatter = function(params) {
    return '£' + params.value;
}</snippet>

    <h2>Value Formatter vs Cell Renderer</h2>

    <p>
        A <a href="../javascript-grid-cell-rendering-components/">cell renderer</a> allows you to put whatever HTML
        you want into a cell. This sounds like value formatters and a cell renderers
        have cross purposes, so you may be wondering, when do you use each one and not the other?
    </p>

    <p>
        The answer is that value formatter's are for text formatting
        and cell renderer's are for when you want
        to include HTML markup and potentially functionality to the cell.
        So for example, if you want to put punctuation into a value, use a value formatter,
        but if you want to put buttons or HTML links use a cell renderer.
        It is possible to use a
        combination of both, in which case the result of the value formatter will be
        passed to the cell renderer.
    </p>

    <note>
        Be aware that the Value Formatter params won't always have 'data' and 'node' supplied, e.g. the
        params supplied to the Value Formatter in the <a href="../javascript-grid-filter-set/">Set Filter</a>.
        As a result favour formatter implementations that rely upon the 'value' argument instead, as this
        will lead to better reuse of your Value Formatters.
    </note>

    <h2>Value Formatter Example</h2>

    <p>
        The example below shows value formatters in action.
    </p>

    <?= example('Value Formatters', 'value-formatters', 'generated', array('processVue' => true)) ?>


    <h2>Floating Cell Formatter</h2>

    <p>
        Use <code>floatingCellFormatter</code> instead of <code>colDef.cellFormatter</code> to allow different formatting
        for pinned rows. If you don't specify a <code>colDef.floatingCellFormatter</code>, then <code>cellFormatter</code>
        will get used instead if it is present.
    </p>

    <note>
        You can use the same formatter for pinned rows and normal rows and check the row type.
        You can check if the row is floating by checking <code>params.node.floating</code> property.
    </note>


<?php include '../documentation-main/documentation_footer.php';?>
