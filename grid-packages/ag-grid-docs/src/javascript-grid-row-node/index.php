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

<h2>Row Node Events</h2>

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

<h2>Row Node IDs</h2>

<p>
    Each Row Node is identified by a unique ID. The ID of the Row Node is used by the grid to identify the
    row and can be used by your application to look up the Row Node using
    the grid API <code>getRowNode(id)</code>.
</p>

<h3>Grid Assigned IDs</h3>

<p>
    By default IDs are assigned by the grid when data is set into the grid. The grid
    uses a sequence starting at 0 and incrementing by 1 to assign row IDs, so if for example there are three rows
    they will have IDs of <code>0</code>, <code>1</code> and <code>2</code>.
</p>

<p>
    When using <a href="../javascript-grid-grouping/">Row Grouping</a> the grid assigns IDs to the group rows,
    however it uses a different sequence starting at -1 and decrementing by 1, so if for example there are three groups
    they will have IDs of <code>-1</code>, <code>-2</code> and <code>-3</code>.
</p>

<p>
    In other words, normal rows get positive numbers starting at <code>0</code> and group rows get negative numbers
    starting at <code>-1</code>.
</p>

<h3>Application Assigned IDs</h3>

<p>
    In some applications it is useful to tell the grid what IDs to use for particular rows. For example, if you
    are showing employees, you could configure the grid to use the Employee ID as the row node ID. That would then
    enable the grid API <code>getRowNode(id)</code> to be called with the Employee ID.
</p>

<p>
    To get the grid to use application assigned IDs, implement the grid callback <code>getRowNodeId()</code>.
    The callback should return back the ID for a particular piece of row data. For example, the following
    code snippet returns back the value of attribute <code>'id'</code> for the supplied data item:
</p>

<?= createSnippet(<<<SNIPPET
function getRowNodeId(data) {
    return data.id;
}
SNIPPET
) ?>

<p>
    When providing IDs the following rules must be obeyed:
</p>

<ol>
    <li>IDs must be unique</li>
    <li>IDs must not change</li>
</ol>

<p>
    If the attribute you are intending to use as an ID is either not unique or changes, it will cause
    unspecified behaviour in the grid. In other words, don't use a field that is not unique or can change.
</p>

<p>
    If using <a href="../javascript-grid-grouping/">Row Grouping</a>, the grid will always assign IDs for
    the group level (as there is not a one-to-one mapping with application-supplied row data). The callback
    <code>getRowNodeId()</code> is only used for non-group level rows.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
