<?php
$pageTitle = "ag-Grid Immutable Stores";
$pageDescription = "In some applications it's desirable to bind the grid to an immutable store such that the grid's data is kept in sync with the store.";
$pageKeywords = "ag-Grid immutable store";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Client-Side Data - Immutable Data</h1>

    <p class="lead">
        In some applications it's desirable to bind the grid's <code>rowData</code> property to an immutable
        store such that the grid's data is kept in sync with the store.
    </p>

    <p>
        Under normal operation when new data is set into the grid (e.g. the <code>rowData</code> bound property
        is updated with new data)
        the grid assumes the new data is a brand new set of data. It is common for applications to desire this
        behaviour. However
        as explained in <a href="../javascript-grid-data-update/#setting-fresh-row-data">Setting Fresh Row Data</a>
        this can be undesirable as grid state (selected rows etc) is lost.
    </p>
    <p>
        For most applications, using grid <a href="../javascript-grid-data-update-transactions/">Transaction Updates</a>
        are what you should do if you want to make changes to the data set rather than replace it. However
        this is not in line with how applications based on immutable stores desire to work.
    </p>
    <p>
        In applications using
        immutable stores (eg React and Redux) it could be desired to treat changes to the bound
        <code>rowData</code> as updates to the current dataset rather than a brand new dataset.
        The grid has a mode of operation where it does exactly this.
        It works out what rows are added, removed and updated when new row data is provided by inspecting
        the new row data. This mode is called Immutable Data Mode and is enabled by setting the property
        <code>immutableData=true</code>.
    </p>

    <h2>How It Works</h2>

    <p>
        When in Immutable Data Mode, the grid assumes it is fed with data from an immutable store
        where the following is true about the data:
    </p>
    <ul>
        <li>Changes to a single row data item results in a new row data item object instance.</li>
        <li>Any changes within the list or row data results in a new list.</li>
    </ul>

    <p>
        For the Immutable Data Mode to work, you must be providing ID's for the row nodes as explained
        in <a href="../javascript-grid-row-node/#application-assigned-ids">Application Assigned ID's</a>.
    </p>

    <p>
        The grid works out what changes need to be applied to the grid using the following rules:
    </p>
    <ul class="content">
        <li>
            <b>IF</b> the ID for the new item doesn't have a corresponding item already in the grid
            <b>THEN</b> it's added as a new row to the grid.
        </li>
        <li>
            <b>IF</b> the ID for the new item does have a corresponding item in the grid
            <b>THEN</b> compare the object references. If the object references are different,
            the row is updated with the new data, otherwise it's assumed the data is the same as the already present data.
        </li>
        <li>
            <b>IF</b> there are items in the grid for which there are no corresponding items in the new data,
            <b>THEN</b> those rows are removed.
        </li>
        <li>
            Lastly the rows in the grid are sorted to match the order in the newly provided list.
        </li>
    </ul>

    <h2>Example: Immutable Store</h2>

    <p>
        The example below shows an immutable store in action. The example keeps a store of data
        locally. Each time the user does an update, the local store is replaced with a new store
        with the next data, and then <code>api.setRowData(store)</code> is called. This results
        in the grid updating the current data rather than replacing because we have set
        <code>immutableData=true</code>.
    </p>

    <p>
        If using bound properties with a framework, map the store to the <code>rowData</code> property instead
        of calling <code>api.setRowData()</code>.
    </p>

    <p>
        The example demonstrates the following:
    </p>

    <ul class="content">
        <li>
            <b>Reverse</b>: Reverses the order of the items.
        </li>
        <li>
            <b>Append Items</b>: Adds five items to the end.
        </li>
        <li>
            <b>Prepend Items</b>: Adds five items to the start.
        </li>
        <li>
            Not that if a grid sort is applied, the grid sorting order gets preference to the order
            of the data in the provided list.
        </li>
        <li>
            <b>Remove Selected</b>: Removes the selected items. Try selecting multiple rows (ctrl + click
            for multiple, or shift + click for range) and remove multiple rows at the same time. Notice
            how the remaining rows animate to new positions.
        </li>
        <li>
            <b>Update Prices</b>: Updates all the prices. Try ordering by price and notice the order
            change as the prices change. Also try highlighting a range on prices and see the aggregations
            appear in the status bar. As you update the prices, the aggregation values recalculate.
        </li>
        <li><b>Turn Grouping On / Off</b>: To turn grouping by symbol on and off.</li>
        <li><b>Group Selected A / B / C</b>: With grouping on, hit the buttons A, B and C to move
            selected items to that group. Notice how the rows animate to the new position.</li>
    </ul>

    <?= grid_example('Simple Immutable Store', 'simple-immutable-store', 'generated', ['enterprise' => true, 'exampleHeight' => 540]) ?>


    <h2>Example: Immutable Store - Large Dataset</h2>

    <p>
        Below is a dataset with over 11,000 rows with Row Grouping and Aggregation over three columns.
        As far as Client-Side Row Data goes, this is a fairly complex grid. From the example, note
        the following:
    </p>

    <ul class="content">
        <li>
            Property <code>immutableData=true</code> to put the grid into Immutable Data Mode.
        </li>
        <li>
            Selecting the Update button updates a range of the data.
        </li>
        <li>
            Note that all grid state (row and range selections, filters, sorting e.t.c) remain after
            updates are applied.
        </li>
    </ul>

    <?= grid_example('Complex Immutable Store', 'complex-immutable-store', 'generated', ['enterprise' => true, 'exampleHeight' => 590]) ?>

    <h2>Comparison to Transaction Updates</h2>

    <p>
        When in Immutable Data Mode and the grid receives new data, it creates a
        <a href="../javascript-grid-data-update-transactions/">Transaction Update</a> underneath the hood.
        In other words once the grid has worked out what rows have been added, updated and removed, it
        then creates a transaction with these details and applies it. This means all the operational
        benefits to Transaction Updates equally apply to Immutable Data Mode.
    </p>

    <p>
        There are however some difference with Immutable Data Mode and Transaction Updates which are as follows:
    </p>

    <ul>
        <li>
            When in Immutable Data Mode, the grid stores the data
            in the same order as the data was provided. For example if you provide a new list with data added
            in the middle of the list, the grid will also put the data into the middle of the list rather than
            just appending to the end. This decides the order of data when there is no grid sort applied. If
            this is not required by your application, then you can suppress this behaviour for a performance
            boost by setting <code>suppressMaintainUnsortedOrder=true</code>.
        </li>
        <li>
            There is no equivalent of <a href="../javascript-grid-data-update-high-frequency/">Async Transactions</a>
            when it comes to Delta Row Data Mode. If you want a grid that manages high frequency data changes, it is
            advised to not use Immutable Data Mode and use
            <a href="../javascript-grid-data-update-high-frequency/">Async Transactions</a> instead.
        </li>
    </ul>

<?php include '../documentation-main/documentation_footer.php';?>
