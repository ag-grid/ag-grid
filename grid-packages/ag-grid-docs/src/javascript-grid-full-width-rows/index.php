<?php
$pageTitle = "Full Width Rows: Styling & Appearance Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Full Width Rows. Full Width Rows allow you to have one cell that spans the entire width of the tables. This allows a card layout to work alongside the normal cells. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "JavaScript Grid Full Width";
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

<note>
    You may be wondering what full width rows are useful for. Their usage is very
    rare and most applications will not use them. If you cannot think of a use case for it,
    then don't worry, do not use it. Full width rows were initially introduced into ag-Grid
    to support <a href="../javascript-grid-master-detail">Master / Detail</a> before the grid
    provided direct support for master / detail. Now that master / detail is directly
    supported, the usefulness of full width is reduced.
</note>

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

<?= grid_example('Simple Full Width', 'simple-full-width', 'generated', ['exampleHeight' => 580, 'modules' => true]) ?>

<h2>Understanding Full Width</h2>

<p>
    A <code>fullWidth</code> (full width) component takes up the entire width of the grid. A full width component:
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
        as <code>fullWidth</code>.</li>
    <li>Provide a <code>fullWidthCellRenderer</code>, to tell the grid what <code>cellRenderer</code> to use when doing
        <code>fullWidth</code> rendering.</li>
</ol>

<p>
    The cell renderer can be any ag-Grid cell renderer. Refer to
    <a href="../javascript-grid-cell-rendering-components/">Cell Rendering</a> on how to build cell renderers.
    The cell renderer for <code>fullWidth</code> has one difference to normal cell renderers: the parameters passed
    are missing the value and column information as the <code>cellRenderer</code>, by definition, is not tied to a particular
    column. Instead you should work off the data parameter, which represents the value for the entire row.
</p>

<p>
    The <code>isFullWidthCell(rowNode)</code> callback takes a <code>rowNode</code> as input and should return a boolean
    <code>true</code> (use <code>fullWidth</code>) or <code>false</code> (do not use <code>fullWidth</code> and render as normal).
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
        pinned top, pinned bottom and body rows.
    </li>
    <li>
        Full width rows can be of any height, which is specified in the usual way using the <code>getRowHeight()</code>
        callback. The example sets body <code>fullWidth</code> rows to 55px.
    </li>
    <li>
        The pinned full width rows are not impacted by either the vertical or horizontal scrolling.
    </li>
    <li>The body full width rows are impacted by vertical scrolling only, and not the horizontal scrolling.</li>
    <li>The full width rows span the entire grid, including the pinned left and pinned right sections.</li>
    <li>The full width rows are the width of the grid, despite the grid requiring horizontal scrolling to show the cells.</li>
    <li>The example is showing a flat list of data. There is no grouping or parent / child relationships between
        the full width and normal rows.</li>
</ul>

<?= grid_example('Basic Full Width', 'basic-full-width', 'generated', ['exampleHeight' => 595, 'modules' => true]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
