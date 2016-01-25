<?php
$key = "Row Height";
$pageTitle = "ag-Grid Row Height";
$pageDescription = "Learn how configure ag-Grid so it can have variable or fixed row height.";
$pageKeyboards = "ag-Grid ag grid javascript Row Height";
include '../documentation_header.php';
?>

<div>

    <h2>Row Height</h2>

    <p>
        By default, the grid will display rows at 25px.
    </p>

    <h3>rowHeight Property</h3>

    <p>
        To change the row height for the whole grid, set the property <i>rowHeight</i> to a positive number.
        For example, to set the height to 50px, do the following:
    </p>

    <pre><code></code>gridOptions.rowHeight = 50;</code></pre>

    <p>
        Changing the property will set a new row height for all rows, including floating rows top and bottom.
    </p>

    <h3>getRowHeight Callback</h3>

    <p>
        To change the row height so that each row can have a different height,
        implement the <i>getRowHeight()</i> callback. For example, to set the height
        to 50px for all non-floating rows and 25px for floating rows, do the following:
    </p>

    <p>
        The params object passed to the callback has the following values:
        <ul>
        <li><b>node:</b> The <a href="/angular-grid-model/index.php#rowNode">rowNode</a> in question.</li>
        <li><b>data:</b> The data for the row provided by you.</li>
        <li><b>api:</b> The <a href="/angular-grid-api/index.php">grid api</a>.</li>
        <li><b>context:</b> The <a href="/angular-grid-context/index.php">grid context</a>.</li>
    </ul>
    </p>

    <h3></h3>

    <pre><code></code>gridOptions.getRowHeight = function(params) {
    if (params.node.floating) {
        return 25;
    } else {
        return 50;
    }
}</code></pre>

    <h3>Row Height Simple Example</h3>

    <p>
        The example below hows dynamic row height, specifying a different row height for each row.
        It uses the <i>getRowHeight()</i> callback to achieve this.
    </p>

    <show-example example="exampleRowHeight"></show-example>

    <h3>Row Height More Complex Example</h3>

    <p>
        Below shows a more complex example, where the row height is changed based on contents of
        the 'Latin Text' column. The column definition has CSS style so that the cell does not have
        it's contents clipped. The algorithm used to work out how tall the row should be is far
        from perfect, however it demonstrates that you can change your row height based on
        the contents of the cell.
    </p>

    <show-example example="exampleRowHeightComplex"></show-example>

    <note>
        You cannot change the rowHeight of a cell. Once it is set, it cannot be undone.
        If you must change the row height, then pass the data into the grid again to
        get the grid to reset the heights, eg <i>api.setRowData(sameData)</i>.
    </note>
</div>

<?php include '../documentation_footer.php';?>
