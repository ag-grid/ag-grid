<?php
$key = "InsertRemove";
$pageTitle = "ag-Grid Insert & Remove";
$pageDescription = "ag-Grid allows you to insert and remove rows into the grid without destroying the rows that are currently in the grid.";
$pageKeyboards = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="insert-remove">Data Update</h2>

    <p>
        Data can be updated in the grid in the following ways:
        <ol>
            <li>Using the grids <a href="../javascript-grid-cell-editing/">in-line editing</a> feature,
                eg double clicking on a cell and editing the value.</li>
            <li>Updating the data directly in your application - which the grid is not aware of the changes
                and you need to tell the grid to <a href="../javascript-grid-refresh/">refresh the view</a>.</li>
            <li>Updating the data using the grid's API - which the grid is in control of and refreshes accordingly.</li>
        </ol>
    </p>

    <p>
        This section of the documentation is regarding the last item above, updating the data
        using the grid's API.
    </p>

    <p>
        If you are using an immutable data store, as is usual in a React application, then you will be
        interested in the section below on updating using a transaction with immutable data.
    </p>

    <h2>Updating RowNodes Data</h2>

    <p>
        You can set the data onto a rowNode directly using the rowNodes API methods:
        <ul>
            <li><b>rowNode.setData(data):</b> Replaces the data on the rowNode. When
            complete, the grid will refresh the the entire rendered row if it is showing.</li>
            <li><b>rowNode.setDataValue(colKey, value):</b> Replaces the data on the
            rowNode for the specified column. When complete, the grid will refresh
            the rendered cell on the required row only.</li>
        </ul>
    </p>

    <p>
        Updating data via the rowNode methods will refresh the grid for the required
        rows if they are showing, however it will not update the grids sorting, filtering
        or grouping if the new data impacts such. For that, you should use an update
        transaction as explained below.
    </p>

    <p>
        Updating via the rowNode methods is supported in all row models.
    </p>

    <h3>Updating RowNodes Data Example</h3>

    <p>
        The example below demonstrates the following:
    </p>

    <ul>
        <li><b>Set Price on Toyota:</b> The price value is updated on the Toyota row and the grid refreshes the cell.</li>
        <li><b>Set Data on Ford:</b> The entire data is set on the Ford row and the grid refreshes the entire row.</li>
    </ul>

    <show-complex-example example="exampleGetRowNode.html"
                          sources="{
                                [
                                    { root: './', files: 'exampleGetRowNode.js,exampleGetRowNode.html' }
                                ]
                              }"
                          exampleheight="200px">
    </show-complex-example>


    <h2>Bulk Updating</h2>

    <p>
        If you want to update more than one row at a time, then you have the following options:
    </p>

    <p><b>Method 1 - Transaction</b></p>

    <p>
        The first method is to pass a transaction object to the grid containing rows to add, remove
        and update. This is done using <code>api.updateData(transaction)</code>. The grid keeps
        all active sorting, grouping and filtering, including updating to reflect the changes in
        the data should the sorting, grouping or filtering be impacted.
    </p>

    <p>
        Updating using transactions is the best way to do large updates to the grid, as the grid
        treats them as delta changes, so the grid only refreshes what is needed giving a performance
        boost. All row and range selection will be kept.
    </p>

    <p><b>Method 2 - Row Data (Normal)</b></p>

    <p>
        The next way is to replace all the row data in the grid be calling <code>api.setRowData(newData)</code>
        or by binding new data to the <code>rowData</code> property (if using a framework such as Angular or
        React that allow data binding). This is the default method. The grid will discard all previous
        data and create the rowNodes again from scratch. All row and range selection will be lost.
    </p>

    <p>
        Use this method if you are effectively loading brand new data into the grid, eg loading a new
        report with a completely different data set to the previous. This makes sure nothing is lying
        around from the old dataset.
    </p>

    <p><b>Method 3 - Row Data & Immutable Mode</b></p>

    <p>
        The final method is using the row data method above but having the property
        <code>enableImmutableMode=true</code>.
    </p>

    <p>
        When immutable mode is on, the grid will compare the new row data with the current row
        data and create a transaction object for you. The grid then executes the change as an
        update transaction, keeping all of the grids selections, filters etc.
    </p>

    <p>
        Use this if you want to
        manage the data outside of the grid (eg in a <b>Rudux</b> store) and then let the grid work out what changes are
        needed to keep the grid's version of the data up to date.
    </p>

    <h2>Bulk Method 1 - Transaction</h2>

    <p>
        The <code>api.updateData(transaction)</code> method takes a transaction as a paramter.
        The transaction has the following interface:
    </p>

    <pre><span class="codeComment">// interface for transaction for updating data</span>
interface RowDataTransaction {

    <span class="codeComment">// rows to add</span>
    add?: any[];
    <span class="codeComment">// index for rows to add</span>
    addIndex?: number,

    <span class="codeComment">// rows to remove</span>
    remove?: any[];

    <span class="codeComment">// rows to update</span>
    update?: any[];
}
</pre>

    <h3>Adding Rows</h3>

    <p>
        The grid will create one new row for each item in the <code>transaction.add</code> array.
    </p>

    <note>
        The index to add is put in for historical purposes and should not be used. If you want the
        grid to display in a certain order, you should apply a grid sort and have the row data sorted.
    </note>

    <h3>Removing Rows</h3>

    <p>
        The grid will remove one row for each item in the <code>transaction.remove</code> array.
    </p>

    <p>
        If you are providing rowNode ID's (via the <code>getRowNodeId()</code> callback) then the
        grid will match the rows based on ID. If you are not using ID's, then the grid will match
        the rows based on object reference.
    </p>

    <h3>Updating Rows</h3>

    <p>
        The grid will update one row for each item in the <code>transaction.remove</code> array.
        Behind the scenes, the grid will call <code>rowNode.setRowData(newData)</code>.
    </p>

    <p>
        Similar to removing, the grid will use node ID's if you are providing your own ID's,
        otherwise it will use object reference to identify rows.
    </p>

    <h3>Supported Row Models</h3>

    <p>
        The <a href="../javascript-grid-in-memory/">In Memory Row Model</a> fully supports the
        <code>api.updateData()</code> call. The
        <a href="../javascript-grid-infinite-scrolling/">Infinite Row Model</a> supports 'add'
        only (see the infinite docs for examples). The
        <a href="../javascript-grid-viewport/">Viewport Row Model</a> and
        <a href="../javascript-grid-enterprise-model/">Enterprise Row Model</a> do not support
        transaction updates.
    </p>

    <h3 id="example-updating-with-transaction">Example - Updating with Transaction</h3>

    <p>
        The example below demonstrates the following:
    </p>

    <ul>
        <li><b>Add Row</b>: Adds a row to the end of the list.</li>
        <li>
            <b>Insert Row @ 2</b>: Inserts a row at position 2 in the list. This works in the grid
            as it doesn't allow sorting, filtering or grouping (all of these would impact the order).
        </li>
        <li>
            <b>Update First 5</b>: Updates the price on the first 5 items in the list (add some items
            first so you have at least 5).
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
        <li>
            <b>Add Items</b>: Adds three items.
        </li>
    </ul>

    <show-example example="exampleInsertRemove"></show-example>

    <h3 id="example-updating-with-transaction-and-groups">Example - Updating with Transaction and Groups</h3>

    <p>
        When using transactions and grouping, the groups are kept intact as you add, remove and update
        rows. The example below demonstrates the following:
    </p>
    <ul>
        <li><b>Add For Sale:</b> Adds a new item to 'For Sale' group.</li>
        <li><b>Add In Workshop:</b> Adds a new item to 'In Workshop' group.</li>
        <li><b>Remove Selected:</b> Removes all selected items.</li>
        <li><b>Move to For Sale:</b> Move selected items to 'For Sale' group.</li>
        <li><b>Move to In Workshop:</b> Move selected items to 'In Workshop' group.</li>
        <li><b>Move to Sold:</b> Move selected items to 'Sold' group.</li>
        <li><b>Get Row Data:</b> Prints all row data to the console.</li>
    </ul>
    <p>
        Things to try with the below example include:
    </p>
    <ul>
        <li>Move rows between groups, see how the grid animates the rows to
            the new location with minimal DOM updates.</li>
        <li>Order by 'Created' and then add rows - notice how the new rows
            are always added to the top as they are ordered 'latest first'</li>
    </ul>

    <show-example example="exampleInsertRemoveGroups"></show-example>

    <h2>Bulk Method 2 - Row Data (Normal)</h2>

    <p>
        This is the simplest of the update methods. When you call <code>api.setRowData(newData)</code>,
        the grid discards all previous selections and filters, and completely overwrites the old data
        with the new. This was the first way the grid worked and is the most 'brute force' way.
    </p>

    <p>
        Use this method if you want to load the grid with a brand new set of data.
    </p>

    <p>
        The method <code>api.setRowData()</code> works with the
        <a href="../javascript-grid-in-memory/">In Memory Row Model</a> only. All of the other
        row models use a data source and hence it doesn't make sense.
    </p>

    <h2>Bulk Method 3 - Row Data & Immutable Mode</h2>

    <p>
        If you turn immutable mode on (set the property <code>enableImmutableMode=true</code>),
        then when you call <code>api.setRowData(rowData)</code> the grid will work out which
        items are to be added, removed and updated.
    </p>

    <note>
        The immutable mode is named as such because it allows ag-Grid to work with immutable
        stores such as Redux. In an immutable store, a new list of rowData is created if any row within it
        is added, removed or updated. If using React, consider using this property and bind
        you Redux managed data to the rowData property.
    </note>

    <p>
        For the immutable mode to work, you must be providing ID's for the row nodes by
        implementing the <code>getRowNodeId()</code> callback.
    </p>

    <p>
        The grid works out the delta changes with the following rules:
        <ul>
        <li><b>IF</b> the ID for the new item doesn't exist <b>THEN</b> it's an 'add'.</li>
        <li><b>IF</b> the ID for the new does exist <b>THEN</b> compare the object references.
        If the object references are different, it's an update, otherwise it's nothing (excluded form the transaction).</li>
        <li><b>IF</b> the ID for the old item doesn't exist in the new items <b>THEN</b> it's a 'remove'.</li>
        </ul>
    </p>

    <h3>Example - Immutable Store</h3>

    <p>
        The example below shows the immutable store in action. The example keeps a store of data
        locally. Each time the user does an update, the local store is replaced with a new store
        with the next data, and then <code>api.setRowData(store)</code> is called. This results
        in the grid making delta changes.
    </p>

    <p>
        If using React and Redux, simply map the store to the <code>rowData</code> property instead
        of calling <code>api.setRowData()</code>.
    </p>

    <p>
        The example demonstrates the following:
    </p>

    <ul>
        <li>
            <b>Add Five Items</b>: Adds five items to the list.
        </li>
        <li>
            <b>Remove Selected</b>: Removes the selected items. Try selecting multiple rows (ctrl + click
            for multiple, or shift + click for range) and remove multiple rows at the same time. Notice
            how the remaining rows animate to new positions.
        </li>
        <li>
            <b>Update Prices</b>: Updates all the prices. Try ordering by price and notice the order
            change as the prices change. Also try highlighting a range on prices and see the aggregations
            appear in the status panel. As you update the prices, the aggregation values recalculate.
        </li>
        <li><b>Turn Grouping On / Off</b>: To turn grouping by symbol on and off.</li>
        <li><b>Group Selected A / B / C</b>: With grouping on, hit the buttons A, B and C to move
        selected items to that group. Notice how the rows animate to the new position.</li>
    </ul>

    <show-example example="exampleSimpleImmutableStore"></show-example>

    <h3>Example - Immutable Store - Updates via Feed</h3>

    <p>
        Finally, lets go bananas with delta updates. Below is a simplistic trading hierarchy
        with over 11,000 rows with aggregations turned on. It has the following features:
    </p>
    <ul>
        <li>
            <b>Update Using Transaction</b>: Updates a small bunch of rows by creating a transaction
            with some rows to add, remove and update.
        </li>
        <li>
            <b>Update Using Immutable Store</b>: Same impact as the above, except it uses the
            immutable store approach with the grid. Thus it demonstrates both methods working
            side by side.
        </li>
        <li>
            <b>Start Feed</b>: Starts a feed whereby a transaction of data is processed every
            couple of seconds. This is intended to demonstrate a large grid with aggregations
            taking delta updates over the feed. The grids aggregations are updated on the fly
            to keep the summary values up to date.
        </li>
    </ul>

    <p>
        This example is best viewed in a new tab. It demonstrates a combination of features
        working together. In particular you should notice the grid is managing a very large set
        of data, applying delta updates to the data and only updating the UI where the updates
        have an impact (as opposed to recalculating everything from scratch when new values
        come in an requiring a full grid refresh). This gives a fast smooth user experience.
    </p>

    <p>
        You should also notice that all row selections, range selections, filters, sorting etc work
        even though the grid data is constantly updating.
    </p>

    <show-example example="exampleComplexImmutableStore"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
