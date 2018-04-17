<?php
$pageTitle = "Column Spanning: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Column Spanning. Column Spanning allows cells to span columns, similar to cell span in Excel. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "Javascript Grid Column Spanning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1 class="first-h1">Column Spanning</h1>

    <p class="lead">
        By default, each cell will take up the width of one column. You can change this behaviour
        to allow cells to span multiple columns. This feature is similar to 'cell merging' in Excel
        or 'column spanning' in HTML tables.
    </p>

    <h2>Configuring Column Spanning</h2>

    <p>
        Column spanning is set configured at the column definition level. To have a cell
        span more than one column, return how many columns to span in the callback
        <code>colDef.colSpan</code>.
    </p>

    <snippet>
// col span is 2 for rows with russia, but 1 for everything else
colDef = {
    headerName: "Country",
    field: "country",
    colSpan: function(params) {
        return params.data.country==='Russia' ? 2 : 1;
    }
    ...
};</snippet>

    <p>
        The interface for the colSpan callback is as follows:
    </p>

    <snippet>
// function you implement on the column definition
function colSpan(params: ColSpanParams) =&gt; number;

interface ColSpanParams {
    node: any, // row node in question
    data: RowNode, // data for the row
    colDef: ColDef, // the col def for the column
    column: Column, // the column object in question
    api: GridApi, // the grid's API
    columnApi: ColumnApi, // the grids column API
    context: any // the provided context
}</snippet>

    <h2>Column Spanning Simple Example</h2>

    <p>
        Below shows a simple example using column spanning. The example doesn't make much sense,
        it just arbitrarily sets column span on some cells for demonstrations purposes, however
        we though it easier to show column spanning with the familiar olympic winners data
        before going a bit deeper into it's usages. The following can be noted:
    </p>

    <ul class="content">
        <li>
            The country column is configured to span 2 columns when 'Russia' and 3 columns
            when 'United States'. All other times it's normal (1 column).
        </li>
        <li>
            To help demonstrate the spanned column, the county column is shaded using CSS
            styling. This style can be seen a the top of the HTML page.
        </li>
        <li>
            Resizing any columns that are spanned over will also resize the spanned cells.
            For example, resizing the column immediately to the right of 'Country' will resize
            all cells spanning over the resized column.
        </li>
        <li>
            The first two columns are pinned. If you drag the country column into the pinned
            area, you will notice that the spanning is constrained within the pinned section.
            E.g. if you place country as the last pinned column, no spanning will occur,
            as the spanning can only happen over cells in the same region, and country now
            has no further columns inside the pinned region.
        </li>
    </ul>

    <?= example('Column Spanning Simple', 'column-spanning-simple', 'generated') ?>

    <h2>Column Spanning Complex Example</h2>

    <p>
        Column spanning will typically be used for creating reports with ag-Grid. Below
        is something that would be more typical of the column spanning feature. The following
        can be noted from the example:
    </p>

    <ul class="content">
        <li>
            The data is formatted in a certain way, it is not intended for the user to sort this
            data or reorder teh columns.
        </li>
        <li>
            The dataset has meta-data inside it, the <code>data.section</code> attribute. This
            meta-data, provided by the application, is used in the grid configuration in order
            to set the column spans and the backgrond colors.
        </li>
    </ul>

    <?= example('Column Spanning Complex', 'column-spanning-complex', 'generated') ?>


<?php include '../documentation-main/documentation_footer.php';?>
