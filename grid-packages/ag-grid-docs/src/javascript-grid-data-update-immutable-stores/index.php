<?php
$pageTitle = "Updating Data: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Updating Data. Data can be updated in real time. The grid can highlight the change by flashing the cells or by animation inside the cell as the cell refreshes. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Client-side Data - Immutable Stores</h1>

    <p class="lead">
        In some applications it's desirable to bind the grid's Row Data to an external store such that the
        grid gives an up to date representation of the store. This means any data changes to the data store (sorting,
        filtering, adding / removing / updating of rows) will be represented inside the grid.
    </p>

    <p>
        By default when new data is set into the grid (either by updating the bound property
        <code>rowData</code> or by calling the grid API method <code>setRowData()</code>),
        the grid replaces the data in the grid with the new set of data.
        As explained in <a href="../javascript-grid-data-update/#bulk-updating">Setting Fresh Row Data</a>
        this can be undesirable as grid state (selected rows etc) is lost as well as any animation transitions
        (eg rows sliding into position after a sort, or cells showing animations as values change).
    </p>
    <p>
        In applications using
        immutable stores (eg React and Redux) it would be preferable to treat changes to the bound
        <code>rowData</code> as updates from an immutable store. The grid has a mode of operation where
        it works out what rows are added, removed and updated when new row data is provided by inspecting
        the new row data. This modes is called Delta Row Data Mode and is enabled by setting the property
        <code>deltaRowDataMode=true</code>.
    </p>

    <p>
        For this to work, you must be treating your data as immutable. This means instead of
        updating records, you should replace the record with a new object.
    </p>

    <p>
        For the Delta Row Data Mode to work, you must be providing ID's for the row nodes as explained
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

    <h3>Example: Immutable Store</h3>

    <p>
        The example below shows the immutable store in action. The example keeps a store of data
        locally. Each time the user does an update, the local store is replaced with a new store
        with the next data, and then <code>api.setRowData(store)</code> is called. This results
        in the grid making delta changes because we have set <code>deltaRowDataMode=true</code>.
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


    <h3>Example: Immutable Store - Large Dataset</h3>

    <p>
        Below is a dataset with over 11,000 rows with Row Grouping and Aggregation over three columns.
        As far as Client-side Row Data goes, this is a fairly complex grid. From the example, note
        the following:
    </p>

    <ul class="content">
        <li>
            Property <code>deltaRowDataMode=true</code> to put the grid into Delta Row Data Mode.
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


    <h2 id="big-data-small-transactions">Small Changes in Large Grouped Data</h2>

    <p>
        When grouping, the grid will group, sort, filter and aggregate each individual
        group. When there is a lot of data and a lot of groups then this results
        in a lot of computation required for all the data operations.
    </p>
    <p>
        If using <a href="#transactions">transaction updates</a> then the grid does not execute all
        the operations (sort, filter etc) on all the rows. Instead it only re-computes what was
        impacted by a transaction.
    </p>
    <p>
        For example, if items are grouped by city, and a value for each city is summed at the city
        level, then if the value changes for one item, only the aggregation for the city it belongs
        to needs be recomputed. All other groups where data did not change do not need to be recomputed.
    </p>
    <p>
        Deciding what groups need to be operated on again is called Changed Path Selection. After
        the grid applies all adds, removes and updates from a transaction, it works out what groups
        got impacted and only executes the required operations on those groups.
    </p>
    <p>
        Under the hood <a href="#delta-row-data">delta row data</a> uses transactions in the grid,
        so Changed Path Selection applies also when using delta row update.
    </p>

    <p>
        The example below demonstrates Changed Path Selection. The example is best view with the dev
        console open so log messages can be observed. Note the following:
    </p>

    <ul>
        <li>The 'Linux Distro' column is sorted with a custom comparator. The comparator records how many
            times it is called.</li>
        <li>The Value column is aggregated with a custom aggregator. The aggregator records
            how many times it is called.</li>
        <li>When the example first loads, all the data is set into the grid which results in 171 aggregation
            operations (one for each group), 48,131 comparisons (for sorting all rows in each group) and 10,000 filter
            passes (one for each row). The number of milliseconds to complete the operation is also printed (this
            value will depend on your hardware).</li>
        <li>Select a row and click 'Update', 'Delete' OR 'Duplicate' (duplicate results in an add operation).
            Note in the console that the number of aggregations, compares and filters is drastically less.
            The total time to execute is also drastically less</li>
    </ul>

    <?= grid_example('Small Changes Big Data', 'small-changes-big-data', 'generated', ['enterprise' => true]) ?>

    <p>
        Note that the example above also uses the following properties to gain performance:
    </p>

    <ul>
        <li><code>suppressMaintainUnsortedOrder</code>: When doing delta updates, the grid stores the data
            in the same order as the data was provided. For example if you provide a new list with data added
            in the middle of the list, the grid will also put the data into the middle of the list rather than
            just appending to the end. This decides the order of data when there is no grid sort applied. If
            this is not required by your application, then you can suppress this behaviour by setting
            <code>suppressMaintainUnsortedOrder=true</code>.
        </li>
        <li><code>suppressAggAtRootLevel</code>: When aggregations are present, the grid also aggregates
            all the top level rows into one parent row. This total aggregation is not shown in the grid so a
            speed increase can be produced by turning this top level aggregation of by setting
            <code>suppressAggAtRootLevel=true</code>. It is the intention that a future release of the grid
            will allow exposing the top level aggregation hence why this feature is left in.
        </li>
    </ul>

    <p>
        Also note that the example above does NOT do the following (again for performance reasons):
    </p>

    <ul>
        <li>
            Header Checkbox Selection: <a href="../javascript-grid-selection/#header-checkbox-selection">Header Checkbox Selection</a>
            will slow the grid down marginally as it requires each row to be checked (for selection state) between each update. If you need
            a blasting fast grid managing rapid changes, then consider avoiding this feature.
        </li>
    </ul>

<?php include '../documentation-main/documentation_footer.php';?>
