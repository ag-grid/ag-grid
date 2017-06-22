<?php
$key = "Full Width Rows";
$pageTitle = "ag-Grid Full Width Rows";
$pageDescription = "You can have rows span the full widht of the grid, hence now using the columsn to generate cells..";
$pageKeyboards = "JavaScript Grid Full Width";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h2 id="full-width-rows-master-detail-grids">Full Width Rows</h2>

<p>
    Under normal operation, ag-Grid will render each row as a horizontal list of cells. Each cell in the row
    will correspond to one column definition. It is possible to switch this off and allow you to provide
    one component to span the entire width of the grid. This is useful if you want to embed a complex component
    inside the grid instead of rendering a list of cells. This technique can be used for displaying panels
    of information, including forms and embedding other grids. The pattern of having grids inside grids
    is sometimes referred to as Master Detail grids.
</p>

<h3 id="understanding-full-width">
    Understanding Full Width
</h3>

<p>
    A fullWidth (full width) component takes up the entire width of the grid. A fullWidth component:
<ul>
    <li>is not impacted by horizontal scrolling.</li>
    <li>is the width of the grid, regardless of what columns are present.</li>
    <li>is not impacted by pinned sections of the grid, will span left and right pinned areas regardless.</li>
    <li>does not participate in the navigation, rangeSelection (ag-Grid Enterprise) or contextMenu (ag-Grid Enterprise)
        of the main grid.</li>
</ul>
</p>

<p>
    To use fullWidth, you must:
<ol>
    <li>Implement the <code>isFullWidthCell(rowNode)</code> callback, to tell the grid which rows should be treated
        as fullWidth.</li>
    <li>Provide a <code>fullWidthCellRenderer</code>, to tell the grid what cellRenderer to use when doing
        fullWidth rendering.</li>
</ol>
</p>

<p>
    The <i>cellRenderer</i> can be any ag-Grid cellRenderer. Refer to <a href="../javascript-grid-cell-rendering-components/">
        Cell Rendering</a> on how to build cellRenderers. The cellRenderer for fullWidth has
    one difference to normal cellRenderers, that is the parameters passed are missing the value and column information
    as the cellRenderer, by definition, is not tied to a particular column. Instead you should work off the data
    parameter, which represents the value for the entire row.
</p>

<p>
    The <i>isFullWidthCell(rowNode)</i> callback takes a rowNode as input and should return a boolean true
    (use fullWidth) or false (do not use fullWidth and render as normal).
</p>

<h3 id="sorting-filtering">Sorting and Filtering</h3>

<p>
    Sorting and Filtering are NOT impacted by fullWidth. fullWidth is a rendering time feature. The sorting
    and filtering applied to the data is done before rendering and is not impacted.
</p>

<h3 id="basic-fullwidth-example">Basic fullWidth Example</h3>

<p>
    Below shows a basic fullWidth example. The example's data is minimalistic to focus on how
    the fullWidth feature is configured. For demonstration, the floating rows are shaded blue (with
    fullWidth a darker shade of blue) and body fullWidth rows are green.
    The following points should be noted:
<ul>
    <li>
        fullWidth can be applied to any row, including floating rows. The example demonstrates fullWidth in
        floating top, floating bottom and body rows.
    </li>
    <li>
        fullWidth rows can be of any height, which is specified in the usual way using the <code>getRowHeight()</code>
        callback. The example sets body fullWidth rows to 55px.
    </li>
    <li>
        The floating fullWidth rows are not impacted by either the vertical or horizontal scrolling.
    </li>
    <li>The body fullWidth rows are impacted by vertical scrolling only, and not the horizontal scrolling.</li>
    <li>The fullWidth rows span the entire grid, including the pinned left and pinned right sections.</li>
    <li>The fullWidth rows are the width of the grid, despite the grid requiring horizontal scrolling to show the cells.</li>
    <li>The example is showing a flat list of data, there is no grouping or parent / child relationships between
        the fullWidth and normal rows.</li>
</ul>
</p>

<show-example example="exampleFullWidth"></show-example>

<h3 id="parent-child-relationships">Parent / Child Relationships</h3>

<p>
    ag-Grid's fullWidth concept is not related to the grids expand / collapse feature, however it often makes
    sense to use the fullWidth with parent / child relationships. You will probably want to use fullWidth either
    with <a href="../javascript-grid-grouping/">Row Grouping</a>, <a href="../javascript-grid-tree/">Tree Data</a>
    or Flower Nodes (explained below). It is up to you to decide what the child data is that gets passed to your
    cellRenderer as the row data item.
</p>

<note>
    Some other JavaScript grids cater directly for Master / Detail grids. This is not the pattern of ag-Grid. ag-Grid
    allows you to embed another ag-Grid if you want, but does not constrain you to this. You can embed whatever
    you like, even another vendors data grid. This control makes ag-Grid's fullWidth feature more powerful
    than grids that cater for master / detail directly.
</note>

<h3 id="flowerNodes">Expand Groups</h3>

<p>
    To have the functionality to expand a group (ie have plus (+) and minus (-) icons, you need to configure the
    group cellRenderer on one of the column definitions. This is done as follows:
<pre>colDef.cellRenderer = 'group'</pre>
</p>

<h3 id="flowerNodes">Flower Nodes</h3>

<p>
    You can mark a row as a 'can flower' node to tell the grid the row can be expanded even though it is not
    a group (ie it has no children). This is useful if you have data that either a) has no grouping
    in it but you still want to expand rows to show a master / detail panel or b) the data is already
    grouped by another mechanism eg by using the grids internal grouping feature.
</p>

<p>
    To tell the grid that a row 'can flower' (ie should be expandable) then implement the
    <code>doesDataFlower(dataItem)</code> callback.
</p>
<pre>gridOptions.doesDataFlower = function(dataItem) {
    var canFlower = dataItem.checkSomeFlagThatYouSetOnTheData;
    return canFlower;
}</pre>

<p>
    <i>doesDataFlower</i> gets called exactly once for each data item you provide to the grid. It does not
    get called for groups when using the grids built in grouping or pivoting features.
</p>

<p>
    A row that 'can flower' is expandable. The child row is called the 'flower row'.
    The 'flower row':
<ul>
    <li>will share the same data item as it's parent.</li>
    <li>does not participate in filtering - it will show if parent is shown.</li>
    <li>does not participate in sorting - it will always display below the parent.</li>
</ul>
</p>

<note>
    Flower nodes work with inMemory row model only. They do not work with virtual pagination or viewport.
</note>

<note>Why call them 'flowers'? Well the groupings are a tree structure. The tree structure contains
    leaf nodes, that is the bottom nodes of the tree. Leafs can then in turn have flowers.</note>

<h3 id="example-expanding-to-child-panels">Example - Expanding to Child Panels</h3>

<p>
    Below shows using ag-Grid to show more information about a country when you click 'expand' on a country name.
    The following should be noted from the example:
<ul><li><i>isFullWidthCell(rowNode)</i> callback is configured to use <i>fullWidth</i> on all child rows (that is,
        rowNode.level === 1).</li>
    <li><i>getRowHeight(params)</i> callback is configured to make each fullWidth panel 100px, ie bigger than
        the normal rows.</li>
    <li><i>doesDataFlower(dataItem)</i> is used to tell the grid which rows to expand. All rows are maked
        expandable except Venezuela</li>
    <li><i>fullWidthCellRenderer</i> is configured with a cellRenderer component.</li>
    <li>The <i>consumeMouseWheelOnCenterText</i> method stops mouseWheel events getting processed by the grid
        when the mouse is over the embedded text area. This stops both the text area AND the grid scrolling when
        the user uses the mouse wheel.</li>
</ul>
</p>

<note>
    ag-Grid is programmed to have mouse wheel events on the embedded fullWidth component scroll the main body.
    This is because the component is not part of the main body DOM, however it appears to be as far as the user
    is concerned, so the user would expect the wheel to scroll the main body. If this is not the case, and
    you want the wheel to to something inside your component (such as scroll the text area in the example), then
    you need to stop the mouse wheel events from bubbling up to the grid (as done in the example for the text area).
</note>

<show-example example="exampleFullWidthComponent"></show-example>

<h3 id="embeddedFullWidth">Embedded Full Width vs Normal Full Width</h3>

<p>
    The grid uses a trick of placing the fullWidth rows in another div, outside of the main rows and cells.
    This is what allows the fullWidth rows to span across the pinned areas. One downside of this approach
    is speed in slower browsers (eg Internet Explorer) where vertical scrolling results in a lag, where
    the fullWidth rows scroll after the main rows scroll.
</p>

<p>
    If you want to embed the fullWith rows with the rest of the rows, and not be impacted by the scrolling
    performance issue, then set <code>embedFullWidthRows=true</code>. The example below demonstrates as follows:
</p>

<ul>
    <li>The fullWidth rows are embedded with the main rows.</li>
    <li>Each fullWidth row is split into the pinned areas.</li>
    <li>Each fullWidth row horizontally scrolls with the main grid.</li>
</ul>

<show-example example="exampleFullWidthEmbedded"></show-example>


<?php include '../documentation-main/documentation_footer.php';?>
