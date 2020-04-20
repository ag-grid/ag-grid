<?php
$pageTitle = "Updating Data: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Updating Data. Data can be updated in real time. The grid can highlight the change by flashing the cells or by animation inside the cell as the cell refreshes. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Client-side Data - Immutable Stores</h1>

    <p class="lead">
        If you turn on deltaRowDataMode (set the property <code>deltaRowDataMode=true</code>),
        then when you call <code>api.setRowData(rowData)</code> the grid will work out which
        items are to be added, removed and updated.
    </p>

    <p>
        For this to work, you must be treating your data as immutable. This means instead of
        updating records, you should replace the record with a new object.
    </p>

    <note>
        <p>
            The deltaRowDataMode is designed to allow ag-Grid work with immutable
            stores such as Redux. In an immutable store, a new list of rowData is created if any row within it
            is added, removed or updated. If using React and Redux, consider setting <code>deltaRowDataMode=true</code>
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
        implementing the <code>getRowNodeId()</code> callback. Remember ID's must be unique
        and must not change.
    </p>

    <p>
        The grid works out the delta changes with the following rules:
    </p>
    <ul class="content">
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

    <h3>Example: Immutable Store</h3>

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

    <ul class="content">
        <li>
            <b>Append Items</b>: Adds five items to the end (assuming when no sort applied <b>*</b>).
        </li>
        <li>
            <b>Prepend Items</b>: Adds five items to the start (assuming when no sort applied <b>*</b>).
        </li>
        <li>
            <b>Reverse</b>: Reverses the order of the items (assuming when no sort applied <b>*</b>).
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

    <note>
        <b>*</b>assuming no sort is applied - because if the grid is sorting, then the grid sort will override
        any order in the provided data.
    </note>

    <?= grid_example('Simple Immutable Store', 'simple-immutable-store', 'generated', ['enterprise' => true, 'exampleHeight' => 540]) ?>


    <h3>Example: Immutable Store - Updates via Feed</h3>

    <p>
        Finally, lets go bananas with delta updates. Below is a simplistic trading hierarchy
        with over 11,000 rows with aggregations turned on. It has the following features:
    </p>

    <ul class="content">
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
