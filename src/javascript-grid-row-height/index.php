<?php
$pageTitle = "Row Height: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Row Height. Rows can have different Row Height. You can even change the row height dynamically at run time. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid ag grid javascript Row Height";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Row Height</h1>

    <p>
        By default, the grid will display rows at <code>25px</code>. You can change this for each row individually to give
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

    <h2><code>rowHeight</code> Property</h2>

    <p>
        To change the row height for the whole grid, set the property <code>rowHeight</code> to a positive number.
        For example, to set the height to 50px, do the following:
    </p>

    <snippet>
gridOptions.rowHeight = 50;</snippet>

    <p>
        Changing the property will set a new row height for all rows, including pinned rows top and bottom.
    </p>

    <h2><code>getRowHeight</code> Callback</h2>

    <p>
        To change the row height so that each row can have a different height,
        implement the <code>getRowHeight()</code> callback. For example, to set the height
        to 50px for all non-pinned rows and 25px for pinned rows, do the following:
    </p>

    <snippet>
gridOptions.getRowHeight = function(params) {
    if (params.node.floating) {
        return 25;
    } else {
        return 50;
    }
}</snippet>

    <p>
        The params object passed to the callback has the following values:
    </p>

    <ul class="content">
        <li><b>node:</b> The <a href="../javascript-grid-model/#rowNode">rowNode</a> in question.</li>
        <li><b>data:</b> The data for the row.</li>
        <li><b>api:</b> The <a href="../javascript-grid-api/">grid api</a>.</li>
        <li><b>context:</b> The <a href="../javascript-grid-context/">grid context</a>.</li>
    </ul>

    <p>
        The example below hows dynamic row height, specifying a different row height for each row.
        It uses the <code>getRowHeight()</code> callback to achieve this.
    </p>

    <?= example('Row Height Simple', 'row-height-simple', 'generated') ?>

    <h2>Row Height More Complex Example</h2>

    <p>
        Below shows a more complex example, where the row height is changed based on contents of
        the 'Latin Text' column. The column definition has CSS style so that the cell does not have
        its contents clipped. The algorithm used to work out how tall the row should be is far
        from perfect, however it demonstrates that you can change your row height based on
        the contents of the cell.
    </p>

    <?= example('Row Height Complex', 'row-height-complex', 'generated') ?>

    <h2>Auto Row Height</h2>

    <p>
        It is possible to set the row height based on the contents of the cells.
        To do this, set <code>autoHeight=true</code> on each column where
        height should be calculated from. For example, if one column is showing
        description text over multiple lines, then you may choose to select only
        that column to determine the line height.
    </p>

    <p>
        If multiple columns are marked with <code>autoHeight=true</code> then the
        the height of the largest column is used.
    </p>

    <p>
        The height is calculated once when the data is first given to the grid.
        If the data changes, or the width of a column changes, then you may require the
        grid to calculate the height again by calling <code>api.resetRowHeights()</code>.
    </p>

    <p>
        The example below shows auto height in actions. The following can be noted:
        <ul>
            <li>
                Columns Auto A, Auto B and Auto C have <code>autoHeight=true</code>,
                so the height of each row is such that it fits all contents form these
                three columns.
            </li>
            <li>All columns with auto-size have CSS <code>white-space: normal</code> to wrap the text.</li>
            <li>
                When a column is resized, the grid re-calculated the row heights after
                the resize is finished.
            </li>
        </ul>
    </p>

    <?= example('Auto Row Height', 'auto-row-height', 'generated') ?>

    <p>
        Auto height works by the grid creating an off-screen temporary row with all the
        auto height columns rendered into it. The grid then measures the height of the
        temporary row. Because DOM interaction is required for each row this can be an
        intensive process. For this reason be careful of the following:
        <ul>
            <li>
                Only apply auto height to columns where it makes sense. For example if you have
                many columns that do not require a variable height, then do not set them to auto-height.
            </li>
            <li>
                Do not recalculate auto height to often. In the example above the code checks
                the columns resize event <code>event.finished</code> so that the height is only calculated
                when the resize is complete, rather than re-calculating the height continually
                during the column resizing.
            </li>
            <li>
                For large data grids (eg 10,000+ rows) the time taken to calculate the heights
                may take to long and you may decide not to use the feature in these circumstances.
                The row limit depends on your browser choice, computer speed and data so you will
                need to decide for yourself how much data is to much for this feature.
            </li>
        </ul>
    </p>

    <h2>Changing Row Height</h2>

    <p>
        Setting the row height is done once for each row. Once set, the grid will not ask you
        for the row height again. You can change the row height after it is initially set
        using a combination of <code>api.resetRowHeights()</code>, <code>rowNode.setRowHeight()</code> and
        <code>api.onRowHeightChanged()</code>.
    </p>

    <h3><code>api.resetRowHeights()</code></h3>
    <p>
        Call this API to have the grid clear all the row
        heights and work them all out again from scratch - if you provide a <code>getRowHeight()</code>
        callback, it will be called again for each row. The grid will then resize and
        reposition all rows again. This is the shotgun approach.
    </p>

    <h3><code>rowNode.setRowHeight(height)</code> and <code>api.onRowHeightChanged()</code></h3>

    <p>
        You can call <code>rowNode.setRowHeight(height)</code> directly
        on the rowNode to set its height. The grid will resize the row but will NOT
        reposition the rows (ie if you make a row shorter, a space will appear between
        it and the next row, the next rows will not be moved up). When you have set the
        row height (potentially on many rows) you need to call <code>api.onRowHeightChanged()</code>
        to tell the grid to reposition the rows. It is intended that you can call
        <code>rowNode.setRowHeight(height)</code> many times and then call <code>api.onRowHeightChanged()</code>
        once at the end.
    </p>

    <p>
        When calling <code>rowNode.setRowHeight(height)</code>, you can either pass in a new height
        or null or undefined. If you pass a height, that height will be used for the row.
        If you pass in null or undefined, the grid will then calculate the row height in the
        usual way, either use the provided <code>rowHeight</code> property or <code>getRowHeight()</code>
        callback.
    </p>

    <h3 id="example-changing-row-height">Example Changing Row Height</h3>

    <p>The example below changes the row height in the different ways described above.</p>

    <ul class="content">
        <li><b>Top Level Groups:</b> The row height for the groups is changed by calling api.resetRowHeights().
        This gets the grid to call <code>api.getRowHeight()</code> again for each row.</li>
        <li><b>Swimming Leaf Rows:</b> Same technique is used here as above above. You will need to expand
        a group with swimming (eg America) and the grid works out all row heights again.</li>
        <li><b>Zimbabwe Leaf Rows:</b> The row height is set directly on the rowNode. Then the grid
        is told to reposition all rows again via calling api.onRowHeightChanged().</li>
    </ul>

    <p>Note that this example uses ag-Grid Enterprise as it uses grouping. Setting the row
    height is an ag-Grid free feature, we just demonstrate it against groups and normal
    rows below.</p>

    <?= example('Changing Row Height', 'row-height-change', 'generated', array("enterprise" => 1)) ?>

    <h2>Height for Pinned Rows</h2>

    <p>
        Row height for pinned rows works exactly as per normal rows with one difference - it
        is not possible to dynamically change the height once set. However this is easily got around
        by just setting the pinned row data again which resets the row heights. Setting the
        data again is not a problem for pinned rows as it doesn't impact scroll position, filtering,
        sorting or group open / closed positions as it would with normal rows if the data was reset.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>
