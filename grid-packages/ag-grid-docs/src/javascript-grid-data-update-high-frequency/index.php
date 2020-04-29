<?php
$pageTitle = "High Frequency Data";
$pageDescription = "High Frequency Updates relates to lots of updates in high succession going into the grid.";
$pageKeywords = "ag-Grid high frequency";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Client-side Data - High Frequency Updates</h1>

    <p class="lead">
        High Frequency Updates relates to lots of updates in high succession going into the grid.
        Every time you update data in the grid, the grid will rework all aggregations, sorts and filters
        as well as having the browser update it's DOM. If you are streaming multiple
        updates into the grid this can be a bottleneck. High Frequency Updates are achieved in
        the grid using Async Transactions. Async Transactions allow for efficient high frequency grid updates.
    </p>

    <p>
        When you call <code>applyTransactionAsync()</code> the grid will execute the update, along with any
        other updates you subsequently provide using <code>applyTransactionAsync()</code>, after 50ms.
        This allows the grid to execute all the transactions in one batch which is more efficient.
    </p>

    <?= grid_example('Batch Transaction', 'batch-transaction', 'generated', ['enterprise' => true, 'exampleHeight' => 590]) ?>

    <p>
        To help understand the interface into <code>applyTransaction()</code> and <code>applyTransactionAsync()</code>,
        here are both method signatures side by side. The first executes immediately. The second executes
        sometime later using a callback for providing a result.
    </p>

<snippet>
// normal applyTransaction takes a RowDataTransaction and returns a RowNodeTransaction
applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction

// batch takes a RowDataTransaction and the result is provided some time later via a callback
applyTransactionAsync(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction)=>void): void
</snippet>

    <p>
        The default wait between executing batches is 50ms. This can be changed using the grid
        property <code>asyncTransactionWaitMillis</code>.
    </p>

    <p>
        Use Async Transactions if you have a high volume of streaming data going into the grid and
        want don't want the grid's rendering and recalculating to be a bottleneck.
    </p>

    <note>
        You might ask, wouldn't using a virtual DOM like React remove the necessity of Async Transactions?
        The answer is no. A virtual DOM would only batch the DOM related updates, it would not help with
        the batching of aggregations, sorts and filters.
    </note>

<?php include '../documentation-main/documentation_footer.php';?>
