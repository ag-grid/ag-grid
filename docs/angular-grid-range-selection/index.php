<?php
$key = "Range Selection";
$pageTitle = "ag-Grid Range Selection";
$pageDescription = "Explains how to do range selection in ag-Grid.";
$pageKeyboards = "range selection javascript grid ag-grid";
include '../documentation_header.php';
?>

<div>

    <h2>Range Selection</h2>

    <p>
        <?php include '../enterprise.php';?>
        &nbsp;
        Range selection is available in ag-Grid Enterprise.
    </p>

    <p>
        Range selection allows Excel-like range selection of cells. Once enabled, you can drag the mouse over
        a set of cells to select a range of cells.
    </p>

    <h3>Selecting Multiple Ranges</h3>

    <p>
        To select multiple ranges, hold down ctrl while making the selection.
    </p>

    <h3>Ranges and Pinning</h3>

    <p>
        It is possible to select a range that spans pinned and non-pinned sections of the grid.
        If you do this, the selected range will not have any gaps with regards the column order.
        For example, if you start the drag on the left pinned area and drag to the right pinned
        area, then all of the columns in the center area will also be part of the range.
    </p>

    <h3>Range Change Event</h3>

    <p>
        There is one event rangeSelectionChanged to tell you the range selection has changed.
        The event has two properties, started and finished, which are true when the selection
        is starting or finishing.
        For example, if selecting a range of 10 cells in a row, the user will click the first
        cell and drag to the last cell. This will result in up to 11 events. The first event
        will have <i>started=true</i>, the last will have <i>finished=true</i>, and
        all the intermediary events will have both of these values as false.
    </p>

    <pre>api.addEventListener('rangeSelectionChanged', function(event) {
    // this prints true for first event only
    console.log('has changed, started = ' + event.started);
    // this prints true for last event only
    console.log('has changed, finished = ' + event.finished);
});</pre>

    <h3>Getting Selected Range</h3>

    <p>
        Get the selected ranges using <i>api.getRangeSelections()</i>. This will return back
        a list of range selection objects, each object contain the details of one range. The
        structure of the range selection is as follows:
        <pre>RangeSelection {
    rowStart: number, // the start row index of the selection
    rowEnd: number, // the end row index of the selection
    columnStart: Column, // the first column of the selection
    columnEnd: Column, // the last column of the selection
    columns: Column[] // all the columns in the selection
}</pre>
    </p>

    <p>
        The rowStart and columnStart will be the cell the use started the drag on. This means
        rowStart may not be numerically less than rowEnd, as the use may have dragged up, and likewise
        for the columns.
    </p>

    <p>
        Columns between columnStart and columnEnd may not be what you expect, as the grid may
        display the columns in a different order to what you provided the grid (the user could
        reorder), or columns may be not visible, or column groups may be closed. To avoid all
        ambiguity, the exact columns in the range are presented individually in the <i>columns</i>
        list and will be in the order they appear in the grid.
    </p>

    <h3>Range Selection Example</h3>

    <p>
        The example below demonstrates range selection. Use your mouse to drag over the cells
        to create selections. Hold down ctrl to select more than one range. The example listens
        for the <i>rangeSelectionChanged</i> event and creates a sum of all the number values
        that are in the range (it ignores all non-number values). The <i>finished</i> flag
        is used to update the eager and lazy figures separately.
    </p>

    <show-example example="rangeSelection"></show-example>

</div>

<?php include '../documentation_footer.php';?>
