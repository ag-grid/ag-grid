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
    Applying Transactions asynchronously is done by using the grid API <code>cancelTx()</code> and some
    logic that is provided by your application.
</p>
<p>
    The suggested mechanism is to use versioned (or timesampted) data. When row data is loaded, the application
    could provide a data version as storeInfo.

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

<h2>Retry Transactions</h2>

<p>
    When a Row Store is loading and a transaction is applied asynchronously, the grid can optionally wait for the
    Row Store to be loaded and then apply the transaction.
</p>

<p>
    This removes the possibility of lost updates. For example suppose the grid's Row Store has requested row data.
    While the Row Store is waiting for the row data to be loaded, a new record is created and a transaction is applied to
    the grid to insert the new record. If a) the transaction is applied before the Row Store has finished loading
    and b) the record was created after the row data was read from the server-side data store - then the record
    will not end up in the Row Store's data, and hence be missing from the grid.
</p>

<p>
    The way to get around this is for the grid to retry transactions that came in during loading after the data
    is loaded.
</p>

<p>
    To retry transactions on loading stores after the store has loaded, set the grid property
    <code>serverSideAsyncTransactionLoadingStrategy=true</code>.
</p>

<p>
    The transactions will get applied to the store in the order they were provided to the grid.
    The order will not get mixed up due to retrying. However transactions applied to other stores (e.g.
    grouping is active and other Row Stores have loaded) will go ahead as normal. Loading only delays
    transactions for the loading stores.
</p>
mentios waitint to load...


<h2>Timing Considerations</h2>

<p>
    Because the SSRM loads rows asynchronously and Async Transactions are applied asynchronously, there can
    be race conditions with your application that need to be guarded against.
</p>

<p>
    For example, the grid can request row data from the server. While the grid is waiting for the row data to be provided,
    a transaction could be applied to insert one new record. When the row data does finally come in,
    it is possible the new record is missing and needs to be inserted (the transaction is applied) or the row data already
    has the record (it was read from the database after the record was created) and as such the transaction should
    be discarded.
</p>

<p>
    It is up to your application to cancel transactions that should not be applied due to race conditions.
    This is done using the <code></code>
</p>

<h2>Big Data Example</h2>

<p>
    The above examples use small datasets to help the
</p>

<?= grid_example('High Frequency Hierarchy', 'high-frequency-hierarchy', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
