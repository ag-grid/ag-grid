<?php
$key = "Refresh";
$pageTitle = "ag-Grid Refresh";
$pageDescription = "It is possible to refresh ag-Grid in many ways. This page explains how to refresh cells inside the grid.";
$pageKeyboards = "ag-Grid Refresh";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1">Change Detection</h1>

    <p>
        The grid has built in change detection so when you change cells value, all dependent
        cells will also change reflect the change. Dependent cells are cells that are one of
        the following:
        <ul>
            <li>
                Cells using <a href="../javascript-grid-value-getters/">valueGetter's</a>, where
                they reference the changed cell.
            </li>
            <li>
                Rows with results from <a href="../javascript-grid-aggregation/">Row aggregation</a>,
                where they aggregate the cells value into the group level.
            </li>
        </ul>
    </p>

    <p>
        This section explains the grid's change detection.
    </p>

    <p>
        However sometimes the data inside your model will change and you just want to tell
        the grid to update without changing the data. For example, suppose you set a bunch of
        10 'car' records into the grid, with each car having 'make', 'model' and 'price' attributes.
        The grid does not copy the records, rather it wraps each on in a rowNode object.
        That means that if you make any changes to the 'car' record, the record inside the grid
        will also be updated. So you might change the record in another part of your application,
        and then require the grid to refresh it's cells.
    </p>

    <note>
        If you are using Angular or React to build your cells (eg using an Angular or React cellRenderer),
        then you may be benefiting from binding that your framework provides.
        If you are, then you might be wondering what all this refresh rubbish is all about and do you need it?
        If your cells are keeping up to date with the help of your chosen framework, that is totally fine
        if you are happy with it. This section explains how to refresh outside of the context of your framework.
    </note>

    <h3 id="refresh-view">Full Grid Refresh</h3>

    <p>
        The easiest way to get the grid to refresh it's view is to call
        <code>api.refreshView()</code>, which will refresh everything. Refreshing the entire view works very fast
        so this 'on method to refresh everything' may work for you every time you want to refresh just the
        smallest item.
    </p>

    <h3 id="refresh-rows">Refresh Rows</h3>

    <p>
        The method <code>api.refreshRows(rowNodes)</code> will refresh particular rows. In this instance,
        the grid will rip the rows out of the dom and draw in new rows from scratch.
    </p>

    <h3 id="refresh-cells">Refresh Cells</h3>

    <p>
        The method <code>api.refreshCells(rowNodes, colIds)</code> will refresh particular cells. In this
        instance, all other cells on that row will stay intact.
    </p>

    <h3>Example - Simple Refresh</h3>

    <p>
        The grid below shows the above three options in action. The grid's columns 'Make' and 'Model'
        have cellRenderers that also display the timestamp the cell was rendered, so you can see when
        the cell is rendered again. The example demonstrates the following:
    </p>
    <ul>
        <li><b>Refresh All</b>: All cells get refreshed.</li>
        <li><b>Double Jillian</b>: Jillian's rows get completely refreshed.</li>
        <li><b>Double Niall</b>: The 'Price' column only in Niall's rows get refreshed.</li>
    </ul>

    <show-example example="example3"></show-example>

    <h3 id="volatile-cells">Volatile Cells</h3>

    <p>
        In addition to the <i>api.refreshView()</i> call, there is also a similar <i>api.refreshVolatileCells()</i> call.
        The volatile refresh differs in the following ways:
    </p>
    <ul>
        <li>The rows are left intact, only the contents of the cells are redrawn.</li>
        <li>Only cells marked as <i>volatile</i> are redrawn.</li>
    </ul>
    <p>
        Cells are marked as volatile by setting the attribute on the column definition.
    </p>

    <p>
        This can give a performance increase, however refreshing the entire grid works really fast anyway.
        The real benefit of this is not destroying cells that the user may be interacting with for inputting
        data. For example you could have a cell that the user is placing some text into which then other
        cells are reflecting changes in, such as some formula that get re-run as the user is typing in text.
    </p>

    <h3 id="volatile-cells-example">Volatile Cells Example</h3>

    <p>
        The example below shows refreshing in action. The weekday columns are editable. As you edit the cells,
        the numbers on the right has side change. The <i>volatile summary</i> change as the cells change, as
        the columns are marked as <i>volatile</i> and the grid <i>onCellValueChanged()</i> function is calling
        <i>api.refreshVolatileCells()</i>
    </p>
    <p>
        Note that the class rules are reapplied as the total and value change, marking the value as bold and
        red it if goes above the threshold.
    </p>

    <show-example example="example1"></show-example>

    <h3 id="cell-refresh-from-inside">Cell Refresh from Inside</h3>

    <p>
        You can request a cell to be refreshed from within by calling the <i>params.refreshCell()</i> function
        passed to the cell renderer. This is handy if the cell wants to refresh itself and / or get the cell
        style rules reapplied.
    </p>

    <p>
        This can be handy if the cell gets itself into a state it wants to get out for. For example, you could have
        your own custom editing, and when the data has finished editing, you cal 'refreshCell()' will is a handy
        way to get the grid to rip the cell out and put it back again to the fresh 'non-editing' state.
    </p>

    <h3 id="refresh-headers-and-footers">Refresh Headers and Footers</h3>

    <p>
        If you call <i>api.recomputeAggregates()</i>, all header and footer rows will subsequently get ripped
        out and redrawn to show the new aggregate values. If you want to refresh all headers and footers without
        recomputing the aggregates, you can call <i>api.refreshGroupRows()</i> - useful if you want to refresh
        for reasons other than the aggregates being recomputed.
    </p>



    <h2>API</h2>
    <show-example example="exampleRefreshApi"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
