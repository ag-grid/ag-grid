<?php
$pageTitle = "ag-Grid Row Models: The Row Node";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It stores the data in Row Models. Each piece of row data provided to the datgrid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeywords = "ag-Grid data row model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1>Column</h1>

<p class="lead">
    A <code>Column</code> object represents a column in the grid. The <code>Column</code> will contain a reference to the
    column definition your application provided as well as other column runtime information. The
    column contains methods and emits events.
</p>

<?php createDocumentationFromFile('reference.json') ?>

<p>
    All events fired by the column are synchronous (events are normally asynchronous). The grid is also
    listening for these events internally. This means that when you receive an event, the grid may still
    have some work to do (e.g. if sort has changed, the grid UI may still have to do the sorting).
    It is best that you do not call any grid API functions while receiving events from the column (as the
    grid is still processing), but instead put your logic into a timeout and call the grid in another VM tick.
</p>

<p>
    When adding event listeners to a column, they will stay with the column until the column is destroyed.
    Columns are destroyed when you add new columns to the grid. Column objects are NOT destroyed when the
    columns is removed from the DOM (e.g. column virtualisation removes the column due to horizontal scrolling,
    or the column is made invisible via the column API).
</p>

<p>
    If you add listeners to columns in custom header components, be sure to remove the listener when the
    header component is destroyed.
</p>

<?= createSnippet(<<<SNIPPET
// add visibility listener to 'country' column
var listener = function(event) {
    console.log('Column visibility changed', event);
};

var column = columnApi.getColumn('country');
column.addEventListener('visibleChanged', listener);

// sometime later, remove the listener
column.removeEventListener('visibleChanged', listener);
SNIPPET
) ?>

<?php include '../documentation-main/documentation_footer.php';?>