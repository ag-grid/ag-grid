<?php
$pageTitle = "Full Width Rows: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Full Width Rows. Full Width Rows allow you to have one cell that spans the entire width of the tables. This allows a card layout to work alongside the normal cells. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "JavaScript Grid Full Width";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Full Width Rows</h1>

<p class="lead">
    Under normal operation, ag-Grid will render each row as a horizontal list of cells. Each cell in the row
    will correspond to one column definition. It is possible to switch this off and allow you to provide
    one component to span the entire width of the grid and not use columns. This is useful if you want to
    embed a complex component inside the grid instead of rendering a list of cells. This technique can be
    used for displaying panels of information.
</p>

<h2>Simple Example of Full Width Rows</h2>

<p>
    Below shows a simple example using full width. The following can be noted:
</p>
    <ul class="content">
        <li>
            The rows for countries France, Italy and Peru have full width components
            instead of cells.
        </li>
        <li>
            Sorting and filtering all work as if the data was displayed as normal.
        </li>
    </ul>

<?= example('Simple Full Width', 'simple-full-width', 'generated') ?>

<note>
    You may be wondering, what is full width rows useful for? It's usage is very
    rare and most applications will not use it. If you cannot think of a use case for it,
    then don't worry, do not use it. Full width rows were initially introduced into ag-Grid
    to support <a href="../javascript-grid-master-detail">Master / Detail</a> before the grid
    was giving direct support for master / detail. Now that master / detail is directly
    supported, the usefulness of full width is reduced.
</note>

<h2>
    Understanding Full Width
</h2>

<p>
    A fullWidth (full width) component takes up the entire width of the grid. A fullWidth component:
</p>

<ul class="content">
    <li>is not impacted by horizontal scrolling.</li>
    <li>is the width of the grid, regardless of what columns are present.</li>
    <li>is not impacted by pinned sections of the grid, will span left and right pinned areas regardless.</li>
    <li>does not participate in the navigation, rangeSelection (ag-Grid Enterprise) or contextMenu (ag-Grid Enterprise)
        of the main grid.</li>
</ul>

<p>
    To use <code>fullWidth</code>, you must:
</p>

<ol>
    <li>Implement the <code>isFullWidthCell(rowNode)</code> callback, to tell the grid which rows should be treated
        as fullWidth.</li>
    <li>Provide a <code>fullWidthCellRenderer</code>, to tell the grid what cellRenderer to use when doing
        fullWidth rendering.</li>
</ol>

<p>
    The cell renderer can be any ag-Grid cell renderer. Refer to
    <a href="../javascript-grid-cell-rendering-components/">Cell Rendering</a> on how to build cell renderers.
    The cell renderer for fullWidth has one difference to normal cell renderers, that is the parameters passed
    are missing the value and column information as the cellRenderer, by definition, is not tied to a particular
    column. Instead you should work off the data parameter, which represents the value for the entire row.
</p>

<p>
    The <code>isFullWidthCell(rowNode)</code> callback takes a rowNode as input and should return a boolean true
    (use fullWidth) or false (do not use fullWidth and render as normal).
</p>

<h2>Sorting and Filtering</h2>

<p>
    Sorting and Filtering are NOT impacted by full width. Full width is a rendering time feature. The sorting
    and filtering applied to the data is done before rendering and is not impacted.
</p>

<h2>Detailed Full Width Example</h2>

<p>
    Below shows a detailed full width example including pinned rows and columns.
    The example's data is minimalistic to focus on how
    the full width impacts rows. For demonstration, the pinned rows are shaded blue (with
    full width a darker shade of blue) and body full width rows are green.
    The following points should be noted:
</p>

<ul class="content">
    <li>
        Full width can be applied to any row, including pinned rows. The example demonstrates full width in
        floating top, floating bottom and body rows.
    </li>
    <li>
        Full width rows can be of any height, which is specified in the usual way using the <code>getRowHeight()</code>
        callback. The example sets body fullWidth rows to 55px.
    </li>
    <li>
        The floating full width rows are not impacted by either the vertical or horizontal scrolling.
    </li>
    <li>The body full width rows are impacted by vertical scrolling only, and not the horizontal scrolling.</li>
    <li>The full width rows span the entire grid, including the pinned left and pinned right sections.</li>
    <li>The full width rows are the width of the grid, despite the grid requiring horizontal scrolling to show the cells.</li>
    <li>The example is showing a flat list of data. There is no grouping or parent / child relationships between
        the full width and normal rows.</li>
</ul>

<?= example('Basic Full Width', 'basic-full-width', 'generated') ?>

<h2>Embedded Full Width vs Normal Full Width</h2>

<p>
    The grid uses a trick of placing the full width rows in another div, outside of the main rows and cells.
    This is what allows the full width rows to span across the pinned areas. One downside of this approach
    is speed in slower browsers (eg Internet Explorer) where vertical scrolling results in a lag, where
    the full width rows scroll after the main rows scroll.
</p>

<p>
    If you want to embed the full with rows with the rest of the rows, and not be impacted by the scrolling
    performance issue, then set <code>embedFullWidthRows=true</code>. The example below demonstrates as follows:
</p>

<ul class="content">
    <li>The full width rows are embedded with the main rows.</li>
    <li>Each full width row is split into the pinned areas.</li>
    <li>Each full width row horizontally scrolls with the main grid.</li>
</ul>

<?= example('Full Width Embedded', 'full-width-embedded', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php';?>
