<?php
$key = "Sorting";
$pageTitle = "ag-Grid Sorting";
$pageDescription = "ag-Grid Sorting";
$pageKeyboards = "ag-Grid Sorting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="sorting">Sorting</h2>

    <p>
        This page describes how to get your grid data sorting.
    </p>

    <note>
        This page discusses sorting outside of the context of paging. To see how to implement server
        side sorting, see the sections
        <a href="/javascript-grid-pagination/">pagination</a>
        and
        <a href="/javascript-grid-virtual-paging/">virtual paging</a>
    </note>

    <h3 id="enable-sorting">Enable Sorting</h3>

    <p>
        Turn sorting on for the grid by enabling sorting in the grid options.
    </p>

    <p>
        Sort a column by clicking on the column header. To do multi-column sorting,
        hold down shift while clicking the column header.
    </p>

    <h3 id="custom-sorting">Custom Sorting</h3>

    <p>
        Custom sorting is provided at a column level by configuring a comparator on the column definition.
        The sort methods gets the value as well as the row nodes.
    </p>

    <pre>
colDef.comparator = function (valueA, valueB, nodeA, nodeB, isInverted) {
    return valueA - valueB;
}</pre>

    <h3 id="example-custom-sorting">Example: Custom Sorting</h3>

    <p>
        Example below shows the following:
        <ul>
            <li>Default sorting on the Athlete column.</li>
            <li>No sort icon on the Year column.</li>
            <li>Custom sorting on the Date column.</li>
        </ul>
    </p>

    <show-complex-example example="example1.html"
                          sources="{
                                [
                                    { root: './', files: 'example1.html,example1.js' }
                                ]
                              }"
                          plunker="https://embed.plnkr.co/Juo2VlvgFKVbaITxamcS/"
                          exampleheight="350px">
    </show-complex-example>

    <h3 id="sorting-animation">Sorting Animation</h3>

    <p>
        To enable animation of the rows after sorting, set grid property <i>animateRows=true</i>.
    </p>

    <h3 id="sorting-order">Sorting Order</h3>

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

    <h3 id="example-sorting-order-and-animation">Example: Sorting Order and Animation</h3>

    <p>
        The example below shows animation of the rows plus different combinations of sorting orders as follows:
        <ul>
        <li><b>Grid Default:</b> ascending -> descending -> no sort</li>
        <li><b>Column Athlete:</b> ascending -> descending</li>
        <li><b>Column Age:</b> descending -> ascending</li>
        <li><b>Column Country:</b> descending -> no sort </li>
        <li><b>Column Year:</b> ascending only</li>
    </ul>
    </p>

    <show-complex-example example="exampleSortingOrder.html"
                          sources="{
                                [
                                    { root: './', files: 'exampleSortingOrder.html,exampleSortingOrder.js' }
                                ]
                              }"
                          plunker="https://embed.plnkr.co/qnv5QmxC8ldSdQH9qFNz/"
                          exampleheight="350px">
    </show-complex-example>

    <h3 id="sorting-api">Sorting API</h3>

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
    {colId: 'country', sort: 'asc'},
    {colId: 'sport', sort: 'desc'}
]</pre>

    <h3 id="example-sorting-api">Example: Sorting API</h3>

    <p>
        The example below shows the API in action.
    </p>

    <show-complex-example example="sortingApi.html"
                          sources="{
                                [
                                    { root: './', files: 'sortingApi.html,sortingApi.js' }
                                ]
                              }"
                          plunker="https://embed.plnkr.co/RCnt9c9nigG3Zpfj9RhL/"
                          exampleheight="350px">
    </show-complex-example>

    <h3 id="sorting-groups">Sorting Groups</h3>

    <p>
        The grid sorts using a default comparator for grouped columns, if you want to specify your own, you can do
        so specifying it in the colDef:
    </p>

    <pre>
var groupColumn = {
    headerName: "Group",
    comparator: [yourOwnComparator], <span class="codeComment">// this is the important bit</span>
    cellRenderer: {
        renderer: "group",
    }
};
    </pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>