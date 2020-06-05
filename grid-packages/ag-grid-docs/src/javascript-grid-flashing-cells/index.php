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
        The params takes a list of columns and rows to flash, the flashDelay and the fadeDelay values
        e.g. to flash one cell pass in one column and one row that identifies that cell.
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
        for 500ms by default, and then then CSS class <code>ag-cell-data-changed-animation</code> for 1,000ms by default.
        The grid provided themes use this to apply a background color.
    </p>

    <p>
        If you want to override the flash background color, this has to be done by overriding the relevant CSS class. There are two ways
        to change how long a cell remains "flashed".
        <ol>
            <li>Change the <code>cellFlashDelay</code> and <code>cellFadeDelay</code> configs in the gridOptions</li>
            <li>When calling <code>flashCells()</code>, pass the <code>flashDelay</code> and <code>fadeDelay</code> values (in milliseconds) as params.
        </ol>
    </p>

    <p>
        The example below demonstrates flashing delay changes. The following can be noted:
    </p>

    <ul>
        <li>
            The <code>cellFlashDelay</code> value has been changed to 2000ms, so cells will remain in 
            their "flashed" state for 2 seconds.
        </li>
        <li>
            The <code>cellFadeDelay</code> value has been changed to 500ms, so the fading animation will
            happen faster than what it normally would (1 second).
        </li>
        <li>
            Clicking <b>Update Some Data</b> will update some data to demonstrate the changes mentioned above.
        </li>
        <li>
            Clicking <strong>Flash Two Rows</strong> will pass a custom <code>flashDelay</code> of 3000ms and a 
            custom <code>fadeDelay</code> delay of 2000ms to demonstrate default values can be overridden.
        </li>
    </ul>

    <?= grid_example('Changing Flashing Delay', 'flashing-delay-changes', 'generated', ['enterprise' => true]) ?>

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
