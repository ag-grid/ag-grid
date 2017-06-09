<?php
$key = "Row Height";
$pageTitle = "ag-Grid Row Height";
$pageDescription = "Learn how configure ag-Grid so it can have variable or fixed row height.";
$pageKeyboards = "ag-Grid ag grid javascript Row Height";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="row-height">Row Height</h2>

    <p>
        By default, the grid will display rows at 25px. You can change this for each row individually to give
        each row a different height.
    </p>

    <note>
        Changing the row height is only supported in the <a href="../javascript-grid-in-memory/">in memory</a>
        row model. You cannot use variable row height when using
        <a href="../javascript-grid-virtual-paging/">virtual paging</a>,
        <a href="../javascript-grid-viewport/">viewport</a> or
        <a href="../javascript-grid-enterprise-model/">enterprise</a> row models.
        This is because these row models need to work out the position of rows that are not loaded and hence need to
        assume the row height is fixed.
    </note>

    <h3 id="row-height-property">rowHeight Property</h3>

    <p>
        To change the row height for the whole grid, set the property <i>rowHeight</i> to a positive number.
        For example, to set the height to 50px, do the following:
    </p>

    <pre><code></code>gridOptions.rowHeight = 50;</code></pre>

    <p>
        Changing the property will set a new row height for all rows, including floating rows top and bottom.
    </p>

    <h3 id="get-row-height-callback">getRowHeight Callback</h3>

    <p>
        To change the row height so that each row can have a different height,
        implement the <i>getRowHeight()</i> callback. For example, to set the height
        to 50px for all non-floating rows and 25px for floating rows, do the following:
    </p>

    <pre><code></code>gridOptions.getRowHeight = function(params) {
    if (params.node.floating) {
        return 25;
    } else {
        return 50;
    }
}</code></pre>

    <p>
        The params object passed to the callback has the following values:
    <ul>
        <li><b>node:</b> The <a href="../javascript-grid-model/#rowNode">rowNode</a> in question.</li>
        <li><b>data:</b> The data for the row.</li>
        <li><b>api:</b> The <a href="../javascript-grid-api/">grid api</a>.</li>
        <li><b>context:</b> The <a href="../javascript-grid-context/">grid context</a>.</li>
    </ul>
    </p>

    <h3 id="row-height-simple-example">Row Height Simple Example</h3>

    <p>
        The example below hows dynamic row height, specifying a different row height for each row.
        It uses the <i>getRowHeight()</i> callback to achieve this.
    </p>

    <show-example example="exampleRowHeight"></show-example>

    <h3 id="row-height-more-complex-example">Row Height More Complex Example</h3>

    <p>
        Below shows a more complex example, where the row height is changed based on contents of
        the 'Latin Text' column. The column definition has CSS style so that the cell does not have
        it's contents clipped. The algorithm used to work out how tall the row should be is far
        from perfect, however it demonstrates that you can change your row height based on
        the contents of the cell.
    </p>

    <show-example example="exampleRowHeightComplex"></show-example>

    <h3 id="changingRowHeight">Changing Row Height</h3>

    <p>
        Setting the row height is done once for each row. Once set, the grid will not ask you
        for the row height again. You can change the row height after it is initially set
        using a combination of <i>api.resetRowHeights()</i>, <i>rowNode.setRowHeight()</i> and
        <i>api.onRowHeightChanged()</i>.
    </p>

    <h4 id="api-reset-row-heights">api.resetRowHeights()</h4>
    <p>
        Call this API to have the grid clear all the row
        heights and work them all out again from scratch - if you provide a <i>getRowHeight()</i>
        callback, it will be called again for each row. The grid will then resize and
        reposition all rows again. This is the shotgun approach.
    </p>

    <h4 id="row-node-set-row-height">rowNode.setRowHeight(height) and api.onRowHeightChanged()</h4>

    <p>
        You can call <i>rowNode.setRowHeight(height)</i> directly
        on the rowNode to set it's height. The grid will resize the row but will NOT
        reposition the rows (ie if you make a row shorter, a space will appear between
        it and the next row, the next rows will not be moved up). When you have set the
        row height (potentially on many rows) you need to call <i>api.onRowHeightChanged()</i>
        to tell the grid to reposition the rows. It is intended that you can call
        <i>rowNode.setRowHeight(height)</i> many times and then call <i>api.onRowHeightChanged()</i>
        once at the end.
    </p>

    <p>
        When calling <i>rowNode.setRowHeight(height)</i>, you can either pass in a new height
        or null or undefined. If you pass a height, that height will be used for the row.
        If you pass in null or undefined, the grid will then calculate the row height in the
        usual way, either use the provided <i>rowHeight</i> property or <i>getRowHeight()</i>
        callback.
    </p>

    <h3 id="example-changing-row-height">Example Changing Row Height</h3>

    <p>The example below changes the row height in the different ways described above.</p>

    <ul>
        <li><b>Top Level Groups:</b> The row height for the groups is changed by calling api.resetRowHeights().
        This gets the grid to call <i>api.getRowHeight()</i> again for each row.</li>
        <li><b>Swimming Leaf Rows:</b> Same technique is used here as above above. You will need to expand
        a group with swimming (eg America) and the grid works out all row heights again.</li>
        <li><b>Zimbabwe Leaf Rows:</b> The row height is set directly on the rowNode. Then the grid
        is told to reposition all rows again via calling api.onRowHeightChanged().</li>
    </ul>

    <p>Note that this example uses ag-Grid Enterprise as it uses grouping. Setting the row
    height is an ag-Grid free feature, we just demonstrate it against groups and normal
    rows below.</p>

    <show-example example="exampleRowHeightChange"></show-example>

    <h3 id="height-for-floating-rows">Height for Floating Rows</h3>

    <p>
        Row height for floating rows works exactly as per normal rows with one difference - it
        is not possible to dynamically change the height once set. However this is easily got around
        by just setting the floating row data again which resets the row heights. Setting the
        data again is not a problem for floating rows as it doesn't impact scroll position, filtering,
        sorting or group open / closed positions as it would with normal rows if the data was reset.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
