<?php
$key = "Column Sync";
$pageTitle = "ag-Grid Column Sync";
$pageDescription = "ag-Grid Column Sync";
$pageKeyboards = "ag-Grid Column Sync";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="master-slave">Column Sync</h1>

    <p>
        Column syncing two or more grids means columns will be kept synchronised in all grids.
        In other words, column changes to one grid (column width, column order, column visibility etc)
        are reflected in the other grid.
        This is useful if you have two grids, one above the other such that their columns are vertically aligned,
        and you want to keep the columns aligned.
    </p>

    <h3 id="configuration">Configuration</h3>

    <p>
        To have one (the first) grid reflect column changes in another (the second), place the
        first grid's options in <code>columnSyncGrids</code> property of the second grids.
    </p>
    <pre><code>gridOptionsFirst = {
    <span class="codeComment">// some grid options here</span>
        ...
};

gridOptionsSecond = {
    <span class="codeComment">// register first grid to receive events from the second</span>
    columnSyncGrids: [gridOptionsFirst]

    <span class="codeComment">// other grid options here</span>
    ...
}</code></pre>

    <h2 id="demonstration-example">Example - Synced Columns</h2>

    <p>
        Below shows two grids, both synchronised with the other (so any column change to one will be
        reflected in the other). The following should be noted:
        <ul>
            <li>When either grid is scrolled horizontally, the other grid follows.</li>
            <li>Showing / hiding a column on either grid (via the checkbox) will show / hide the column
                on the other grid, despite the API been called on one grid only.</li>
            <li>When a column is resized on either grid, the other grid follows.</li>
            <li>When a column group is opened on either grid, the other grid follows.</li>
        </ul>
        The grids don't serve much purpose (why would you show the same grid twice???) however
        it demonstrates the features in an easy to understand way.
    </p>

    <show-example example="exampleMasterSlave"></show-example>

    <h2 id="events">Events</h2>
    <p>
        The events which are fired as part of the master slave relationship are as follows:
        <ul>
            <li>Horizontal Scroll</li>
            <li>Column Hidden / Shown</li>
            <li>Column Moved</li>
            <li>Column Group Opened / Closed</li>
            <li>Column Resized</li>
            <li>Column Pinned</li>
        </ul>
    </p>

    <h2 id="pivots">Pivots</h2>

    <p>
        The pivot functionality does not work with synced grids. This is because pivoting data changes
        the columns, which would make the synced grids incompatible, as they are no longer sharing
        the same set of columns.
    </p>

    <h2 id="a-wee-more-useful-example">Example - Second Grid as Footer</h2>

    <p>
        So why would you want to column sync grids like this? It's great for aligning grids that have
        different data but similar columns. Maybe you want to include a footer grid with 'summary' data.
        Maybe you have two sets of data, but one is aggregated differently to the other.
    </p>

    <p>
        This example is a bit more useful. In the bottom grid, we show a summary row. Also
        note the following:
        <li>The top grid has no horizontal scroll bar, suppressed via a grid option.</li>
        <li>The bottom grid has no header, suppressed via a grid option.</li>
        <li>sizeColumnsToFit is only called on the top grid, the bottom grid receives the new column
            widths from the top grid.</li>
    </p>

    <show-example example="exampleFloatingFooter"></show-example>

    <h2 id="split-column-groups">Example - Synced Column Groups</h2>

    <p>
        It is possible that you have column groups that are split because of pinning or the
        order of the columns. The grid below has only two groups that are split, displayed
        as many split groups. The column syncing also works here in that a change to a split
        group will open / close all the instances of that group in both tables.
    </p>

    <show-example example="exampleMasterSlaveGroups"></show-example>

    <h2 id="event-propagation">Event Propagation</h2>

    <p>
        When a grid fires an event, it will be processed to all registered synced grids. However if
        a grid is processing a sync, it will not fire an event to other synced grids. For example, consider
        the grids A, B and C where B is synced to A and C is synced to B (ie A -> B -> C). If
        A gets a column resized, it will fire the event to B, but B will not fire the event to C. If
        C is also dependent on A, it needs to be set up directly. This stops cyclic dependencies
        between grids causing infinite firing of events if two grids are synced to each other.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
