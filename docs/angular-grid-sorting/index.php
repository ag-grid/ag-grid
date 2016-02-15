<?php
$key = "Sorting";
$pageTitle = "AngularJS Angular Grid Sorting";
$pageDescription = "AngularJS Angular Grid Sorting";
$pageKeyboards = "AngularJS Angular Grid Sorting";
include '../documentation_header.php';
?>

<div>

    <h2>Sorting</h2>

    <p>
        This page describes how get your grid data soring.
    </p>

    <note>
        This page discusses sorting outside of the context of paging. To see how to implement server
        side sorting, see the sections
        <a href="/angular-grid-pagination/index.php">pagination</a>
        and
        <a href="/angular-grid-virtual-paging/index.php">virtual paging</a>
    </note>

    <h4>Enable Sorting</h4>

    <p>
        Turn sorting on for the grid by enabling sorting in the grid options.
    </p>

    <p>
        Sort a column by clicking on the column header. To do multi-column sorting,
        hold down shift while clicking the column header.
    </p>

    <h4>Custom Sorting</h4>

    <p>
        Custom sorting is provided at a column level by configuring a comparator on the column definition.
        The sort methods gets the value as well as the entire data row.
    </p>

    <pre>
colDef.comparator = function (value1, value2, data1, data2, isInverted) {
    return value1 - value2;
}</pre>

    <p>
        Example below shows the following:
        <ul>
            <li>Default sorting on the Athlete column.</li>
            <li>No sort icon on the Year column.</li>
            <li>Custom sorting on the Date column.</li>
        </ul>
    </p>

    <show-example example="example1"></show-example>

    <h4>Sorting Order</h4>

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
        It is possible to override this behaviour by providing your own <i>sortOrder</i> on either
        the gridOptions or the colDef. If defined both in colDef and gridOptions, the colDef will get
        preference, allowing you to defined a common default, and then tailoring per column.
    </p>

    <p>
        The example below shows different combinations of sorting orders as follows:
        <ul>
        <li><b>Grid Default:</b> ascending -> descending -> no sort</li>
        <li><b>Column Athlete:</b> ascending -> descending</li>
        <li><b>Column Age:</b> descending -> ascending</li>
        <li><b>Column Country:</b> descending -> no sort </li>
        <li><b>Column Year:</b> ascending only</li>
    </ul>
    </p>

    <show-example example="exampleSortingOrder"></show-example>

    <h4>Sorting API</h4>

    <p>
        Sorting can be controlled via the Sorting API via the following methods:
        <ul>
        <li><b>setSortModel(sortModel):</b> To set the sort.</li>
        <li><b>getSortModel():</b> To return the state of the currently active sort.</li>
    </ul>
    </p>

    <p>
        Both methods work with a list of sort objects, each object containing a sort field
        and direction. The order of the sort objects depicts the order in which the columns
        are sorted. For example, the below array represents the model of firstly sorting
        by country ascending, and then by sport descending.
    </p>

    <pre>[
    {colId: country, sort: 'asc'},
    {colId: sport, sort: 'desc'}
]</pre>

    <p>
        The example below shows the API in action.
    </p>

    <show-example example="sortingApi"></show-example>

    <h4>Sorting Groups</h4>

    <p>
        The grid sorts columns ignoring the groups, even if the column is displaying group data. This
        decoupling, although good design, has the fallback that the column doesn't realise it also
        needs to sort the groups. To get a column to sort the groups when sorting, you have to
        provide a custom comparator to the column. A custom comparator for groups is provided
        by agGrid and can be configured like the following:
    </p>

    <pre>// when using the ag-Grid bundle with global agGrid variable:
var groupColumn = {
    headerName: "Group",
    comparator: agGrid.defaultGroupComparator, // this is the important bit
    cellRenderer: {
        renderer: "group",
    }
};

// when using CommmonJS
import {defaultGroupComparator} from 'ag-grid/main';
var groupColumn = {
    headerName: "Group",
    comparator: defaultGroupComparator, // this is the important bit
    cellRenderer: {
        renderer: "group",
    }
};
    </pre>

    <p>You only need to worry about this if you are providing your own grouping column. If using
    the grid auto-group column, this comparator is used by default.</p>

</div>

<?php include '../documentation_footer.php';?>
