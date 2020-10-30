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
    browser redraw. If you are receiving 10's of updates a second, this will probalby kill your applications
    performance. Hence the need for Async Transactions.
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
    The amount of time which the grid waits before applying the transaction is set via the grid
    property <code>asyncTransactionWaitMillis</code> and defaults to 50ms. Transactions are also
    applied after any rows are loaded.
</p>

<p>
    The transaction interfaces <code>ServerSideTransaction</code> and
    <code>ServerSideTransactionResult</code> used in
    <a href="../javascript-grid-server-side-model-transactions/#transaction-api">SSRM Transactions</a> are used
    again for Async Transactions.
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
    <li>
        Row data finished loading will also apply (flush) all waiting Transactions.
    </li>
</ul>

<?= grid_example('High Frequency Flat', 'high-frequency-flat', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h2>Flushed Event</h2>

<p>
    When Async Transactions are applied, the event <code>asyncTransactionsFlushed</code> event is fired.
    The event contains all of the <code>ServerSideTransactionResult</code> objects of all attempted
    transactions.
</p>

<?= createSnippet(<<<SNIPPET
interface AsyncTransactionsFlushed {

    type: string; // always 'asyncTransactionsFlushed'
    api: GridApi; // the grid's API
    columnApi: ColumnApi; // the grid's Column API

    // array of result objects. for SSRM it's always list of ServerSideTransactionResult.
    // for Client-side Row Model it's list of RowNodeTransaction.
    results: (RowNodeTransaction | ServerSideTransactionResult) [];
}
SNIPPET
) ?>

<p>
    The example below listens for this event and prints a summary of the result objects to the console.
</p>

<?= grid_example('Transaction Flushed Event', 'transaction-flushed-event', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>


<h3>Retry Transactions</h3>

<p>
    When a Row Store is loading and a transaction is applied asynchronously, the grid will wait for the
    Row Store to be loaded and then apply the transaction.
</p>

<p>
    The transactions will get applied to the store in the order they were provided to the grid.
    The order will not get mixed up due to retrying. However transactions applied to other stores (e.g.
    grouping is active and other Row Stores have loaded) will go ahead as normal. Loading only delays
    transactions for the loading stores.
</p>

<p>
    The example is configured to demonstrate this. Note the following:

</p>

<?= grid_example('Retry Transactions', 'retry-transactions', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<p>
    This only applies to loading stores. If the grid is limiting the number of concurrent
    loads (property <code>maxConcurrentDatasourceRequests</code> is set) then it's possible
    Stores are waiting to load. If they are waiting to load, transactions for updates will all
    be discarded as no race condition (see below) is possible.
</p>


<h2>Race Conditions</h2>

<p>
    Because the SSRM loads rows asynchronously and Async Transactions are applied asynchronously, there can
    be race conditions resulting in Lost Updates and Duplicate Entries that your application may need to
    guard against.
</p>

<ul>
    <li>
        <h3>Lost Updates</h3>

        <p>
            Lost updates refers to new data created in the server's data store that due to the order of data
            getting read and the transaction applied, the record ends up missing in the grid.
        </p>

        <p>
            Lost updates occur when data is read from the server is missing a record (as it's to early), but
            the transaction for the new record is attempted before the Row Store finishes loading (transaction is
            discarded).
        </p>

        <p>
            For example suppose the grid's Row Store has requested row data.
            While the Row Store is waiting for the row data to be loaded, a new record is created in the server's data store
            and a transaction is applied to the grid to insert the new record.
            If a) the transaction is applied before the Row Store has finished loading (the transaction is discarded)
            and b) the record was created after the row data was read from the server's data store - then the record
            will not end up in the Row Store's data, and hence be missing from the grid.
        </p>

    </li>
    <li>
        <h3>Duplicate Records</h3>

        <p>
            Duplicate records is the inverse of Lost Update. It results in records duplicating.
        </p>

        <p>
            Duplicate records occur when data is read from the server includes a new record (it's just in time), but
            the transaction for the new record is attempted after the Row Store finishes loading (transaction is applied).
            This results in the record appear twice.
        </p>

    </li>
</ul>

<h2>======</h2>


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


<h2>Timing Considerations</h2>

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
