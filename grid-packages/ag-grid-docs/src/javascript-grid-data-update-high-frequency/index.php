<?php
$pageTitle = "Client-Side Data - High Frequency Updates";
$pageDescription = "High Frequency Updates relates to lots of updates in high succession going into the grid.";
$pageKeywords = "ag-Grid high frequency";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Client-Side Data - High Frequency Updates</h1>

<p class="lead">
    High Frequency Updates relates to lots of updates in high succession going into the grid.
    Every time you update data in the grid, the grid will rework all aggregations, sorts and filters
    as well as having the browser update its DOM. If you are streaming multiple
    updates into the grid this can be a bottleneck. High Frequency Updates are achieved in
    the grid using Async Transactions. Async Transactions allow for efficient high-frequency grid updates.
</p>

<h2>Async Transactions</h2>

<p>
    When you call <code>applyTransactionAsync()</code> the grid will execute the update, along with any
    other updates you subsequently provide using <code>applyTransactionAsync()</code>, after 50ms.
    This allows the grid to execute all the transactions in one batch which is more efficient.
</p>

<?= grid_example('Async Transaction', 'async-transaction', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'modules' => ['clientside', 'rowgrouping'], 'reactFunctional' => true]) ?>

<p>
    To help understand the interface for <code>applyTransaction()</code> and <code>applyTransactionAsync()</code>,
    here are both method signatures side by side. The first executes immediately. The second executes
    sometime later using a callback for providing a result.
</p>

<?= createSnippet(<<<SNIPPET
// normal applyTransaction takes a RowDataTransaction and returns a RowNodeTransaction
applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction

// batch takes a RowDataTransaction and the result is provided some time later via a callback
applyTransactionAsync(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void
SNIPPET
) ?>

<p>
    Use Async Transactions if you have a high volume of streaming data going into the grid and
    don't want the grid's rendering and recalculating to be a bottleneck.
</p>

<note>
    You might ask, wouldn't using a virtual DOM like React remove the necessity of Async Transactions?
    The answer is no. A virtual DOM would only batch the DOM related updates, it would not help with
    the batching of aggregations, sorts and filters.
</note>

<h2>Flush Async Transactions</h2>

<p>
    The default wait between executing batches is 50ms. This means when an Async Transaction
    is provided to the grid, it can take up to 50ms for that transaction to be applied.
</p>

<p>
    Sometimes you may want all transactions to be applied before doing something - for example
    you may want to select a rows in the grid but want to make sure the grid has all the latest
    row data before doing so.
</p>

<p>
    To make sure the grid has no Async Transactions pending, you can flush the Async Transaction
    queue. This is done by calling the API <code>flushAsyncTransactions</code>.
</p>

<p>
    It is also possible to change the wait between executing batches from the default 50ms. This
    is done using the grid property <code>asyncTransactionWaitMillis</code>.
</p>

<p>
    The example below demonstrates setting the wait time and also flushing. Note the following:
</p>

<ul>
    <li>
        The property <code>asyncTransactionWaitMillis</code> is set to 4000, thus transactions
        get flushed every 4 seconds.
    </li>
    <li>
        The button Flush Transactions will call the API method <code>flushAsyncTransactions</code>.
    </li>
    <li>
        Transactions getting added and executed is logged to the console.
    </li>
</ul>

<?= grid_example('Flush Transactions', 'flush-transactions', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'reactFunctional' =>  true]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
