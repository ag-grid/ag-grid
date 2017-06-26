<?php
$key = "Column Spanning";
$pageTitle = "Javascript Grid Column Spanning";
$pageDescription = "Explains how to set column spanning on ag-Grid, to all the grid's cells to span multiple columns.";
$pageKeyboards = "Javascript Grid Column Spanning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1">Column Spanning</h1>

    <p>
        By default, each cell will take up the width of one column. You can change this behaviour
        to allow cells to span multiple columns. This feature is similar to 'cell merging' in Excel
        or 'column spanning' in HTML tables.
    </p>

    <h3>Configuring Column Spanning</h3>

    <p>
        Column spanning is set configured at the column definition level. To have a cell
        span more than one column, return how many columns to span in the callback
        <code>colDef.colSpan</code>.
    </p>

    <pre><span class="codeComment">// col span is 2 for rows with russia, but 1 for everything else</span>
colDef = {
    headerName: "Country",
    field: "country",
    colSpan: function(params) {
        return params.data.country==='Russia' ? 2 : 1;
    }
    ...
};</pre>

    <p>
        The interface for the colSpan callback is as follows:
    </p>

    <pre><span class="codeComment">// function you implement on the column definition</span>
function colSpan(params: ColSpanParams) => number;

interface ColSpanParams {
    node: any, <span class="codeComment">// row node in question</span>
    data: RowNode, <span class="codeComment">// data for the row</span>
    colDef: ColDef, <span class="codeComment">// the col def for the column</span>
    column: Column, <span class="codeComment">// the column object in question</span>
    api: GridApi, <span class="codeComment">// the grid's API</span>
    columnApi: ColumnApi, <span class="codeComment">// the grids column API</span>
    context: any <span class="codeComment">// the provided context</span>
}</pre>

    <h2>Column Spanning Simple Example</h2>

    <p>
        Below shows a simple example using column spanning. The following can be noted:
    </p>

    <ul>
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

    <show-example example="exampleColumnSpanning"></show-example>

    <show-example example="exampleColumnSpanningComplex"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
