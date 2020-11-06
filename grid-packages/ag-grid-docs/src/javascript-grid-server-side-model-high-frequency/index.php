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

<?= createSnippet(<<<SNIPPET
// Standard Sync for regular updates
public applyServerSideTransaction(
                    transaction: ServerSideTransaction
            ) : ServerSideTransactionResult;

// Async apply for High Frequency Updates
public applyServerSideTransactionAsync(
                    transaction: ServerSideTransaction,
                    callback?: (res: ServerSideTransactionResult) => void
            ): void;
SNIPPET
) ?>

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


<h2 id="retrying-transactions">Retrying Transactions</h2>

<p>
    The Retrying Transactions feature guards against Lost Updates.
    Lost updates refers to new data created in the server's data store that due to the order of data
    getting read and the transaction applied, the record ends up missing in the grid.
</p>

<p>
    Lost updates occur when data is read from the server is missing a record (as it's to early), but
    the transaction for the new record is attempted before the Row Store finishes loading (transaction is
    discarded).
</p>

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
<ul>
    <li>
        Use the <b>Refresh</b> button to get the grid to refresh.
    </li>
    <li>
        The Datasource reads (takes a copy) of the server data, but then waits 2 seconds before
        returning the data, to mimic a slow network on the data return.
    </li>
    <li>
        While a refresh is underway, add records using the <b>Add</b> button. This will add records
        to the server that will be missing in the row data the grid receives. The transactions
        will be applied after the data load is complete.
    </li>
    <li>
        Note the console - after rows are loaded, transactions that were received during
        the load are applied after the load. This means the grid will show new records even
        though they were missing form teh loaded row data.
    </li>
</ul>

<?= grid_example('Retry Transactions', 'retry-transactions', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<p>
    This only applies to loading stores. If the grid is limiting the number of concurrent
    loads (property <code>maxConcurrentDatasourceRequests</code> is set) then it's possible
    Stores are waiting to load. If they are waiting to load, transactions for updates will all
    be discarded as no race condition (see below) is possible.
</p>


<h2 id="cancelling-transactions">Cancelling Transactions</h2>

<p>
    The Cancelling Transactions feature guards against Duplicate Records.
    Duplicate records is the inverse of Lost Update. It results in records duplicating.
</p>

<p>
    Duplicate records occur when data is read from the server includes a new record (it's just in time), but
    the transaction for the new record is attempted after the Row Store finishes loading (transaction is applied).
    This results in the record appearing twice.
</p>

<p>
    Before a transaction is applied, the grid calls the <code>isApplyServerSideTransaction()</code>
    callback to give the application one last chance to cancel the transaction.
</p>

<p>
    The signature of the callback is as follows:
</p>

<?= createSnippet(<<<SNIPPET
function isApplyServerSideTransaction(params: IsApplyServerSideTransactionParams): boolean;

interface IsApplyServerSideTransactionParams {

    // the trnasction getting applied
    transaction: ServerSideTransaction,

    // the parent RowNode, if transaction is applied to a group
    parentNode: RowNode,

    // store info, if any, as passed via the success() callback when loading data
    storeInfo: any
}
SNIPPET
) ?>

<p>
    If the callback returns <code>true</code>, the transaction is applied as normal
    and the Transaction Status <code>Applied</code> is returned.
    If the callback returns <code>false</code>, the transaction is discarded and the
    Transaction Status <code>Cancelled</code> is returned.
</p>

<p>
    The suggested mechanism is to use versioned (or timesampted) data. When row data is loaded, the application
    could provide a data version as
    <a href="../javascript-grid-server-side-model-grouping/#store-state-info/">Store Info</a>.
</p>

<p>
    The example is configured to demonstrate this. Note the following:
</p>
<ul>
    <li>
        Use the <b>Refresh</b> button to get the grid to refresh.
    </li>
    <li>
        The Datasource reads (takes a copy) of the server data, but waits 2 seconds first
        before reading. This mimics a slow network on the way to the server.
    </li>
    <li>
        While a refresh is underway, add records using the <b>Add</b> button. This will add records
        to the server that will be existing in the row data the grid receives. The transactions
        will be applied after the data load is complete.
    </li>
    <li>
        A version is applied to the server. This version attached to both Store Info and
        also the Transaction.
    </li>
    <li>
        Note the console - after rows are loaded, transactions that were received during
        the load are applied after the load. This means the grid will show new records even
        though they were missing form teh loaded row data.
    </li>
</ul>

<?= grid_example('Cancel Transactions', 'cancel-transactions', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h2>Race Conditions</h2>

<p>
    Race conditions occur because of the asynchronous nature of loading data and applying transactions.
    Race conditions result in lost updates and duplicated records.
</p>
<p>
    Lost updates are catered for by the grid by retrying transactions when Row Stores are loading
    explained in <a href="#retrying-transactions">Retry Transactions</a> above.
</p>
<p>
    Duplicate records need to be catered for by your application using the
    <a href="#cancelling-transactions">Cancelling Transactions</a> feature explained above.
</p>

<h2>Big Example</h2>

<p>
    The above explains all the finer details of using Async Transactions. Below presents
    an example bringing it all together with a larger dataset, grouping and streaming updates
    from the server.
</p>

<p>
    The example presents a simplified trading hierarchy, typically found inside a financial
    institution.
    The example data initially has 28 products, with each product containing 5 portfolios each,
    each portfolio containing 5 books and each book containing 5 trades. So the data
    has 28 products, 150 portfolios, 700 books and 3,500 trades. This data size is small comparable
    to what the grid can handle, or what's typical for large financial institutions, however
    it's kept to moderate size as the server is mocked in the example.
</p>
<p>
    As far as the grid is concerned,
    it is lazy loading data based on what groups the user has expanded, so it doesn't matter from
    the grids perspective how big the dataset is on the server.
</p>

<p>
    In theory there no limit to the number of groupings or data size allowed.
    It's common for financial institutions to use the grid to show trading hierarchies with
    10 or more levels in the hierarchy with 60,000 to 100,000 books.
</p>

<p>
    In the example, note the following:
</p>
<ul>
    <li>
        The data has three levels of grouping over columns Product, Portfolio and Book.
    </li>
    <li>
        The SSRM uses the Full store for all group levels.
    </li>
    <li>
        The grid property <code>asyncTransactionWaitMillis = 500</code>, which means all
        Async Transactions will get applied after 500ms. In applications, a lower number
        would typically be used to give more instant feedback to the user. However
        this example slows it down to save clutter in the dev console and make the example
        easier to follow.
    </li>
    <li>
        The button One Transaction apply one Async Transaction to the top most group
        when data is un-sorted (Palm Oil -> Aggressive -> LB-0-0-0). When this
        route is expanded, adding the trade can be observed.
    </li>
    <li>
        The buttons Start Feed and Stop Feed start and stop live updates happening
        on the server.
    </li>
    <li>
        The example registers for live updates with the fake server. In a real world
        example, live updates would probably be delivered using web sockets and how
        it is managed on the server would be the responsibility of your server technology.
    </li>
    <li>
        The fake server makes use of a version counter. The version at the time of data
        reads is provided to the grid as Store Data. The version of the data at the time
        of record creation is passed alongside the grid's transactions.
    </li>
    <li>
        There are no problem with race conditions as the grid will retry transactions
        automatically when transactions are applied against loading Row Stores, and
        the callback <code>isApplyServerSideTransaction()</code> is implemented to
        discard old transactions.
    </li>
    <li>
        All columns are sortable. The sorting is done by the grid without needing to request
        data again from the server.
    </li>
    <li>
        Column Deal Type has a filter associated with it. The filter is done by the grid without
        needing to request data again from the server.
    </li>
</ul>

<?= grid_example('High Frequency Hierarchy', 'high-frequency-hierarchy', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to do <a href="../javascript-grid-server-side-model-retry/">Load Retry</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
