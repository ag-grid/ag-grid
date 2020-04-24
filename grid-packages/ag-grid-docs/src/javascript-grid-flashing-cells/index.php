<?php
$pageTitle = "Updating Data: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Updating Data. Data can be updated in real time. The grid can highlight the change by flashing the cells or by animation inside the cell as the cell refreshes. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Flashing Cells</h1>

    <p class="lead">
        The grid can flash cells to highlight data changes. This is a great visual indicator
        to users of the grid who want data changes to be noticed.
    </p>

    <p>
        To enable cell flashing on data changes for a particular column, set the attribute
        <code>enableCellChangeFlash=true</code> on the column definition.
    </p>

    <p>
        You can also explicitly flash cells using the grid API <code>flashCells(params)</code>.
        The params takes a list of columns and rows to flash, e.g. to flash one cell pass in
        one column and one row that identifies that cell.
    </p>

    <p>
        The example below demonstrates cell flashing. The following can be noted:
    </p>
    <ul>
        <li>
            All columns have <code>enableCellChangeFlash=true</code> so changes to the columns
            values will flash.
        </li>
        <li>
            Clicking <b>Update Some Data</b> will update a bunch of data. The grid will then
            flash the cells where data has changed.
        </li>
        <li>
            Clicking <b>Flash One Cell</b> provides the API <code>flashCells()</code>
            with one column and one row to flash one cell.
        </li>
        <li>
            Clicking <b>Flash Two Rows</b> provides the API <code>flashCells()</code>
            with two row nodes only to flash the two rows.
        </li>
        <li>
            Clicking <b>Flash Two Columns</b> provides the API <code>flashCells()</code>
            with two columns only to flash the two columns.
        </li>
    </ul>

    <?= grid_example('Flashing Data Changes', 'flashing-data-changes', 'generated', ['enterprise' => true]) ?>

    <h2>How Flashing Works</h2>

    <p>
        Each time the call value is changed, the grid adds the CSS class <code>ag-cell-data-changed</code>
        for 500ms, and then then CSS class <code>ag-cell-data-changed-animation</code> for 1,000ms.
        The grid provided themes use this to apply a background color (for the first 500ms) and then a fade
        out transition (for the remaining 1,000ms).
    </p>

    <p>
        If you want to override how the flash presents itself (eg change the background color, or remove
        the animation) then override the relevant CSS classes.
    </p>

    <h2>Filtering & Aggregations</h2>

    <p>
        One exception to the above is changes due to filtering. If you are
        <a href="../javascript-grid-grouping/">Row Grouping</a> the data with
        <a href="../javascript-grid-aggregation/">Aggregations</a>, then the aggregated values will change as filtering
        adds and removes rows contained within the groups. It typically doesn't make sense to flash these changes
        when it's due to a filter change, as filtering would impact many (possibly all) cells at once, thus not
        usefully bringing the users attention to any particular cell. If you do not like this exception and would
        like to flash changes even when it's the result of a filter change, then set
        grid property <code>allowShowChangeAfterFilter=true</code>.
    </p>

    <h2>Flashing Cells vs Custom Cell Renderers</h2>

    <p>
        Flashing cells is a simple and quick way to visually show to the user that the data has changed.
        It is also possible to have more intelligent animations by putting animations into custom
        <a href="../javascript-grid-cell-rendering-components/">Cell Renderers</a>. Cell Renderers have
        a <code>refresh</code> method that gets called when data changes, allowing custom animations
        to highlight data changes.
    </p>
    <p>
        The grid comes with two such Cell Renderers for showing data changes which are detailed in
        the <a href="../javascript-grid-provided-renderer-change/">Change Cell Renderers</a>
        section.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>
