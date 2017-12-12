<?php
$pageTitle = "ag-Grid In Memory Row Model";
$pageDescription = "Row data in ag-Grid is stored internally in a row model. This page describes how this row model works and how to interact with it.";
$pageKeyboards = "ag-Grid data row model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 class="first-h1" id="in-memory-row-model">In Memory Row Model</h2>

    <p>
        The simplest row model to use is the In Memory Row Model. This row model takes
        all of the data to be displayed and provides the following features inside the grid:
        <ul>
            <li>Filtering</li>
            <li>Sorting</li>
            <li>Grouping*</li>
            <li>Aggregation*</li>
            <li>Pivoting*</li>
        </ul>
    * Grouping, Aggregation and Pivoting are available in ag-Grid Enterprise only.
    </p>

    <p>
        The in memory row model is the default row model for ag-Grid and used in all the examples
        (unless the example is explicitly demonstrating another row model). As such, the usage
        of the in memory row model is not explained in detail here. Please refer to the main
        parts of the grid documentation in how the features work with the in memory row model.
    </p>

    <h2>How It Works</h2>

    <p>
        You do not need to know how the in memory row model works, however it can be helpful
        for those who are interested.
    </p>
    <p>
        The in memory row model is responsible for working out how to display the rows inside the grid.
        It has a complex data structure, representing the data in difference states. The states are as follows:
        <ul>
        <li><b>State 1: Row Data:</b> Row data the application provides.</li>
        <li><b>State 2: All Rows:</b> Each data item the application provides wrapped in a rowNode object.</li>
        <li><b>State 3: Rows after Group:</b> After grouping applied to the rowNodes.</li>
        <li><b>State 4: Rows after Filter:</b> After filtering applied to the rowNodes.</li>
        <li><b>State 5: Rows after Sort:</b> After sort applied to the rowNodes.</li>
        <li><b>State 6: Rows after Map:</b> After mapping applied to the rowNodes.</li>
        </ul>
    </p>

    <p>
        The following is an example to help explain each of these steps.
    </p>

    <h4 id="state-1-row-data">State 1: Row Data</h4>

    <p>
        The data as provided by the application. The grid never modifies this array. It just takes the rowData
        items from it. The examples is of three data items.
    </p>

    <p>
        <i>Example Row Data</i>
        <br/>
        <img src="../javascript-grid-in-memory/allData.jpg"/>
    </p>

    <p><b>API:</b> There is no API to get this data. However it was provided by the application so you should already have it.</p>

    <h4 id="state-2-all-rows">State 2: All Rows</h4>

    <p>
        allRows is similar to rowData except a new array is created which contains rowNodes, each rowNode
        pointing to exactly one data item. The length of the allRows array is the same as the rowData array.
    </p>

    <p>
        <i>Example All Rows</i>
        <br/>
        <img src="../javascript-grid-in-memory/allRows.jpg"/>
    </p>

    <p><b>API:</b> There is no API to get this data. However there is no benefit over the rowsAfterGroup data.</p>

    <h4 id="state-3-rows-after-group">State 3: Rows After Group</h4>

    <p>
        rowsAfterGroup takes the allRows, and if grouping, groups the data. If no grouping is done, then
        rowsAfterGroup will be identical to allRows. The example shows grouping on the color field, creating
        two groups.
    </p>

    <p>
        <i>Example Rows After Group</i>
        <br/>
        <img src="../javascript-grid-in-memory/rowsAfterGroup.jpg"/>
    </p>

    <p><b>API:</b> Use api.forEachNode() to access this structure.</p>

    <h4 id="state-4-rows-after-filter">State 4: Rows After Filter</h4>

    <p>
        rowsAfterFilter goes through rowsAfterGroup and filters the data. The example shows filtering
        on the color black (thus removing the second group).
    </p>

    <p>
        <i>Example Rows After Filter</i>
        <br/>
        <img src="../javascript-grid-in-memory/rowsAfterFilter.jpg"/>
    </p>

    <p><b>API:</b> Use api.forEachNodeAfterFilter() to access this structure.</p>

    <h4 id="state-5-rows-after-sort">State 5: Rows After Sort</h4>

    <p>
        rowsAfterSort goes through rowsAfterFilter and sorts the data. The example shows sorting on
        car make.
    </p>

    <p>
        <i>Example Rows After Sort</i>
        <br/>
        <img src="../javascript-grid-in-memory/rowsAfterSort.jpg"/>
    </p>

    <p><b>API:</b> Use api.forEachNodeAfterFilterAndSort() to access this structure.</p>

    <h4 id="state-6-rows-after-map">State 6: Rows After Map</h4>

    <p>
        rowsAfterMap maps the data to what should be drawn inside the grid, taking into account
        what groups are open and closed. This list is what is iterated through when the grid
        draws the rows. Two examples are provided below. The first when open (so three rows in
        the grid, the group row plus two children),the second when closed (so one row in the
        grid, the closed group).
    </p>

    <p>
        <i>Example Rows After Map - Open Group</i>
        <br/>
        <img src="../javascript-grid-in-memory/rowsAfterMapOpen.jpg"/>
    </p>

    <p>
        <i>Example Rows After Map - Closed Group</i>
        <br/>
        <img src="../javascript-grid-in-memory/rowsAfterMapClosed.jpg"/>
    </p>

    <p><b>API:</b> Use api.getModel() and then model.getVirtualRowCount() and getVirtualRow() to get the nodes.</p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>