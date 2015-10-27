<?php
$key = "Row Model";
$pageTitle = "ag-Grid Row Model";
$pageDescription = "Row data in ag-Grid is stored internally in a row model. This page describes how this row model works and how to interact with it.";
$pageKeyboards = "ag-Grid data row model";
include '../documentation_header.php';
?>

<div>

    <h2>Row Model</h2>

    <p>
        You pass row data to the grid. The grid will never modify your row data. This guarantees no side effects
        to your data from the grid. It also means you can share row data between grids (same also applies to
        column definitions, they can also be shared).
    </p>

    <p>
        The data is 'managed' via the rowController. This section explains how the rowController works.
    </p>

    <note>
        You do not need to know this. However it is helpful to understand what's going on inside the grid sometimes.
    </note>

    <h2>Row Controllers</h2>

    <p>
        There are two row controllers used in the grid:
        <ul>
            <li><b>In Memory Controller:</b></li> This is the most common. It allows the full set of filtering, sorting
            and grouping inside the grid. When doing pagination, this model is used to display one page at a time in the
            grid. The only time this is not used is when doing virtual pagination.
            <li><b>Virtual Page Controller:</b></li> This is the most common. This is used for everything except when
            doing virtual paging.
        </ul>

        The virtual page controller is explained in the section <a href="../angular-grid-virtual-paging/">Virtual
        Paging and Infinite Scrolling</a>. This section of the documentation focuses on the core row controller.

    </p>

    <h2>In Memory Row Controller</h2>

    <p>
        The in memory row controller is responsible for working out how to display the rows inside the grid.
        It has a complex data structures, representing the data in difference states. The states are as follows:
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

    <h4>State 1: Row Data</h4>

    <p>
        The data as provided by the application. The grid never modifies this array. It just takes the rowData
        items from it. The examples is of three data items.
    </p>

    <p>
        <i>Example Row Data</i>
        <br/>
        <img src="allData.jpg"/>
    </p>

    <p><b>API:</b> There is no API to get this data. However it was provided by the application so you should already have it.</p>

    <h4>State 2: All Rows</h4>

    <p>
        allRows is similar to rowData except a new array is created which contains rowNodes, each rowNode
        pointing to exactly one data item. The length of the allRows array is the same as the rowData array.
    </p>

    <p>
        <i>Example All Rows</i>
        <br/>
        <img src="allRows.jpg"/>
    </p>

    <p><b>API:</b> There is no API to get this data. However there is no benefit over the rowsAfterGroup data.</p>

    <h4>State 3: Rows After Group</h4>

    <p>
        rowsAfterGroup takes the allRows, and if grouping, groups the data. If no grouping is done, then
        rowsAfterGroup will be identical to allRows. The example shows grouping on the color field, creating
        two groups.
    </p>

    <p>
        <i>Example Rows After Group</i>
        <br/>
        <img src="rowsAfterGroup.jpg"/>
    </p>

    <p><b>API:</b> Use api.forEachNode() to access this structure.</p>

    <h4>State 4: Rows After Filter</h4>

    <p>
        rowsAfterFilter goes through rowsAfterGroup and filters the data. The example shows filtering
        on the color black (thus removing the second group).
    </p>

    <p>
        <i>Example Rows After Filter</i>
        <br/>
        <img src="rowsAfterFilter.jpg"/>
    </p>

    <p><b>API:</b> Use api.forEachNodeAfterFilter() to access this structure.</p>

    <h4>State 5: Rows After Sort</h4>

    <p>
        rowsAfterSort goes through rowsAfterFilter and sorts the data. The example shows sorting on
        car make.
    </p>

    <p>
        <i>Example Rows After Sort</i>
        <br/>
        <img src="rowsAfterSort.jpg"/>
    </p>

    <p><b>API:</b> Use api.forEachNodeAfterFilterAndSort() to access this structure.</p>

    <h4>State 6: Rows After Map</h4>

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
        <img src="rowsAfterMapOpen.jpg"/>
    </p>

    <p>
        <i>Example Rows After Map - Closed Group</i>
        <br/>
        <img src="rowsAfterMapClosed.jpg"/>
    </p>

    <p><b>API:</b> Use api.getModel() and then model.getVirtualRowCount() and getVirtualRow() to get the nodes.</p>

    <h2>Row Node</h2>

    <p>
        A rowNode is an ag-Grid representation of one row of data. The rowNode will contain a reference to the
        data item your application provided as well as other ag-Grid runtime information about the row. The
        rowNode contains attributes. Additional attributes are used if the node is a group.
    </p>

    <h4>All Node Attributes</h4>

    <p>
        <ul>
            <li><b>id:</b> Unique ID for the node provided by and used internally by the grid.</li>
            <li><b>data:</b> The data as provided by the application</li>
            <li><b>parent:</b> The parent node to this node, or empty if top level.</li>
            <li><b>level:</b> How many levels this node is from the top.</li>
            <li><b>group:</b> True if this node is a group node (ie has children).</li>
            <li><b>firstChild:</b> True if this is the first child in this group</li>
            <li><b>lastChild:</b> True if this is the last child in this group</li>
            <li><b>childIndex:</b> The index of this node in the group.</li>
            <li><b>floating:</b> True if this row is a floating row.</li>
            <li><b>floatingTop:</b> True if this row is a floating top row.</li>
            <li><b>floatingBottom:</b> True if this row is a floating bottom row.</li>
            <li><b>quickFilterAggregateText:</b> If using quick filter, stores a string representation of the row for searching against.</li>
        </ul>
    </p>

    <h4>Group Node Attributes</h4>

    <p>
    <ul>
        <li><b>footer:</b> True if row is a footer. Footers  have group = true and footer = true.</li>
        <li><b>children:</b> Children of this group.</li>
        <li><b>field:</b> The field we are pivoting on eg Country.</li>
        <li><b>key:</b> The key for the pivot eg Ireland, UK, USA.</li>
        <li><b>childrenAfterFilter:</b> Filtered children of this group.</li>
        <li><b>childrenAfterSort:</b> Sorted children of this group.</li>
        <li><b>allChildrenCount:</b> Number of children and grand children.</li>
        <li><b>expanded:</b> True if group is expanded, otherwise false.</li>
        <li><b>sibling:</b> If doing footers, reference to the footer node for this group.</li>
    </ul>
    </p>

    <h2>Example API</h2>

    <p>
        The example below shows the difference between the three forEach api methods.
    </p>

    <show-example example="exampleRowModel"></show-example>

</div>

<?php include '../documentation_footer.php';?>