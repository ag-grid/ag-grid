<?php
$pageTitle = "Row Spanning: Having cells span multiple rows inside the grid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. Cells can span multiple rows in ag-Grid, just like cell spanning inside Excel. Learn how to implement cell spanning inside ag-Grid.";
$pageKeywords = "Javascript Grid Cell Spanning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Row Spanning</h1>

<p class="lead">
    By default, each cell will take up the height of one row. You can change this behaviour
    to allow cells to span multiple rows. This feature is similar to 'cell merging' in Excel
    or 'row spanning' in HTML tables.
</p>

<h2>Configuring Row Spanning</h2>

<p>
    To allow row spanning, the grid must have property <code>suppressRowTransform=true</code>.
    Row spanning is then configured at the column definition level. To have a cell
    span more than one row, return how many rows to span in the callback
    <code>colDef.rowSpan</code>.
</p>

<?= createSnippet(<<<SNIPPET
// turn off row translation
gridOptions.suppressRowTransform = true;

// row span is 2 for rows with Russia, but 1 for everything else
colDef = {
    headerName: 'Country',
    field: 'country',
    rowSpan: function(params) {
        return params.data.country === 'Russia' ? 2 : 1;
    }
    ...
};
SNIPPET
) ?>

<note>
    The property <code>suppressRowTransform=true</code> is used to stop the grid positioning rows using CSS
    <code>transform</code> and instead the grid will use CSS <code>top</code>.
    For an explanation of the difference between these two methods see the article
    <a href="https://medium.com/ag-grid/javascript-gpu-animation-with-transform-and-translate-bf09c7000aa6">JavaScript GPU Animation with Transform and Translate</a>.
    The reason row span will not work with CSS <code>transform</code> is that CSS <code>transform</code> creates a
    <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context">stacking context</a>
    which constrains CSS <code>z-index</code> from placing cells on top of other cells in another row.
    Having cells extend into other rows is necessary for row span which means it will not work
    when using CSS <code>transform</code>. The downside to not using <code>transform</code> is performance; row animation
    (after sort or filter) will be slower.
</note>

<p>
    The interface for the <code>rowSpan</code> callback is as follows:
</p>

<?= createSnippet(<<<SNIPPET
// function you implement on the column definition
function rowSpan(params: rowSpanParams) => number;

interface RowSpanParams {
    node: any, // row node in question
    data: RowNode, // data for the row
    colDef: ColDef, // the col def for the column
    column: Column, // the column object in question
    api: GridApi, // the grid's API
    columnApi: ColumnApi, // the grid's column API
    context: any // the provided context
}
SNIPPET
, 'ts') ?>

<h2>Row Spanning Simple Example</h2>

<p>
    Below shows a simple example using row spanning. The example doesn't make much sense,
    it just arbitrarily sets row span on some cells for demonstration purposes.
</p>

<ul class="content">
    <li>
        The Athlete column is configured to span 2 rows for 'Aleksey Nemov' and 4 rows
        for 'Ryan Lochte'.
    </li>
    <li>
        The Athlete column is configured to apply a CSS class to give a background to
        the cell. This is important as if background was not given, the cell background
        would be transparent and the underlying cell would still be visible.
    </li>
</ul>

<?= grid_example('Row Spanning Simple', 'row-spanning-simple', 'generated', ['exampleHeight' => 580, 'modules' => true]) ?>

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

<?= grid_example('Row Spanning Complex', 'row-spanning-complex', 'generated', ['exampleHeight' => 580, 'modules' => true]) ?>

<h2>Constraints with Row Spanning</h2>

<p>
    Row Spanning breaks out of the row / cell calculations that a lot of features in the grid are based on.
    If using Row Spanning, be aware of the following:
</p>

<ul>
    <li>
        Responsibility is with the developer to not span past the last row. This is especially true if
        sorting and filtering (e.g. a cell may span outside the grid after the data is sorted and the cell's
        row ends up at the bottom of the grid).
    </li>
    <li>
        Responsibility is with the developer to apply a background style to spanning cells
        so that overwritten cells cannot be seen.
    </li>
    <li>
        Overwritten cells will still exist, but will not be visible. This means cell navigation
        will go to the other cells - e.g. if a row spanned cell has focus, and the user hits the
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
    <li>
        <a href="../javascript-grid-range-selection/">Range Selection</a> will not work correctly when spanning
        cells. This is because it is not possible to cover all scenarios, as a range is no longer
        a perfect rectangle.
    </li>
</ul>

<?php include '../documentation-main/documentation_footer.php';?>
