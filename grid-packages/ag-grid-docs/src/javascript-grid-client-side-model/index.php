<?php
$pageTitle = "Client-Side Data";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the simplest one is the Client-Side model. We recommend using this as a default.";
$pageKeywords = "ag-Grid data row model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1>Client-Side Data</h1>

<p class="lead">
    By default the grid expects you to provide all the data up front. In other words, your application
    loads the full set of data into the client and then passes it in its entirety to the grid.
    This is in contrast to <a href="../javascript-grid-row-models/">Server-Side Data</a> where the data
    is mostly kept on the server and loaded into the grid in parts.
</p>

<h2>Row Models</h2>

<p>
    The grid has different Row Models depending on whether you want to use client-side or server-side
    data. There is only one client-side row model, aptly named the "Client-Side Row Model".
    You don't need to configure the grid to use the Client-Side Row Model as it's used by default.
    Check <a href="../javascript-grid-row-models/">Server-Side Data</a> to see what other row models
    are available and how to use them.
</p>

<h2>Client-Side Row-Model</h2>

<p>
    Once the grid has all of the data, it can perform many operations on it for you, such as filtering,
    sorting and grouping.
</p>

<h2>Deep Dive (advanced section)</h2>

<p>
    You do not need to know how the Client-Side Row Model works, however it can be helpful
    for those who are interested.
</p>

<p>
    The Client-Side Row Model is responsible for working out how to display the rows inside the grid.
    It has a complex data structure, representing the data in different states. The states are as follows:
</p>

<h4>State 1: Row Data</h4>

<p>
    The data as provided by the application. The grid never modifies this array. It just takes the <code>rowData</code>
    items from it. This example is of three data items.
</p>

<figure class="figure">
    <img src="../javascript-grid-client-side-model/allData.jpg" alt="Row Data">
    <figcaption class="figure-caption">Example: Row Data</figcaption>
</figure>

<p><b>API:</b> There is no API to get this data. However it was provided by the application so you should already have it.</p>

<h4>State 2: All Rows</h4>

<p>
    <code>allRows</code> is similar to <code>rowData</code> except a new array is created which contains row nodes, with each row node
    pointing to exactly one data item. The length of the <code>allRows</code> array is the same as the <code>rowData</code> array.
</p>

<figure class="figure">
    <img alt="All Rows" src="../javascript-grid-client-side-model/allRows.jpg"/>
    <figcaption class="figure-caption">Example: All Rows</figcaption>
</figure>

<p><b>API:</b> There is no API to get this data. However there is no benefit over the <code>rowsAfterGroup</code> data.</p>

<h4>State 3: Rows After Group</h4>

<p>
    <code>rowsAfterGroup</code> takes <code>allRows</code>, and if grouping, groups the data. If no grouping is done, then
    <code>rowsAfterGroup</code> will be identical to <code>allRows</code>. This example shows grouping on the colour field, creating
    two groups.
</p>
<figure class="figure">
    <img alt="Rows After Group" src="../javascript-grid-client-side-model/rowsAfterGroup.jpg"/>
    <figcaption class="figure-caption">Example: Rows After Group</figcaption>
</figure>

<p><b>API:</b> Use <code>api.forEachNode()</code> to access this structure.</p>

<h4>State 4: Rows After Filter</h4>

<p>
    <code>rowsAfterFilter</code> goes through <code>rowsAfterGroup</code> and filters the data. This example shows filtering
    on the colour black (thus removing the second group).
</p>

<figure class="figure">
    <img alt="Rows After Filter" src="../javascript-grid-client-side-model/rowsAfterFilter.jpg"/>
    <figcaption class="figure-caption">Example: Rows After Filter</figcaption>
</figure>

<p><b>API:</b> Use <code>api.forEachNodeAfterFilter()</code> to access this structure.</p>

<h4>State 5: Rows After Sort</h4>

<p>
    <code>rowsAfterSort</code> goes through <code>rowsAfterFilter</code> and sorts the data. This example shows sorting on
    car make.
</p>

<figure class="figure">
    <img alt="Rows After Sort" src="../javascript-grid-client-side-model/rowsAfterSort.jpg"/>
    <figcaption class="figure-caption">Example: Rows After Sort</figcaption>
</figure>

<p><b>API:</b> Use <code>api.forEachNodeAfterFilterAndSort()</code> to access this structure.</p>

<h4>State 6: Rows After Map</h4>

<p>
    <code>rowsAfterMap</code> maps the data to what should be drawn inside the grid, taking into account
    what groups are open and closed. This list is what is iterated through when the grid
    draws the rows. Two examples are provided below, the first when open (so three rows in
    the grid, the group row plus two children), the second when closed (so one row in the
    grid, the closed group).
</p>

<figure class="figure">
    <img alt="Rows After Map - Open Group" src="../javascript-grid-client-side-model/rowsAfterMapOpen.jpg"/>
    <figcaption class="figure-caption">Example: Rows After Map - Open Group</figcaption>
</figure>
<figure class="figure">
    <img alt="Rows After Map - Closed Group" src="../javascript-grid-client-side-model/rowsAfterMapClosed.jpg"/>
    <figcaption class="figure-caption">Example: Rows After Map - Closed Group</figcaption>
</figure>

<p><b>API:</b> Use <code>api.getModel()</code> and then <code>model.getVirtualRowCount()</code> and <code>getVirtualRow()</code> to get the nodes.</p>


<h2>Refreshing the Client-Side Model</h2>

<p id="refreshClientSideRowModel">
    If you do want to refresh the Client-Side Row Model,
     call <code>api.refreshClientSideRowModel(startingStage)</code>,
    where <code>startingStage</code> can be one of the stages above, i.e.:
</p>

<ol>
    <li><code>group</code></li>
    <li><code>filter</code></li>
    <li><code>pivot</code></li>
    <li><code>aggregate</code></li>
    <li><code>sort</code></li>
    <li><code>map</code></li>
</ol>

<p>
    Because each stage depends on the stage before, refreshing any particular stage means that stage executes and then
    all the stages after it will also execute again.
    For example if you call <code>api.refreshClientSideRowModel('filter')</code> it will execute the stages
    Filter, Pivot, Aggregate, Sort and Map.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
