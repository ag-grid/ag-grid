<?php
$pageTitle = "ag-Grid Row Models: The Row Node";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It stores the data in Row Models. Each piece of row data provided to the datgrid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeywords = "ag-Grid data row model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>


    <h1>Column</h1>

    <p class="lead">
        A Column object represents a column in the grid. The Column will contain a reference to the
        column definition your application provided as well as other column runtime information. The
        column contains methods and emits events.
    </p>

    <h2>Column Methods</h2>

    <ul class="content">
        <li>
            <code>getId() / getColId() / getUniqueId()</code>: Returns the unique ID for the column.
        </li>
        <li>
            <code>getParent()</code>: Returns the parent column group, if column grouping is active.
        </li>
        <li>
            <code>getColDef() / getDefinition()</code>: Returns the column definition for this column. The column definition
            will be the result of merging the application provided column definition with any provided
            defaults (eg <code>defaultColDef</code> grid option, or column types).
        </li>
        <li>
            <code>getUserProvidedColDef()</code>: Returns the column definition provided by the application.
            This may not be correct, as items can be superseded by default column options. However it's
            useful for comparison, eg to know which application column definition matches that column.
        </li>
        <li>
            <code>isPrimary()</code>: Returns true if column is a primary column, false if secondary.
            Secondary columns are used for pivoting.
        </li>
        <li>
            <code>isFilterAllowed()</code>: Returns true if column filtering is allowed.
        </li>
        <li>
            <code>isFilterActive()</code>: Returns true if filter is active on the column.
        </li>
        <li>
            <code>getSort()</code>: If sorting is active, returns the sort direction eg 'asc' or 'desc'.
        </li>
        <li>
            <code>getAggFunc()</code>: If aggregation is set for the column, returns the aggregation function.
        </li>
        <li>
            <code>getActualWidth()</code>: Returns the current with of the column. If the column is resized, the
            actual width is the new size.
        </li>
        <li>
            <code>isRowGroupActive()</code>: Returns true if row group is currently active for this column.
        </li>
        <li>
            <code>isPivotActive()</code>: Returns true if pivot is currently active for this column.
        </li>
        <li>
            <code>isValueActive()</code>: Returns true if value (aggregation) is currently active for this column.
        </li>
        <li>
            <code>addEventListener() / removeEventListener()</code>: Add / remove event listener to the column.
        </li>
    </ul>

    <h2>Events on Column</h2>

    <p>
        Columns emit the following events:
    </p>

    <ul class="content">
        <li><b>filterActiveChanged</b>: The filter active value has changed.</li>
        <li><b>sortChanged</b>: The sort value has changed.</li>
        <li><b>leftChanged</b>: The left position has changed (eg column has moved).</li>
        <li><b>widthChanged</b>: The width value has changed.</li>
        <li><b>visibleChanged</b>: The visibility value has changed.</li>
        <li><b>menuVisibleChanged</b>: The column menu was show / hidden.</li>
        <li><b>columnRowGroupChanged</b>: The row group value has changed.</li>
        <li><b>columnPivotChanged</b>: The pivot value has changed.</li>
        <li><b>columnValueChanged</b>: The 'value' value has changed.</li>
        <li><b>movingChanged</b>: The column has started / finished moving (ie user is dragging the column to a new location).</li>
    </ul>

    <p>
        All events fired by the column are synchronous (events are normally asynchronous). The grid is also
        listening on these events internally. What that means is when you receive an event, the grid may still
        have some work to do (eg if sort has changed, the grid UI may still have to do the sorting).
        It best you do not call any grid API functions while receiving events from the column (as the
        grid is still processing), instead put your logic into a timeout and call the grid in another VM turn.
    </p>

    <p>
        When adding event listeners to a column, they will stay with the column until the column is destroyed.
        Columns are destroyed when you add new columns to the grid. Column objects are NOT destroyed when the
        columns is removed form the DOM (eg column virtuslisation removes the column due to horizontal scrolling,
        or the column is made 'not visible' via the column API).
    </p>

    <p>
        If you add listeners to columns in customer header components, be sure to remove the listener when the
        header component is destroyed.
    </p>

        <snippet>
// add visibility listener to 'country' column
let listener = function(event) {
    console.log('Column visibility changed', event);
};
let column = columnApi.getColumn('country');
column.addEventListener('visibleChanged', listener);

// sometime later, remove the listener
column.removeEventListener('visibleChanged', listener);
</snippet>


<?php include '../documentation-main/documentation_footer.php';?>