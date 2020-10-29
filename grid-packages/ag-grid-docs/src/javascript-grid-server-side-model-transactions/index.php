<?php
$pageTitle = "Server-Side Row Model - Transactions";
$pageDescription = "Transactions are for doing Insert, Update and Deletes on data inside the Server-Side Row Model.";
$pageKeywords = "ag-Grid Server-Side Transactions";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Transactions</h1>

<p class="lead">
    Transaction Updates allow adding, removing or updating large numbers of rows inside the grid in an
    efficient manner.
</p>

<p>
    Transactions for the Server Side Row Model (SSRM) work similarly to
    <a href="../javascript-grid-data-update-transactions">Client Side Row Model Transactions</a>.
    The API's are almost identical. However there are some important differences (such as the
    SSRM requiring a 'route') and as such the API's are not shared.
</p>

<p>
    Applying a SSRM transaction is done using the grid API applyServerSideTransaction().
    Here are some introductory code snippets demonstrating how to use the API:
</p>

<?= createSnippet(<<<SNIPPET

// Add 1 row at the top level group
gridApi.applyServerSideTransaction({
    add: [
        {id: 24, name: 'Niall Crosby', status: 'Alive and kicking'}
    ]
});

// Add 1 row under the group 'Ireland', then select it
let res = gridApi.applyServerSideTransaction({
    route: ['Ireland'],
    add: [
        {id: 24, name: 'Niall Crosby', status: 'Alive and kicking'}
    ]
});
if (res.status=='Applied') {
  let rowNode = res.add[0];
  rowNode.setSelected(true);
}

// Remove 1 row under the group 'Ireland', '2002'
gridApi.applyServerSideTransaction({
    route: ['Ireland','2002'],
    remove: [
        {id: 24, name: 'Niall Crosby', status: 'Alive and kicking'}
    ]
});

// Add, remove and update a bunch of rows under 'United Kingdom'
gridApi.applyServerSideTransaction({
    route: ['United Kingdom'],
    add: [
        {id: 24, name: 'Niall Crosby', status: 'Alive and kicking'},
        {id: 25, name: 'Jillian Crosby', status: 'Alive and kicking'}
    ]
    update: [
        {id: 26, name: 'Kevin Flannagan', status: 'Alive and kicking'},
        {id: 27, name: 'Tony Smith', status: 'Alive and kicking'}
    ]
    remove: [
        {id: 28, name: 'Andrew Connel', status: 'Alive and kicking'},
        {id: 29, name: 'Bricker McGee', status: 'Alive and kicking'}
    ]
});

SNIPPET
) ?>


<p>
    Here is a basic example with no grouping and a small dataset.
</p>

<?= grid_example('Transactions Flat', 'transactions-flat', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<h2>Transaction API</h2>

<p>
    The full signature of the grid API <code>applyServerSideTransaction()</code> is as follows:
</p>

<?= createSnippet(<<<SNIPPET
// call this API to apply a transaction to the data inside the grid
function applyServerSideTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult;

// transaction record takes this shape
export interface ServerSideTransaction {

    // the Row Store to apply the transaction to, ie what group level.
    // eg ['Ireland','2002'] to update the child store found after expanding
    // Ireland and 2002 groups. passing in blank to empty applys the transation
    // to the top level.
    route?: string[];

    // rows to add.
    add?: any[];
    // index to add. if missing, rows will be added to the end
    addIndex?: number;

    // rows to remove.
    remove?: any[];

    // rows to update
    update?: any[];
}

// result object
export interface ServerSideTransactionResult {

    // the status of applying the transaction
    status: ServerSideTransactionResultStatus;

    // if rows were added, the newly created Row Nodes for those rows
    add?: RowNode[];

    // if rows were removed, the deleted Row Nodes
    remove?: RowNode[];

    // if rows were updated, the udpated Row Nodes
    update?: RowNode[];
}

export enum ServerSideTransactionResultStatus {

    // transaction was successully applied
    Applied = 'Applied',

    // store was not found, transaction not applied.
    // either invalid route, or the parent row has not yet been expanded.
    StoreNotFound = 'StoreNotFound',

    // store is loading, transaction not applied.
    StoreLoading = 'StoreLoading',

    // store is loading (as max loads exceeded), transaction not applied.
    StoreWaitingToLoad = 'StoreWaitingToLoad',

    // store load attempt failed, transaction not applied.
    StoreLoadingFailed = 'StoreLoadingFailed',

    // store is type Infinite, which doesn't accept transactions
    StoreWrongType = 'StoreWrongType',

    // transaction was cancelled, due to grid
    // callback isApplyServerSideTransaction() returning false
    Cancelled = 'Cancelled'
}

SNIPPET
) ?>

<h2>Matching Rows</h2>

<p>
    In order for the grid to find rows to update and remove, it needs a way to identify these rows.
    If the grid callback <code>getRowNodeId</code> is provided, the grid will match on row ID.
    Other the grid callback <code>getRowNodeId</code> is not provided, the grid will match on object
    reference.
</p>

<h2 id="targeting-stores">Targeting Stores</h2>

<p>
    When updating grouped data, a transaction needs to be targeted against the group. This is done by
    using the transaction's <code>route</code> attribute.
</p>

<p>
    If you require to update more than one store (ie update more than one group level), then a transaction
    needs to be applied for each individual store (group level) to update.
</p>

<p>
    The example below demonstrates applying transactions to a store with groups. Note the following:
</p>

<ul>
    <li>
        The buttons <b>New Palm Oil</b> and <b>New Rubber</b> will add one row to each group accordingly
        and print the result to the console.
    </li>
    <li>
        The button <b>New Wool & Amber</b> will add one item to each group. Note that two transactions are
        require to achieve this, one for each group, and print the results to the console.
    </li>
    <li>
        The button <b>New Product</b> will attempt to add an item to the top level, however it will fail
        as the top level has been configured to use an Infinite store.
    </li>
    <li>
        The button <b>Store State</b> will print to the console the state of the existing stores.
    </li>
</ul>

<?= grid_example('Transactions Hierarchy', 'transactions-hierarchy', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>



    <?php include '../documentation-main/documentation_footer.php';?>
