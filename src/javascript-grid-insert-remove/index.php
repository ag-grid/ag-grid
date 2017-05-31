<?php
$key = "InsertRemove";
$pageTitle = "ag-Grid Insert & Remove";
$pageDescription = "ag-Grid allows you to insert and remove rows into the grid without destroying the rows that are currently in the grid.";
$pageKeyboards = "ag-Grid Insert Remove";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="insert-remove">Insert & Remove</h2>


    <show-example example="exampleGetRowNode"></show-example>


    <p>
        If you want to add and remove rows into the grid, you have two choices. One is to maintain the data yourself,
        add in the new data, then set it back into the grid. The other is to use the api methods for getting the grid
        to insert and remove the data. This section looks at the latter option, using the api.
    </p>

    <h3 id="supported-row-models">Supported Row Models</h3>

    <p>
        This section covers adding and removing rows for the <code>normal</code> RowModel. For <code>pagination</code> and
        <code>virtual</code>, see the documentation page for each of them. For <code>viewport</code>, the concept of adding
        and removing rows is no relevant as the viewport datasource has complete control on what rows get
        displayed, so it can add and removes rows into the viewport at will.
    </p>

    <p>
        The grid expects the data you provided to be in one straight list. If you provided data to the grid already
        grouped, then the add / remove features will not work.
    </p>

    <h3 id="api-methods">API Methods</h3>

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

    <h4 id="api-insert-items-at-index">&#8226; API insertItemsAtIndex(index, items, skipRefresh=false)</h4>

    <p>
        Inserts the data at the provided index. Provide items as raw data, not rowNodes (ie same as data in original
        rowData).
    </p>

    <h4 id="api-remove-items">&#8226; API removeItems(rowNodes, skipRefresh=false)</h4>

    <p>
        Removes the provided rowNodes from the grid. The rowNodes are used to identify the rows rather than indexes
        as this makes the method neutral to any sorting, filtering or grouping that may be active in the grid.
    </p>

    <h4 id="api-add-items">&#8226; API addItems(items, skipRefresh=false)</h4>

    <p>
        Adds items to the end of the list. If the grid is sorted, then adding to the end of the list is fine, as
        the sorting will then sort the items anyway.
    </p>

    <h4 id="skip-refresh">Skip Refresh</h4>

    <p>
        Each of the methods above has an optional parameter <i>skipRefresh</i>. This parameter is only used
        in the InMemoryRowModel. If it is true, the grid will not refresh the model - that means it will not
        rework the groups, sorting and filtering. Use this if you have many updates to do and only want to
        refresh after the last one (set to false for the last call). This will give a performance gain as
        the grid will only group, sort and filter once when you are finished all the updates.
    </p>

    <h3 id="getting-data-out">Getting Data Out</h3>

    <p>
        It's all good getting rows added and removed, but in the end, you will want to get the data out.
        To do this, use the <code>api.forEachNode()</code> to iterate through all the data, and then pull the
        data out of each node. The grid does not do this for you on purpose as a) it's trivial and b) it
        allows you to take control and do additional things such as change or filter the data as you go.
        To just get the selected rows, use <code>api.getSelectedNodes()</code>. To get the filtered rows,
        or the rows in the order they are in the grid, use <code>api.forEachNodeAfterFilter()</code> or
        <code>api.forEachNodeAfterFilterAndSort()</code>.
    </p>

    <h3 id="example-adding-removing-rows">Example - Adding & Removing Rows</h3>

    <p>
        Below demonstrates the different api methods via the buttons. The example outputs a lot of debugging items
        to the console because the grid property <code>debug=true</code> is set. The buttons are as follows:
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

    <h3 id="example-adding-removing-rows-with-groups">Example - Adding & Removing Rows with Groups</h3>

    <p>
        If you are displaying groups (either you provided your own groups, or you are using the ag-Grid Enterprise
        row grouping feature), then it is possible to get the grid to remember the open / closed state of the
        groups when inserting / removing by setting <code>rememberGroupStateWhenNewData=true</code>.
    </p>

    <p>
        The example below shows adding items to the start and the end of groups (the start and the end
        only makes sense if you are not sorting, as otherwise the sort is applied after the update).
    </p>

    <show-example example="exampleInsertRemoveGroups"></show-example>

    <show-example example="exampleSimpleImmutableStore"></show-example>

    <show-example example="exampleComplexImmutableStore"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
