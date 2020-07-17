<?php
$pageTitle = "Row Sorting: Core Feature of our Datagrid";
$pageDescription = "Sorting: will sort the data. Sort a column by clicking the header. Sort multiple columns by holding down shift. Core feature of ag-Grid supporting Angular, React, Javascript and many more. ";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 id="sorting">Row Sorting</h1>

<p class="lead">
    This page describes how to get your grid data sorting. Row sorting works with all frameworks
    (e.g. Angular and React) as well as plain JavaScript.
</p>

<h2>Enable Sorting</h2>

<p>
    Enable sorting for columns by setting the <code>sortable</code> column definition attribute.
    You can then sort a column by clicking on the column header.
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    // enable sorting on name and age columns only
    columnDefs: [
        { field: 'name', sortable: true },
        { field: 'age', sortable: true },
        { field: 'address' },
    ]
}
SNIPPET
) ?>

<p>
    To enable sorting for all columns, set sorting in the
    <a href="/javascript-grid-column-definitions/#default-column-definitions">default column definition</a>.
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    // enable sorting on all columns by default
    defaultColDef: {
        sortable: true
    },
    columnDefs: [
        { field: 'name' },
        { field: 'age' },
        // suppress sorting on address column
        { field: 'address', sortable: false },
    ]
}
SNIPPET
) ?>

<h2>Custom Sorting</h2>

<p>
    Custom sorting is provided at a column level by configuring a comparator on the column definition.
    The sort methods gets the value as well as the row nodes.
</p>

<?= createSnippet(<<<SNIPPET
colDef.comparator = function(valueA, valueB, nodeA, nodeB, isInverted) {
    return valueA - valueB;
}
SNIPPET
) ?>

<h2>Example: Custom Sorting</h2>

<p> Example below shows the following:</p>

<ul class="content">
    <li>Default sorting on the <strong>Athlete</strong> column.</li>
    <li>When the <strong>Year</strong> column is not sorted, it shows a custom icon (up/down arrow).</li>
    <li>
        The <strong>Date</strong> column has strings as the row data, but has a custom comparator so that when you sort this column
        it sorts as dates, not as strings.
    </li>
</ul>

<?= grid_example('Custom Sorting', 'custom-sorting', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<h2 id="multi-column-sorting">Multi Column Sorting</h2>

<p>
    It is possible to sort by multiple columns. The default action for multiple column sorting is for
    the user to hold down <code>Shift</code> while clicking the column header. To change the default action to use
    the <code>Ctrl</code> key (or <code>Cmd</code> key on Apple) instead set the property <code>multiSortKey='ctrl'</code>.
</p>

<p>
    The example below demonstrates the following:
</p>

<ul>
    <li>The grid sorts by <strong>Country</strong> then <strong>Athlete</strong> by default.</li>
    <li>
        The property <code>multiSortKey='ctrl'</code> is set so multiple column sorting
        is achieved by holding down <code>Ctrl</code> and selecting multiple columns.
    </li>
</ul>

<?= grid_example('Multi Column Sort', 'multi-column', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

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
    the <code>gridOptions</code> or the <code>colDef</code>. If defined both in <code>colDef</code> and
    <code>gridOptions</code>, the <code>colDef</code> will get preference, allowing you to define a common default,
    and then tailor per column.
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

<?= grid_example('Sorting Order and Animation', 'sorting-order-and-animation', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<h2>Sorting API</h2>

<p>
    What sorting is applied is controlled via
    <a href="../javascript-grid-column-state/">Column State</a>. The below examples uses
    the Column State API to control column sorting.
</p>

<?= grid_example('Sorting API', 'sorting-api', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<h2>Sorting Groups</h2>

<p>
    The grid sorts using a default comparator for grouped columns. If you want to specify your own, you can do
    so by specifying it in the <code>colDef</code>:
</p>

<?= createSnippet(<<<SNIPPET
var groupColumn = {
    headerName: 'Group',
    comparator: [yourOwnComparator], // this is the important bit
    cellRenderer: {
        renderer: 'agGroupCellRenderer',
    }
};
SNIPPET
) ?>

<h2>Accented Sort</h2>

<p>
    By default sorting doesn't take into consideration locale-specific characters. If you need to make your sort
    locale-specific you can configure this by setting the property <code>gridOptions.accentedSort = true</code>
</p>

<p>
    Using this feature is more expensive; if you need to sort a very large amount of data, you might find that this
    causes the sort to be noticeably slower.
</p>

<p>
    The following example is configured to use this feature.
</p>

<?= grid_example('Accented Sort', 'accented-sort', 'generated', ['modules' => true, 'reactFunctional' => true]) ?>

<h2 id="post-sort">Post-Sort</h2>

<p>
    It is also possible to perform some post-sorting if you require additional control over the sorted rows.
</p>

<p>This is provided via the grid callback function: <code>gridOptions.postSort</code> as shown below:</p>

<?= createSnippet(<<<SNIPPET
gridOptions.postSort(rowNodes) {
    // here we put Ireland rows on top while preserving the sort order

    function isIreland(node) {
        return node.data.country === 'Ireland';
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
SNIPPET
) ?>

<p>
    The following example uses this configuration to perform a post-sort on the rows.
</p>

<?= grid_example('Post Sort', 'post-sort', 'generated', ['enterprise' => true, 'modules' => true, 'reactFunctional' => true]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
