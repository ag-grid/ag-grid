<?php
$key = "InsertRemove";
$pageTitle = "ag-Grid Insert & Remove";
$pageDescription = "ag-Grid allows you to insert and remove rows into the grid without destroying the rows that are currently in the grid.";
$pageKeyboards = "ag-Grid Insert Remove";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Insert & Remove</h2>

    <p>
        If you want to add and remove rows into the grid, you have two choices. One is to maintain the data yourself,
        add in the new data, then set it back into the grid. The other is to use the api methods for getting the grid
        to insert and remove the data. This section looks at the latter option, using the api.
    </p>

    <h3>Supported Row Models</h3>

    <p>
        This section covers adding and removing rows for the <i>normal</i> RowModel. For <i>pagination</i> and
        <i>virtual</i>, see the documentation page for each of them. For <i>viewport</i>, the concept of adding
        and removing rows is no relevant as the viewport datasource has complete control on what rows get
        displayed, so it can add and removes rows into the viewport at will.
    </p>

    <p>
        The grid expects the data you provided to be in one straight list. If you provided data to the grid already
        grouped, then the add / remove features will not work.
    </p>

    <h3>API Methods</h3>

    <p>
        The api methods for adding and removing are below. When the grid takes in new data, it creates a new list of
        data with the items wrapped in RowNodes and it maintains the same ordering as the provided list.
        The methods below work on this list so indexes are with regard the original list.
        If the grid is doing any filtering, sorting or grouping, then the displayed index of a data item
        will be different to the index in the original list. If you insert an item at a particular index,
        the grid will then apply sorting, filtering and grouping, so the index on the screen will not
        match. If you want the indexes to match, you must remove all sorting, filtering and grouping from
        the grid.
    </p>

    <h4>&#8226; API insertItemsAtIndex(index, items)</h4>

    <p>
        Inserts the data at the provided index. Provide items as raw data, not rowNodes (ie same as data in original
        rowData).
    </p>

    <h4>&#8226; API removeItems(rowNodes)</h4>

    <p>
        Removes the provided rowNodes from the grid. The rowNodes are used to identify the rows rather than indexes
        as this makes the method neutral to any sorting, filtering or grouping that may be active in the grid.
    </p>

    <h4>&#8226; API addItems(items)</h4>

    <p>
        Adds items to the end of the list. If the grid is sorted, then adding to the end of the list is fine, as
        the sorting will then sort the items anyway.
    </p>

    <h3>Getting Data Out</h3>

    <p>
        It's all good getting rows added and removed, but in the end, you will want to get the data out.
        To do this, use the <i>api.forEachNode()</i> to iterate through all the data, and then pull the
        data out of each node. The grid does not do this for you on purpose as a) it's trivial and b) it
        allows you to take control and do additional things such as change or filter the data as you go.
        To just get the selected rows, use <i>api.getSelectedNodes()</i>. To get the filtered rows,
        or the rows in the order they are in the grid, use <i>api.forEachNodeAfterFilter()</i> or
        <i>api.forEachNodeAfterFilterAndSort()</i>.
    </p>

    <h3>Example - Adding & Removing Rows</h3>

    <p>
        Below demonstrates the different api methods via the buttons. The example outputs a lot of debugging items
        to the console because the grid property <i>debug=true</i> is set. The buttons are as follows:
    <ul>
        <li>
            <b>Add Row</b>: Adds a row to the end of the list.
        </li>
        <li>
            <b>Insert Row @ 2</b>: Inserts a row at position 2 in the list. This will always work as the grid
            below doesn't allow sorting, filtering or grouping.
        </li>
        <li>
            <b>Remove Selected</b>: Removes all the selected rows from the list.
        </li>
    </ul>
    </p>

    <show-example example="exampleInsertRemove"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
