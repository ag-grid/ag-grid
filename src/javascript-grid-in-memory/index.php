<?php
$pageTitle = "ag-Grid Row Models: In Memory Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the simplest one is the In Memory model. We recommend using this as a default.";
$pageKeyboards = "ag-Grid data row model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

    <h1>In Memory Row Model</h1>

    <p>
        The simplest row model to use is the In Memory Row Model. This row model takes
        all of the data to be displayed and provides the following features inside the grid:
</p>
        <ul class="content">
            <li>Filtering</li>
            <li>Sorting</li>
            <li>Grouping*</li>
            <li>Aggregation*</li>
            <li>Pivoting*</li>
        </ul>

    <note>* Grouping, Aggregation and Pivoting are available in ag-Grid Enterprise only.</note>

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
    </p>

    <p>
        The following is an example to help explain each of these steps.
    </p>

    <h3>State 1: Row Data</h3>

    <p>
        The data as provided by the application. The grid never modifies this array. It just takes the rowData
        items from it. The examples is of three data items.
    </p>

    <figure class="figure">
      <img class="fugure-img" src="../javascript-grid-in-memory/allData.jpg" alt="Row Data"> 
      <figcaption class="figure-caption">Example: Row Data</figcaption>
    </figure>

    <p><b>API:</b> There is no API to get this data. However it was provided by the application so you should already have it.</p>

    <h3>State 2: All Rows</h3>

    <p>
        <code>allRows</code> is similar to <code>rowData</code> except a new array is created which contains row nodes, each row node
        pointing to exactly one data item. The length of the <code>allRows</code> array is the same as the <code>rowData</code> array.
    </p>

    <figure class="figure">
      <img class="fugure-img" alt="All Rows" src="../javascript-grid-in-memory/allRows.jpg"/> 
      <figcaption class="figure-caption">Example: All Rows</figcaption>
    </figure>

    <p><b>API:</b> There is no API to get this data. However there is no benefit over the rowsAfterGroup data.</p>

    <h3>State 3: Rows After Group</h3>

    <p>
        rowsAfterGroup takes the allRows, and if grouping, groups the data. If no grouping is done, then
        rowsAfterGroup will be identical to allRows. The example shows grouping on the color field, creating
        two groups.
    </p>
    <figure class="figure">
      <img class="fugure-img" alt="Rows After Group" src="../javascript-grid-in-memory/rowsAfterGroup.jpg"/> 
      <figcaption class="figure-caption">Example: Rows After Group</figcaption>
    </figure>

    <p><b>API:</b> Use <code>api.forEachNode()</code> to access this structure.</p>

    <h3>State 4: Rows After Filter</h3>

    <p>
        <code>rowsAfterFilter</code> goes through <code>rowsAfterGroup</code> and filters the data. The example shows filtering
        on the color black (thus removing the second group).
    </p>

    <figure class="figure">
      <img class="fugure-img" alt="Rows After Filter" src="../javascript-grid-in-memory/rowsAfterFilter.jpg"/> 
      <figcaption class="figure-caption">Example: Rows After Filter</figcaption>
    </figure>

    <p><b>API:</b> Use <code>api.forEachNodeAfterFilter()</code> to access this structure.</p>

    <h3>State 5: Rows After Sort</h3>

    <p>
        <code>rowsAfterSort</code> goes through <code>rowsAfterFilter</code> and sorts the data. The example shows sorting on
        car make.
    </p>

    <figure class="figure">
      <img class="fugure-img" alt="Rows After Sort" src="../javascript-grid-in-memory/rowsAfterSort.jpg"/> 
      <figcaption class="figure-caption">Example: Rows After Sort</figcaption>
    </figure>

    <p><b>API:</b> Use <code>api.forEachNodeAfterFilterAndSort()</code> to access this structure.</p>

    <h3>State 6: Rows After Map</h3>

    <p>
        <code>rowsAfterMap</code> maps the data to what should be drawn inside the grid, taking into account
        what groups are open and closed. This list is what is iterated through when the grid
        draws the rows. Two examples are provided below. The first when open (so three rows in
        the grid, the group row plus two children), the second when closed (so one row in the
        grid, the closed group).
    </p>

    <figure class="figure">
      <img class="fugure-img" alt="Rows After Map - Open Group" src="../javascript-grid-in-memory/rowsAfterMapOpen.jpg"/> 
      <figcaption class="figure-caption">Example: Rows After Map - Open Group</figcaption>
    </figure>
    <figure class="figure">
      <img class="fugure-img" alt="Rows After Map - Closed Group" src="../javascript-grid-in-memory/rowsAfterMapClosed.jpg"/> 
      <figcaption class="figure-caption">Example: Rows After Map - Closed Group</figcaption>
    </figure>

    <p><b>API:</b> Use <code>api.getModel()</code> and then <code>model.getVirtualRowCount()</code> and <code>getVirtualRow()</code> to get the nodes.</p>



<?php include '../documentation-main/documentation_footer.php';?>