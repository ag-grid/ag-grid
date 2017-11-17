<?php
$key = "DataUpdate";
$pageTitle = "ag-Grid Data Update";
$pageDescription = "ag-Grid allows you to insert and remove rows into the grid without destroying the rows that are currently in the grid.";
$pageKeyboards = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="insert-remove">Updating Data</h2>

    <p>
        Data can be updated inside the grid using the grid's API.
    </p>
    <p>
        The grid also allows updating data in the following other ways which are explained in other
        sections of the documentation:
        <ol>
            <li>Using the grids <a href="../javascript-grid-cell-editing">in-line editing</a> feature,
                eg double clicking on a cell and editing the value.</li>
            <li>Updating the data directly in your application - which the grid is not aware of the changes
                and you need to tell the grid to <a href="../javascript-grid-refresh">refresh the view</a>.</li>
        </ol>
    </p>

    <p>
        This section of the documentation is regarding using the grid's API to update data. The grid
        will then be aware of the change and also update the relevant parts of the UI.
    </p>

    <p>
        If you are using an immutable data store, as is usual in a React application, then you will be
        interested in the section below <a href=".#delta-row-data">Bulk Method 3 - Delta Row Data</a>.
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
        Updating via the rowNode methods is supported in all row models.
    </p>

    <p>
        Updating data via the rowNode methods will refresh the grid for the required
        rows if they are showing, however it will not update the grids sorting, filtering
        or grouping if the new data impacts such. For that, you should use an update
        transaction as explained below.
    </p>

    <note>
        Updating data using <i>rowNode.setData()</i> and <i>rowNode.setDataValue()</i> do
        not update the sorting, filtering or grouping. Using an update transaction
        (explained below) does update the sorting, filtering and grouping.
    </note>

    <p id="refreshInMemoryRowModel">
        If you are using <a href="../javascript-grid-in-memory/">In Memory Row Model</a>
        and you want to get the grid to update it's sort or filter etc after the update
        is done, then you must call <code>api.refreshInMemoryRowModel(step)</code>
        where step can be one of the following: group, filter, map, aggregate,
        sort, pivot.
    </p>

    <note>
        The <a href="../javascript-grid-in-memory/">In Memory Row Model</a> has stages as follows:<br/>
        <ul>
            <li>
                Group &rArr; Filter &rArr; Pivot &rArr; Aggregate &rArr; Sort &rArr; Map<br/>
            </li>
        </ul>
        That means, if you call <i>api.refreshInMemoryRowModel('filter')</i>, it will
        also execute pivot, aggregate, sort and map.
    </note>

    <h3>Updating RowNodes Data Example</h3>

    <p>
        The example below demonstrates the following:
    </p>

    <ul>
        <li><b>Set Price on Toyota:</b> The price value is updated on the Toyota row and the grid refreshes the cell.</li>
        <li><b>Set Data on Ford:</b> The entire data is set on the Ford row and the grid refreshes the entire row.</li>
        <li><b>Sort:</b> Re-runs the sort in the In Memory Row Model - to see this in action, sort the data first, then
        edit the data so the sort is broken, then hit this button to fix the sort.</li>
        <li><b>Filter:</b> Re-runs the filter in the In Memory Row Model - to see this in action, filter the data first, then
        edit the data so the filter is broken (ie a row is present that should not be present), then hit this button to fix the filter.</li>
    </ul>

    <?= example('Updating Row Nodes', 'updating-row-nodes', 'generated') ?>

    <h2 id="bulk-updating">Bulk Updating</h2>

    <p>
        If you want to update more than one row at a time, then you have the following options:
    </p>

    <p><b>Method 1 - Transaction</b></p>

    <p>
        The first method is to pass a transaction object to the grid containing rows to add, remove
        and update. This is done using <code>api.updateRowData(transaction)</code>. The grid keeps
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

    <p><b>Method 3 - Delta Row Data</b></p>

    <p>
        The final method is using the row data method above but having the property
        <code>deltaRowDataMode=true</code>.
    </p>

    <p>
        When deltaRowDataMode is on, the grid will compare the new row data with the current row
        data and create a transaction object for you. The grid then executes the change as an
        update transaction, keeping all of the grids selections, filters etc.
    </p>

    <p>
        Use this if you want to
        manage the data outside of the grid (eg in a <b>Redux</b> store) and then let the grid work out
        what changes are needed to keep the grid's version of the data up to date.
    </p>

    <h2 id="transactions">Bulk Method 1 - Transaction</h2>

    <p>
        The <code>api.updateRowData(transaction)</code> takes details of what data items to update
        and then returns all the impacted row nodes.
    </p>

    <snippet>
// API method for updating data
function updateRowData(rowDataTransaction: RowDataTransaction): RowNodeTransaction;

// params for above
interface RowDataTransaction {

    // rows to add
    add?: any[];
    // index for rows to add
    addIndex?: number,

    // rows to remove
    remove?: any[];

    // rows to update
    update?: any[];
}

// result for above
interface RowDataTransaction {

    // Row Nodes added
    add: RowNode[];

    // Row Nodes removed
    remove: RowNode[];

    // Row Nodes updated
    update: RowNode[];
}</snippet>

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
        If you are providing rowNode ID's (via the <code>getRowNodeId()</code> callback) then pass an array of objects with keys corresponding to the rowNodeId you specified with <code>getRowNodeId</code> and values matching the rows you want to remove. If you are not using ID's, then the grid will match
        the rows based on object reference.
    </p>

    <h3>Updating Rows</h3>

    <p>
        The grid will update one row for each item in the <code>transaction.update</code> array.
        Behind the scenes, the grid will call <code>rowNode.setRowData(newData)</code>.
    </p>

    <p>
        Similar to removing, the grid will use node ID's if you are providing your own ID's,
        otherwise it will use object reference to identify rows.
    </p>

    <note>
        For adding and removing rows using a transaction, the grid will match rows based on
        ID's if you are providing your own rowNode ID's. Otherwise it will use object references.
    </note>

    <h3>Supported Row Models</h3>

    <p>
        The <a href="../javascript-grid-in-memory">In Memory Row Model</a> fully supports the
        <code>api.updateRowData()</code> call. The
        <a href="../javascript-grid-infinite-scrolling">Infinite Row Model</a> supports 'add'
        only (see the infinite docs for examples). The
        <a href="../javascript-grid-viewport">Viewport Row Model</a> and
        <a href="../javascript-grid-enterprise-model">Enterprise Row Model</a> do not support
        transaction updates.
    </p>

    <h3 id="example-updating-with-transaction">Example - Updating with Transaction</h3>

    <p>
        The example uses the <code>updateRowData</code> method in different ways and prints
        the results of the call to the console. The following can be noted:
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
        <li>
            <b>Add Items</b>: Adds three items at position 2.
        </li>
    </ul>

    <?= example('Updating with Transaction', 'updating-with-transaction', 'generated') ?>

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

    <?= example('Updating with Transaction and Groups', 'updating-with-transaction-and-groups', 'generated', array("enterprise" => 1)) ?>


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
        <a href="../javascript-grid-in-memory">In Memory Row Model</a> only. All of the other
        row models use a data source and hence it doesn't make sense.
    </p>

    <h2 id="delta-row-data">Bulk Method 3 - Delta Row Data</h2>

    <p>
        If you turn on deltaRowDataMode (set the property <code>deltaRowDataMode=true</code>),
        then when you call <code>api.setRowData(rowData)</code> the grid will work out which
        items are to be added, removed and updated.
    </p>

    <note>
        <p>
            The deltaRowDataMode is designed to allow ag-Grid work with immutable
            stores such as Redux. In an immutable store, a new list of rowData is created if any row within it
            is added, removed or updated. If using React and Redux, consider setting <i>deltaRowDataMode=true</i>
            and bind your Redux managed data to the rowData property.
        </p>
        <p>
            You can also use this technique in a non-Redux or immutable store based application (which is the
            case in the examples on this page). As long as you understand what is happening, if it fits your
            applications needs, then use it.
        </p>
    </note>

    <p>
        For the deltaRowDataMode to work, you must be providing ID's for the row nodes by
        implementing the <code>getRowNodeId()</code> callback.
    </p>

    <p>
        The grid works out the delta changes with the following rules:
        <ul>
            <li>
                <b>IF</b> the ID for the new item doesn't have a corresponding item already in the grid
                <b>THEN</b> it's an 'add'.
            </li>
            <li>
                <b>IF</b> the ID for the new item does have a corresponding item in the grid
                <b>THEN</b> compare the object references. If the object references are different,
                it's an update, otherwise it's nothing (excluded from the transaction).
            </li>
            <li>
                <b>IF</b> there are items in the grid for which there are no corresponding items in the new data,
                <b>THEN</b> it's a 'remove'.
            </li>
        </ul>
    </p>

    <h3>Example - Immutable Store</h3>

    <p>
        The example below shows the immutable store in action. The example keeps a store of data
        locally. Each time the user does an update, the local store is replaced with a new store
        with the next data, and then <code>api.setRowData(store)</code> is called. This results
        in the grid making delta changes because we have set <code>deltaRowDataMode=true</code>.
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
            <b>Append Items</b>: Adds five items to the end ((assuming when no sort applied*).
        </li>
        <li>
            <b>Prepend Items</b>: Adds five items to the start (assuming when no sort applied*).
        </li>
        <li>
            <b>Reverse</b>: Reverses the order of the items (assuming when no sort applied*).
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

    <p><i>
        *assuming when no sort applied - because if the grid is sorting, then the grid sort will override any order
        in the provided data.
    </i></p>

    <?= example('Simple Immutable Store', 'simple-immutable-store', 'generated', array("enterprise" => 1)) ?>


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
            <b>Update Using Delta updates</b>: Same impact as the above, except it uses the
            delta updates with the grid. Thus it demonstrates both methods working
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

    <?= example('Complex Immutable Store', 'complex-immutable-store', 'generated', array("enterprise" => 1)) ?>

    <h2 id="flashing">Flashing Data Changes</h2>

    <p>
        If you want the grid to flash the cell when the data changes, set attribute
        <code>colDef.enableCellChangeFlash=true</code>. In the example below, when you click
        'Update Some Data', the data is changed in 20 random cells and the grid flashes the cells.
    </p>

    <note>
        This is a simple and quick way to visually show to the user that the data has changed.
        It is also possible to have more intelligent animations by putting animations into custom
        cell renderer's. Check out the grid provided
        <a href="../javascript-grid-cell-rendering/#animate-renderer">animation cell renderer's</a>
        or look at implementing your own refresh in a
        <a href="../javascript-grid-cell-rendering-components/">custom cell renderer</a>.
    </note>

    <?= example('Flashing Data Changes', 'flashing-data-changes', 'generated', array("enterprise" => 1)) ?>

    <h3>How Flashing Works</h3>

    <p>
        Each time the call value is changed, the grid adds the CSS class <code>ag-cell-data-changed</code>
        for 500ms, and then then CSS class <code>ag-cell-data-changed-animation</code> for 1,000ms.
        The grid provide themes use this to apply a background color (for the first 500ms) and then a fade
        out transition (for the remaining 1,000ms).
    </p>

    <p>
        If you want to override how the flash presents itself (eg change the background color, or remove
        the animation) then override the relevant CSS classes.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
