<?php
$pageTitle = "Updating Data: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Updating Data. Data can be updated in real time. The grid can highlight the change by flashing the cells or by animation inside the cell as the cell refreshes. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Client-side Data - High Frequency Updates</h1>

    <p class="lead">
        High Frequency Updates relates to lots of updates in high succession going into the grid.
        Every time you update data in the grid, the grid will rework all aggregations, sorts and filters
        as well as having the browser update it's DOM. If you are streaming multiple
        updates into the grid this can be a bottleneck. High Frequency Updates are achieved in
        the grid using Batch Transactions. Batch Transactions allow for efficient high frequency grid updates.
    </p>

    <p>
        When you call <code>batchUpdateRowData()</code> the grid will execute the update, along with any
        other updates you subsequently provide using <code>batchUpdateRowData()</code>, after 50ms.
    </p>

    <?= grid_example('Batch Transaction', 'batch-transaction', 'generated', ['enterprise' => true, 'exampleHeight' => 590]) ?>

    <p>
        To help understand the interface into <code>updateRowData()</code> and <code>batchUpdateRowData()</code>,
        here are both method signatures side by side. The first executes immediately. The second executes
        sometime later using a callback for providing a result.
    </p>

    <snippet>
// normal updateRowData takes a RowDataTransaction and returns a RowNodeTransaction
updateRowData(rowDataTransaction: RowDataTransaction): RowNodeTransaction

// batch takes a RowDataTransaction and the result is provided some time later via a callback
batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction)=>void): void
    </snippet>

    <p>
        The default wait between executing batches if 50ms. This can be changed using the grid
        property <code>batchUpdateWaitMillis</code>.
    </p>

    <p>
        Use batch updates if you have streaming data going into the grid and want don't want the grid's
        rendering and recalculating to be a bottleneck.
    </p>

    <note>
        You might ask, wouldn't using a virtual DOM like React remove the necessity of Batch Transactions?
        The answer is no. A virtual DOM would only batch the DOM related updates, it would not help with
        the batching of aggregations, sorts and filters.
    </note>

<?php include '../documentation-main/documentation_footer.php';?>
