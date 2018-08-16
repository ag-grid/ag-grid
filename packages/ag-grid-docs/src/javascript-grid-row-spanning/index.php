<?php
$pageTitle = "Row Spanning: Having cells span multiple rows inside the grid";
$pageDescription = "Cells can span multiple rows in ag-Grid, just like cell spanning inside Excel. Learn how to implement cell spanning inside ag-Grid.";
$pageKeyboards = "Javascript Grid Cell Spanning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="first-h1">Row Spanning</h1>

    <p class="lead">
        By default, each cell will take up the height of one row. You can change this behaviour
        to allow cells to span multiple rows. This feature is similar to 'cell merging' in Excel
        or 'row spanning' in HTML tables.
    </p>

    <h2>Configuring Row Spanning</h2>

    <p>
        To allow row spanning, the grid must have property <code>suppressRowTransform=true</code>.
        Then row spanning is set configured at the column definition level. To have a cell
        span more than one row, return how many rows to span in the callback
        <code>colDef.rowSpan</code>.
    </p>

    <snippet>
// turn off row translation
gridOptions.suppressRowTransform = true;

// row span is 2 for rows with russia, but 1 for everything else
colDef = {
    headerName: "Country",
    field: "country",
    rowSpan: function(params) {
        return params.data.country==='Russia' ? 2 : 1;
    }
    ...
};</snippet>

    <note>
        The property <code>suppressRowTransform=true</code> is used to stop the grid positioning rows
        using CSS Transform and instead the grid will use CSS Top.
        For an explanation of the difference between these two methods see the blog
        <a href="https://medium.com/ag-grid/javascript-gpu-animation-with-transform-and-translate-bf09c7000aa6">
            JavaScript GPU Animation with Transform and Translate
        </a>.
        The reason row span will not work with CSS transform is that CSS transform creates a
        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context">
            stacking context
        </a> which constrains CSS z-index from placing cells on top of other cells in another row.
        Having cells extend into other rows is necessary for row span which means it will not work
        when using CSS translate. The down side to not using transform is performance, row animation
        (after sort or filter) will be slower.
    </note>

    <p>
        The interface for the rowSpan callback is as follows:
    </p>

    <snippet>
// function you implement on the column definition
function rowSpan(params: rowSpanParams) =&gt; number;

interface RowSpanParams {
    node: any, // row node in question
    data: RowNode, // data for the row
    colDef: ColDef, // the col def for the column
    column: Column, // the column object in question
    api: GridApi, // the grid's API
    columnApi: ColumnApi, // the grids column API
    context: any // the provided context
}</snippet>

    <h2>Row Spanning Simple Example</h2>

    <p>
        Below shows a simple example using row spanning. The example doesn't make much sense,
        it just arbitrarily sets row span on some cells for demonstrations purposes.
    </p>

    <ul class="content">
        <li>
            The athlete column is configured to span 2 rows for 'Aleksey Nemov' and 3 rows
            for 'Ryan Lochte'.
        </li>
        <li>
            The athlete column is configured to apply a CSS class to give background to
            the cell. This is important as if background was not given, the cell background
            would be transparent and the underlying cell would still be visible.
        </li>
    </ul>

    <?= example('Row Spanning Simple', 'row-spanning-simple', 'generated') ?>

    <h2>Row Spanning Complex Example</h2>

    <p>
        Row spanning will typically be used for creating reports with ag-Grid. Below
        is something that would be more typical of the row spanning feature. The following
        can be noted from the example:
    </p>

    <ul class="content">
        <li>Column <b>Show</b> row spans by 4 rows when it has content.</li>
        <li>Column <b>Show</b> uses CSS class rules to specify background and border.</li>
        <li>Column <b>Show</b> has a custom cell renderer to make use of the extra space.</li>
    </ul>

    <?= example('Row Spanning Complex', 'row-spanning-complex', 'generated') ?>

    <h2>Constraints with Row Spanning</h2>

    <ul>
        <li>
            Responsibility is with user to not span past the last row. Will give strange
            results when sorting or filtering.
        </li>
        <li>
            Responsibility is with application to apply background style to spanning cells
            so that cells overwritten cannot be seen.
        </li>
        <li>
            Overwritten cells will still exist, but will not be visible. This means cell navigation
            will go to the other cells - eg if a row spanned cell has focus, and the user hits
            'arrow down' key, the focus will go to a hidden cell.
        </li>
        <li>
            Row span does not work with dynamic row height or auto-height. The row span assumes default row height
            is used when calculating how high the cell should be.
        </li>
        <li>
            Sorting and filtering will provide strange results when row spanning. For example
            a cell may span 4 rows, however applying a filter or a sort will probably change
            the requirements of what rows should be spanned.
        </li>
    </ul>

<?php include '../documentation-main/documentation_footer.php';?>
