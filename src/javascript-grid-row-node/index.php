<?php
$key = "Row Node";
$pageTitle = "ag-Grid Row Node";
$pageDescription = "Each piece of row data provided to the grid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeyboards = "ag-Grid data row model";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="rowNode">Row Node</h2>

    <p>
        A rowNode is an ag-Grid representation of one row of data. The rowNode will contain a reference to the
        data item your application provided as well as other ag-Grid runtime information about the row. The
        rowNode contains attributes. Additional attributes are used if the node is a group.
    </p>

    <h4 id="all-node-attributes">All Node Attributes</h4>

    <p>
        <ul>
            <li><b>id:</b> Unique ID for the node provided by and used internally by the grid.</li>
            <li><b>data:</b> The data as provided by the application</li>
            <li><b>parent:</b> The parent node to this node, or empty if top level.</li>
            <li><b>level:</b> How many levels this node is from the top.</li>
            <li><b>group:</b> True if this node is a group node (ie has children).</li>
            <li><b>firstChild:</b> True if this is the first child in this group</li>
            <li><b>lastChild:</b> True if this is the last child in this group</li>
            <li><b>childIndex:</b> The index of this node in the group.</li>
            <li><b>floating:</b> 'top' or 'bottom' if floating row, otherwise null or undefined.</li>
            <li><b>quickFilterAggregateText:</b> If using quick filter, stores a string representation of the row for searching against.</li>
        </ul>
    </p>

    <h4 id="group-node-attributes">Group Node Attributes</h4>

    <p>
    <ul>
        <li><b>footer:</b> True if row is a footer. Footers  have group = true and footer = true.</li>
        <li><b>field:</b> The field we are grouping on eg Country.</li>
        <li><b>key:</b> The key for the grouping eg Ireland, UK, USA.</li>
        <li><b>childrenAfterGroup:</b> Children of this group. If multi levels of grouping, shows only immediate children.</li>
        <li><b>allLeafChildren:</b> All lowest level nodes beneath this node, no groups.</li>
        <li><b>childrenAfterFilter:</b> Filtered children of this group.</li>
        <li><b>childrenAfterSort:</b> Sorted children of this group.</li>
        <li><b>allChildrenCount:</b> Number of children and grand children.</li>
        <li><b>expanded:</b> True if group is expanded, otherwise false.</li>
        <li><b>sibling:</b> If doing footers, reference to the footer node for this group.</li>
    </ul>
    </p>

    <h4 id="node-methods">Node Methods</h4>

    <p>
    <ul>
        <li><b>setSelected(newValue: boolean, clearSelection: boolean):</b> Select (or deselect) the node. newValue=true for selection,
            newValue=false for deselection. If selecting, then passing true for clearSelection will select the
            node exclusively (ie NOT do multi select). If doing deselection, clearSelection has no impact.</li>
        <li><b>isSelected():</b> Returns true if node is selected, otherwise false.</li>
        <li><b>addEventListener(eventType: string, listener: Function):</b> Add an event listener. Currently only
            rowSelected event supported.</li>
        <li><b>removeEventListener(eventType: string, listener: Function)</b> Remove event listener.</li>
        <li><b>resetQuickFilterAggregateText()</b>: First time quickFilter runs, the grid creates a one off
            string representation of the row. This one string is then used for the quick filter instead of
            hitting each column separately. When you edit, using grid editing, this string gets cleared down.
            However if you edit without using grid editing, you will need to clear this string down for the
            row to be updated with the new values. Otherwise new values will not work with the quickFilter.</li>
        <li><b>deptFirstSearch(callback):</b> Do a tree search dept first search of this node and it's children.</li>
        <li><b>setRowHeight(height):</b> Sets the row height. Call if you want to change the height initially
            assigned to the row. After calling, you must call api.onRowHeightChanged() so the grid knows it
            needs to work out the placement of the rows.</li>
    </ul>

    <p>
        When adding event listeners to a row, they will stay with the row until the row is destroyed. So if the row
        is taken out of memory (pagination or virtual paging) then the listener will be removed. Likewise if you set
        new data into the grid, all listeners on the old data will be removed.
    </p>

    <p>
        Be careful adding listeners to rowNods in cellRenderers that you remove the listener when the rendered
        row in destroyed due to row virtualisation. You can cater for this as follows:
        <pre>var renderer = function(params) {
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
}</pre>
    </p>

    <h2 id="example-api">Example API</h2>

    <p>
        The example below shows the difference between the three forEach api methods.
    </p>

    <show-example example="exampleRowModel"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>