<?php
$pageTitle = "ag-Grid Row Models: The Row Node";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It stores the data in Row Models. Each piece of row data provided to the datgrid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeywords = "ag-Grid data row model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1>Row Object (aka Row Node)</h1>

<p class="lead">
    A Row Node represents one row of data. The Row Node will contain a reference to the
    data item your application provided as well as other runtime information about the row. The
    Row Node contains attributes, methods and emits events. Additional attributes are used if the
    Row Node is a group.
</p>

<?php createDocumentationFromFile('reference.json') ?>

<p>
    All events fired by the <code>rowNode</code> are synchronous (events are normally asynchronous). The grid is also
    listening for these events internally. This means that when you receive an event, the grid may still
    have some work to do (e.g. if <code>rowTop</code> changed, the grid UI may still have to update to reflect this change).
    It is also best you do not call any grid API functions while receiving events from the <code>rowNode</code> (as the
    grid is still processing). Instead, it is best to put your logic into a timeout and call the grid in another VM tick.
</p>

<p>
    When adding event listeners to a row, they will stay with the row until the row is destroyed. This means if the row
    is taken out of memory (pagination or virtual paging) then the listener will be removed. Likewise, if you set
    new data into the grid, all listeners on the old data will be removed.
</p>

<p>
    Be careful when adding listeners to <code>rowNodes</code> in cell renderers that you remove the listener when the rendered
    row is destroyed due to row virtualisation. You can cater for this as follows:
</p>

<?= createSnippet(<<<SNIPPET
var renderer = function(params) {
    // add listener
    var selectionChangedCallback = function () {
        // some logic on selection changed here
        console.log('node selected = ' + params.node.isSelected());
    };

    params.node.addEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);

    // remove listener on destroy
    params.addRenderedRowEventListener('renderedRowRemoved', function() {
        params.node.removeEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
    }

    return params.value;
}
SNIPPET
) ?>

<?php include '../documentation-main/documentation_footer.php';?>