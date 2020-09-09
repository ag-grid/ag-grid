<?php
$pageTitle = "Client-Side Data - Transaction Updates";
$pageDescription = "Transaction Updates allow adding, removing or updating large numbers of rows inside the grid in an efficient manner.";
$pageKeywords = "ag-Grid Update Transaction";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Client-Side Data - Transaction Updates</h1>

<p class="lead">
    Transaction Updates allow adding, removing or updating large numbers of rows inside the grid
    in an efficient manner.
</p>

<p>
    Transaction Updates are excellent for applying large data changes with the following advantages:
</p>

<ul>
    <li>Efficient operation.</li>
    <li>Updates sort, filter, group, aggregation and pivot after changes applied.</li>
</ul>

<h2>Transaction Update API</h2>

<p>
    A transaction object contains the details of what rows should be added, removed and updated.
    The grid API <code>applyTransaction(transaction)</code> takes this transaction object
    and applies it to the grid's data.
</p>

<p>
    The result of the <code>applyTransaction(transaction)</code> is also a transaction, however it is a list
    of <a href="../javascript-grid-row-node/">Row Nodes</a> that were added, removed or updated. Both types
    of transactions look similar, but the difference is the data type they contain.
</p>

<ul>
    <li><b>Row Data Transaction</b>: Contains Row Data, the data that you are providing to the grid.</li>
    <li><b>Row Node Transaction</b>: Contains Row Nodes, the grid-created objects that wrap row data items.</li>
</ul>

<p>
    For each data item in a Row Data Transaction there will typically be a Row Node in Row Node Transaction
    wrapping that data item. The only exception is for edge cases, for example you tried to delete or update
    a data item that didn't exist.
</p>

<?= createSnippet(<<<SNIPPET
// Grid API method for accepting a transaction
function applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction;

// params for above
interface RowDataTransaction {

    // rows to add
    add?: any[];

    // rows to remove
    remove?: any[];

    // rows to update
    update?: any[];
}

// result for above
interface RowNodeTransaction {

    // Row Nodes added
    add: RowNode[];

    // Row Nodes removed
    remove: RowNode[];

    // Row Nodes updated
    update: RowNode[];
}
SNIPPET
, 'ts') ?>

<h2>Identifying Rows for Update and Remove</h2>

<p>
    When passing in data to be updated or removed, the grid will be asking:
</p>

<p style="margin-left: 10px;">
    <i>"What row do you mean exactly by this data item you are passing?"</i>
</p>
<p>
    There are two approaches you can take: 1) Providing Row Node IDs, or 2) Using Object References.
</p>

<ul>
    <li>
        <h3>Providing Row Node IDs</h3>

        <p>
            Each row inside the grid has a unique ID. As explained in
            <a href="../javascript-grid-row-node/#row-node-ids">Row Node IDs</a> the ID can be generated
            by the grid or it can be provided by the application. If the ID is provided by the application,
            the grid uses the ID to identify rows for updating and deleting.
        </p>

        <p>
            For updating rows, the grid will find the row with the same ID and then swap the data out for the
            newly provided data.
        </p>

        <p>
            For removing rows, the grid will find the row with the same ID and remove it. For this reason, the
            provided records within the <code>remove</code> array only need to have an ID present.
        </p>
    </li>
    <li>
        <h3>Using Object References</h3>

        <p>
            If you do not provide IDs for the rows, the grid will compare rows using object references.
            In other words when you provide a transaction with update or remove items, the grid will find
            those rows using the <code>===</code> operator on the data that you previously provided.
        </p>
        <p>
            When using object references, note the following:
        </p>
        <ol>
            <li>
                The same instance of the row data items should be used. Using another instance of the same
                object will stop the grid from making the comparison.
            </li>
            <li>
                Using object references for identification will be slow for large data sets, as the grid has
                no way of indexing rows based on object reference.
            </li>
        </ol>

    </li>
</ul>

<h2 id="example-updating-with-transaction">Example: Updating with Transaction</h2>

<p>
    The example applies transactions in different ways and prints
    the results of the call to the console. The following can be noted:
</p>

<ul class="content">
    <li>
        <b>Add Items</b>: Adds three items.
    </li>
    <li>
        <b>Update Top 2</b>: Updates the price on the first 2 rows in the list.
    </li>
    <li>
        <b>Remove Selected</b>: Removes all the selected rows from the list.
    </li>
    <li>
        <b>Get Row Data</b>: Prints all row data in the grid to the console.
    </li>
    <li>
        <b>Clear Data</b>: Sets the data in the grid to an empty list.
    </li>
</ul>

<?= grid_example('Updating with Transaction', 'updating-with-transaction', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<h2 id="example-updating-with-transaction-and-groups">Example: Updating with Transaction and Groups</h2>

<p>
    When using transactions and grouping, the groups are kept intact as you add, remove and update
    rows. The example below demonstrates the following:
</p>

<ul class="content">
    <li><b>Add For Sale:</b> Adds a new item to 'For Sale' group.</li>
    <li><b>Add In Workshop:</b> Adds a new item to 'In Workshop' group.</li>
    <li><b>Remove Selected:</b> Removes all selected items.</li>
    <li><b>Move to For Sale:</b> Move selected items to 'For Sale' group.</li>
    <li><b>Move to In Workshop:</b> Move selected items to 'In Workshop' group.</li>
    <li><b>Move to Sold:</b> Move selected items to 'Sold' group.</li>
    <li>When moving items, the grid animates the rows to the new location with minimal DOM updates.</li>
    <li><b>Get Row Data:</b> Prints all row data to the console.</li>
</ul>

<?= grid_example('Updating with Transaction and Groups', 'updating-with-transaction-and-groups', 'generated', ['enterprise' => true, 'modules' => ['clientside', 'rowgrouping'], 'reactFunctional' => true]) ?>

<h2 id="suppressAggAtRootLevel">Suppressing Top Level Aggregations</h2>

<p>
    When aggregations are present, the grid also aggregates
    all the top level rows into one parent row. This total aggregation is not shown in the grid so a
    speed increase can be produced by turning this top level aggregation off by setting
    <code>suppressAggAtRootLevel=true</code>. It is the intention that a future release of the grid
    will allow exposing the top level aggregation hence why this feature is left in.
</p>

<p>
    The example in the next section has this property enabled to provide a performance boost.
</p>

<h2 id="big-data-small-transactions">Localised Changes in Grouped Data</h2>

<p>
    When you apply a transaction to grouped data, the grid will only re-apply grouping, filtering
    and sorting to the impacted data.
</p>

<p>
    For example, suppose you have the grid with its rows grouped into 10 groups and a sort is applied
    on one column. If a transaction is applied to update one row, then the group that row sits within
    will be re-sorted as well as the top level group (as aggregations could impact values at the top
    level). All of the other 9 groups do not need to have their sorting re-applied.
</p>

<p>
    Deciding what groups need to be operated on within the grid is called Changed Path Selection. After
    the grid applies all adds, removes and updates from a transaction, it works out what groups
    were impacted and only executes the required operations on those groups. The groups that were impacted
    include each group with data that was changed, as well as all parents of changed groups all the way
    up to the top level.
</p>

<p>
    The example below demonstrates Changed Path Selection. The example is best viewed with the dev
    console open so log messages can be observed. Note the following:
</p>

<ul>
    <li>
        The 'Linux Distro' column is sorted with a custom comparator. The comparator records how many
        times it is called.
    </li>
    <li>
        The Value column is aggregated with a custom aggregator. The aggregator records
        how many times it is called.
    </li>
    <li>
        When the example first loads, all the data is set into the grid which results in 171 aggregation
        operations (one for each group), approximately 48,000 comparisons (for sorting all rows in each group,
        the number of sorts differs slightly dependent on the data values which are random in this example)
        and 10,000 filter
        passes (one for each row). The number of milliseconds to complete the operation is also printed (this
        value will depend on your hardware).
    </li>
    <li>
        Select a row and click 'Update', 'Delete' OR 'Duplicate' (duplicate results in an add operation).
        Note in the console that the number of aggregations, compares and filters is drastically fewer.
        The total time to execute is also drastically less.
    </li>
    <li>
        The property <a href="#suppressAggAtRootLevel"><code>suppressAggAtRootLevel=true</code></a> to prevent the grid from calculating
        aggregations at the top level.
    </li>
</ul>

<?= grid_example('Small Changes Big Data', 'small-changes-big-data', 'generated', ['enterprise' => true, 'modules' => ['clientside', 'rowgrouping'], 'reactFunctional' => true]) ?>

<note>
    Note that <a href="../javascript-grid-selection/#header-checkbox-selection">Header Checkbox Selection</a>
    is not turned on for the example above. If it was it would slow the grid down marginally as it requires each
    row to be checked (for selection state) between each update. If you need a blazing fast grid managing rapid
    changes, consider avoiding this feature.
</note>

<?php include '../documentation-main/documentation_footer.php';?>
