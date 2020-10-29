<?php
$pageTitle = "Server-Side Row Model - High Frequency";
$pageDescription = "High frequency updates using the Server-Side Row Model.";
$pageKeywords = "ag-Grid Server-Side Row Model High Frequency Updates";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM High Frequency Updates</h1>

<p class="lead">
    High Frequency Updates allow large numbers of updates against the grid without having a drastic
    hit on performance.
</p>

<p>
    When a transaction is applied to the grid, it results in the grid re-rendering it's rows to cater
    for the new values. In addition to this, if the transactions are getting applied in different JavaScript
    VM turns (which is often the case when data updates are streamed), each VM turn will result in a
    browser redraw, which could otherwise not happen.
</p>

<h2>Async Transactions</h2>

<p>
    Grid grid caters for High Frequency Updates via Async Transactions.
</p>

<p>
    When a Transaction is applied to the grid using Async Transactions, the transaction is not applied
    immediately. Rather the grid waits for a period for more transactions to be applied and then applies them
    all together in one go, result in just one redraw for all the Transactions.
</p>

<p>
    Applying Transactions asynchronously is done by using the grid API <code>applyServerSideTransactionAsync()</code>.
    The signature is similar to <code>applyServerSideTransaction</code> except the result is returned asynchronously
    via a callback.
</p>

<?= createSnippet(<<<SNIPPET
// Standard Sync for regular updates
public applyServerSideTransaction(
                    transaction: ServerSideTransaction
            ) : ServerSideTransactionResult | undefined;

// Async apply for High Frequency Updates
public applyServerSideTransactionAsync(
                    transaction: ServerSideTransaction,
                    callback?: (res: ServerSideTransactionResult) => void
            ): void;
SNIPPET
) ?>

<p>
    The transaction interface <code>ServerSideTransaction</code> and the result interface
    <code>ServerSideTransactionResult</code> across the sync and async variants are the same.
</p>

<p>
    The amount of time which the grid waits before applying the transaction is set via the grid
    property <code>asyncTransactionWaitMillis</code> and defaults to 50ms.
</p>

<p>
    Below shows a simple example using Async Transactions. Note the following:
</p>

<ul>
    <li>
        The property <code>asyncTransactionWaitMillis = 4000</code>. This makes the grid wait 4 seconds
        before applying Async Transactions.
    </li>
    <li>
        Clicking <b>Add</b> will apply the Transaction asynchronously. The grid will wait for 4 seconds
        before adding teh row to the grid. Any other rows added during this two seconds (eg if the button is clicked
        multiple times before 4 seconds have expired) then all rows will be added together at the end of
        the 4 second wait.
    </li>
    <li>
        Clicking <b>Flush</b> will apply all waiting Transactions.
    </li>
</ul>

<?= grid_example('High Frequency Flat', 'high-frequency-flat', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h2>Flushed Event</h2>

<p>
    When transactions are applied, the event <code>asyncTransactionsApplied</code> event is fired.
    The event contains all of the <code>ServerSideTransactionResult</code> objects of all attempted
    transactions.
</p>

<p>
    The example below listens for this event and prints a summary of the result objects to the console.
</p>

<?= grid_example('Transaction Applied Event', 'transaction-applied-event', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>


<?= grid_example('High Frequency Hierarchy', 'high-frequency-hierarchy', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
