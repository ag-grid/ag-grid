<?php
$key = "Range Selection";
$pageTitle = "ag-Grid Range Selection";
$pageDescription = "Explains how to do range selection in ag-Grid.";
$pageKeyboards = "range selection javascript grid ag-grid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Range Selection</h2>

    <p>
        Range selection allows Excel-like range selection of cells. Once enabled, you can drag the mouse over
        a set of cells to select a range of cells.
    </p>

    <h3>Selecting Multiple Ranges</h3>

    <p>
        To select multiple ranges, hold down ctrl while making the selection.
    </p>

    <h3>Ranges with Pinning and Floating</h3>

    <p>
        It is possible to select a range that spans pinned and non-pinned sections of the grid.
        If you do this, the selected range will not have any gaps with regards the column order.
        For example, if you start the drag on the left pinned area and drag to the right pinned
        area, then all of the columns in the center area will also be part of the range.
    </p>

    <p>
        Likewise with floating, no row gaps will occur if a range spans into pinned rows.
        A range will be continuous between the floating top rows, the center, and the floating
        bottom rows.
    </p>

    <p>
        The above two (pinning and floating) can be thought of as follows: If you have a grid
        with pinning and / or floating, then 'flatten out' the grid in your head so that all
        rows and columns are visible, then the range selection will work as you would expect
        in the flattened out version with only full rectangles can be selectable.
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

    <snippet>
api.addEventListener('rangeSelectionChanged', function(event) {
    // this prints true for first event only
    console.log('has changed, started = ' + event.started);
    // this prints true for last event only
    console.log('has changed, finished = ' + event.finished);
});</snippet>

    <h3>Range Selection API</h3>

    <p><b>api.getRangeSelections()</b></p>

    <p>
        Get the selected ranges using <i>api.getRangeSelections()</i>. This will return back
        a list of range selection objects, each object contain the details of one range. The
        structure of the range selection is as follows:
        <snippet>
RangeSelection {
    start: GridCell; // the start cell of the range
    end: GridCell; // the end cell of the range
    columns: Column[]; // all the columns of the range
}

GridCell {
    rowIndex: number; // the index of the row. indexes are zero based.
    floating: string; // whether the row is floating ('top', 'bottom' or null for not floating)
    column: Column; // the column of the cell
}</snippet>
    </p>

    <p>
        The start and end will be the cells the user started the drag on. Two things to notice
        about the start and end:
        <ul>
            <li>The start is the first cell the user clicked on and the end is the cell where
            the user stopped dragging. Do not assume that the start cell's index is numerically
            before the end cell, as the user could of dragged up. Likewise for columns, the end
            cell could be to the left or the right of the start cell.</li>
            <li>The columns are listed twice, with start / end columns as well as a complete
            column list. This is because the complete list of columns
            may not be what you expect, as the grid may
            display the columns in a different order to what you provided the grid (the user could
            reorder), or columns may be not visible, or column groups may be closed. To avoid all
            ambiguity, the exact columns in the range are presented individually in the <i>columns</i>
            list.
            </li>
        </ul>
    </p>

    <p><b>api.clearRangeSelection()</b></p>

    <p>
        Clears the range selection.
    </p>

    <p><b>api.addRangeSelection(rangeSelection)</b></p>

    <p>
        Adds a range to the selection. This keeps any prevoius ranges. If you wish to have this range
    exclusively, then call clearRangeSelection() first.
        <snippet>
AddRangeSelectionParams{
    rowStart: number, // the start row index
    floatingStart: string, // the starting floating ('top', 'bottom' or null/undefined)
    rowEnd: number, // the end row index
    floatingEnd: string, // the end floating ('top', 'bottom' or null/undefined)
    columnStart: string|Column, // colId of the starting column
    columnEnd: string|Column // colId of the ending column
}</snippet>
    </p>

    <h3>Callback processCellForClipboard()</h3>

    <p>
        There is a grid callback <i>processCellForClipboard()</i> that allows you to format cells before
        going to the clipboard. This can be useful if, for example, you are pasting to Excel and you need to
        format dates so that Excel can understand them.
    </p>

    <p>
        The callback params has the following attributes: value, node, column, api, columnApi, context, type.
    </p>

    <h3>Copy Range Down</h3>

    <p>
        When you have more than one row selected in a range, pressing keys Ctrl & D will copy
        the range down.
    </p>

    <h3>Range Selection Example</h3>

    <p>
        The example below demonstrates range selection. Use your mouse to drag over the cells
        to create selections. Hold down ctrl to select more than one range. The example listens
        for the <i>rangeSelectionChanged</i> event and creates a sum of all the number values
        that are in the range (it ignores all non-number values). The <i>finished</i> flag
        is used to update the eager and lazy figures separately.
    </p>

    <p>
        The example also shows use of <i>processCellForClipboard()</i> and <i>processCellFromClipboard()</i>
        by making all the athlete names upper case when copying into the clipboard and lowercase when
        copying it from the clipboard.
    </p>

    <show-example example="rangeSelection"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
