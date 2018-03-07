<?php
$pageTitle = "Row Sorting: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Row Sorting. Row Sorting will sort the data. Sort a column by clicking the header. Sort multiple columns by holding down shift. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Sorting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1 id="sorting">Row Sorting</h1>

    <p class="lead">
        This page describes how to get your grid data sorting.
    </p>

    <h2>Enable Sorting</h2>

    <p>
        Turn sorting on for the grid by enabling sorting in the grid options.
    </p>

    <p>
        Sort a column by clicking on the column header.
    </p>

    <h2>Custom Sorting</h2>

    <p>
        Custom sorting is provided at a column level by configuring a comparator on the column definition.
        The sort methods gets the value as well as the row nodes.
    </p>

    <snippet>
colDef.comparator = function (valueA, valueB, nodeA, nodeB, isInverted) {
    return valueA - valueB;
}</snippet>

    <h2>Example: Custom Sorting</h2>

    <p> Example below shows the following: </p>
        <ul class="content">
            <li>Default sorting on the Athlete column.</li>
            <li>When the year column is not sorted, it shows a custom icon, (up/down arrow).</li>
            <li>The date column has strings as the row data, there is custom comparator so that when you sort this column
            it sorts it as dates, not as strings.</li>
        </ul>

    <?= example('Custom Sorting', 'custom-sorting', 'generated') ?>

    <h2 id="multi-column-sorting">Multi Column Sorting</h2>

    <p>
        It is possible to sort by multiple columns. The default action for multiple column sorting is for
        the user to hold down shift while clicking the column header. To change the default action to use
        the Control key (or Cmd key on Apple) instead set the property <code>multiSortKey='ctrl'</code>.
    </p>

    <p>
        The example below demonstrates the following:
        <ul>
            <li>The grid sorts by Country then Athlete by default.</li>
            <li>
                The property <code>multiSortKey='ctrl'</code> is set so multiple column selection
                is achieved by holding down Control and selecting multiple columns.
            </li>
        </ul>
    </p>

    <?= example('Multi Column Sort', 'multi-column', 'generated') ?>

    <h2>Sorting Animation</h2>

    <p>
        To enable animation of the rows after sorting, set grid property <code>animateRows=true</code>.
    </p>

    <h2>Sorting Order</h2>

    <p>
        By default, the sorting order is as follows:
    </p>
    <p>
        <b>ascending -> descending -> none</b>.
    </p>
    <p>
        In other words, when you click a column that is not sorted, it will sort ascending. The next click
        will make it sort descending. Another click will remove the sort.
    </p>
    <p>
        It is possible to override this behaviour by providing your own <code>sortingOrder</code> on either
        the gridOptions or the colDef. If defined both in colDef and gridOptions, the colDef will get
        preference, allowing you to defined a common default, and then tailoring per column.
    </p>

    <h2>Example: Sorting Order and Animation</h2>

    <p>
        The example below shows animation of the rows plus different combinations of sorting orders as follows:
    </p>
        <ul class="content">
        <li><b>Grid Default:</b> ascending -> descending -> no sort</li>
        <li><b>Column Athlete:</b> ascending -> descending</li>
        <li><b>Column Age:</b> descending -> ascending</li>
        <li><b>Column Country:</b> descending -> no sort </li>
        <li><b>Column Year:</b> ascending only</li>
    </ul>

    <?= example('Sorting Order and Animation', 'sorting-order-and-animation', 'generated') ?>

    <h2>Sorting API</h2>

    <p>
        Sorting can be controlled via the Sorting API via the following methods:
    </p>
        <ul class="content">
        <li><b>setSortModel(sortModel):</b> To set the sort.</li>
        <li><b>getSortModel():</b> To return the state of the currently active sort.</li>
    </ul>

    <p>
        Both methods work with a list of sort objects, each object containing a sort field
        and direction. The order of the sort objects depicts the order in which the columns
        are sorted. For example, the below array represents the model of firstly sorting
        by country ascending, and then by sport descending.
    </p>

    <snippet>
[
    {colId: 'country', sort: 'asc'},
    {colId: 'sport', sort: 'desc'}
]</snippet>

    <h2>Example: Sorting API</h2>

    <p>
        The example below shows the API in action.
    </p>

    <?= example('Sorting API', 'sorting-api', 'generated') ?>

    <h2>Sorting Groups</h2>

    <p>
        The grid sorts using a default comparator for grouped columns, if you want to specify your own, you can do
        so specifying it in the colDef:
    </p>

    <snippet>
var groupColumn = {
    headerName: "Group",
    comparator: [yourOwnComparator], // this is the important bit
    cellRenderer: {
        renderer: "agGroupCellRenderer",
    }
};
   </snippet>

    <h2>Accented sort</h2>

    <p>
        By default sorting doesn't take into consideration locale specific characters, if you need to make your sort locale
        specific you can configure this by setting the property <code>gridOptions.accentedSort = true</code>
    </p>

    <p>
        Using this feature is more expensive, if you need to sort a very large amount of data, you might find that this
        causes the sort to be noticeably slower.
    </p>

    <p>
        The following example is configured to use this feature.
    </p>

    <?= example('Accented Sort', 'accented-sort', 'generated') ?>

    <h2 id="post-sort">Post Sort</h2>

    <p>
        It is also possible to perform some post sorting if you require additional control over the sorted rows.
    </p>

    <p>This is provided via the grid callback function: <code>gridOptions.postSort</code> as shown below:</p>

    <snippet>
gridOptions.postSort(rowNodes) {
    // here we put Ireland rows on top while preserving the sort order

    function isIreland(node) {
        return node.data.country === "Ireland";
    }

    function move(toIndex, fromIndex) {
        rowNodes.splice(toIndex, 0, rowNodes.splice(fromIndex, 1)[0]);
    }

    var nextInsertPos = 0;
    for (var i = 0; i < rowNodes.length; i++) {
        if (isIreland(rowNodes[i])) {
            move(nextInsertPos, i)
            nextInsertPos++;
        }
    }
}
    </snippet>

    <p>
        The following example uses this configuration to perform a post sort on the rows.
    </p>

    <?= example('Post Sort', 'post-sort', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>