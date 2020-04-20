<?php
$pageTitle = "Updating Data: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Updating Data. Data can be updated in real time. The grid can highlight the change by flashing the cells or by animation inside the cell as the cell refreshes. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Client-side Data - Single Row / Cell Updates</h1>

    <p class="lead">
        You can target updates to a single row or cell. Updating a single row means asking the grid to replace
        the data item for on specific row. Updating a cell means keeping the data item but asking the grid to
        replace one attribute of that data item.
    </p>

    <p>
        Doing both single row and single cell updates is done by firstly getting a reference
        to the row's Row Node and then using the relevant Row Node API method. See
        <a href="../javascript-grid-accessing-data/">Accessing Data</a> on how to get access
        Row Nodes.
        Once you have access to the required Row Node, you update it's data with the following
        Row Node API methods:
    </p>

    <ul class="content">
        <li><code>rowNode.setData(data):</code> Replaces the data on the rowNode. When
            complete, the grid will refresh the the entire rendered row if it is showing.</li>
        <li><code>rowNode.setDataValue(colKey, value):</code> Replaces the data on the
            rowNode for the specified column. When complete, the grid will refresh
            the rendered cell on the required row only.</li>
    </ul>

    <h2>View Refresh</h2>

    <p>
        After calling <code>rowNode.setData()</code> or <code>rowNode.setDataValue()</code>
        the grid's view will automatically refresh to reflect the change. There is no
        need to manually request a refresh.
    </p>

    <h2>Sort / Filter / Group Refresh</h2>

    <p>
        After calling <code>rowNode.setData()</code> or <code>rowNode.setDataValue()</code>
        the grid will not update to reflect a change in sorting, filtering or grouping.
    </p>
    <p>
        To have the grid to update it's sort, filter or groping call the Grid API
        <code>refreshClientSideRowModel()</code>.
    </p>
    <p>
        If you want the grid to automatically update sorting, filter or grouping then you
        should consider using
        <a href="../javascript-grid-data-update-transactions/">Transaction Updates</a>.
    </p>

    <h2>Updating Rows / Cells Example</h2>

    <p>
        The example below demonstrates the following:
    </p>

    <ul class="content">
        <li><b>Set Price on Toyota:</b> The price value is updated on the Toyota row and the grid refreshes the cell.</li>
        <li><b>Set Data on Ford:</b> The entire data is set on the Ford row and the grid refreshes the entire row.</li>
        <li><b>Sort:</b> Re-runs the sort in the Client-side Row Model - to see this in action, sort the data first, then
            edit the data so the sort is broken, then hit this button to fix the sort.</li>
        <li><b>Filter:</b> Re-runs the filter in the Client-side Row Model - to see this in action, filter the data first, then
            edit the data so the filter is broken (ie a row is present that should not be present), then hit this button to fix the filter.</li>
    </ul>

    <?= grid_example('Updating Row Nodes', 'updating-row-nodes', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php';?>
