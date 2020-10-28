<?php
$pageTitle = "Server-Side Row Model - Row Grouping";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Row Grouping</h1>

<p class="lead">
    This section covers Row Grouping in the Server-Side Row Model (SSRM).
</p>

<h2>Enabling Row Grouping</h2>

<p>
    Row Grouping is enabled in the grid via the <code>rowGroup</code> column definition attribute. The example below
    shows how to group rows by 'country':
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'sport' },
        { field: 'year' },
    ],

    // other options
}
SNIPPET
) ?>

<p>
    For more configuration details see the section on <a href="../javascript-grid-grouping">Row Grouping</a>.
</p>

<h2>Row Grouping on the Server</h2>

<p>
    The actual grouping of rows is performed on the server when using the Server-Side Row Model. When the grid needs
    more rows it makes a request via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-Side Datasource</a> with
    metadata containing grouping details.
</p>

<p>
    The properties relevant to row grouping in the request are shown below:
</p>

<?= createSnippet(<<<SNIPPET
// IServerSideGetRowsRequest
{
    // row group columns
    rowGroupCols: ColumnVO[];

    // what groups the user is viewing
    groupKeys: string[];

    ... // other params
}
SNIPPET
, 'ts') ?>

<p>
    Note in the snippet above that <code>rowGroupCols</code> contains all the columns (dimensions) the grid is grouping
    on, e.g. 'Country', 'Year', and <code>groupKeys</code> contains the list of group keys selected, e.g.
    <code>['Argentina', '2012']</code>.
</p>

<p>
    The example below demonstrates server-side Row Grouping. Note the following:
</p>

<ul class="content">
    <li>
        The Infinite Store is used (the default).
    </li>
    <li>
        The store block size is set to 5 by setting the grid property <code>cacheBlockSize = 5</code>.
        It can then be observed that rows are loaded in blocks at all levels. For example if you expand
        United States row, the children rows are loaded in blocks using Infinite Scrolling.
    </li>
    <li>
        Country and Sport columns have <code>rowGroup=true</code> defined on their column definitions.
        This tells the grid there is two levels of grouping, one for Country and one for Sport.
    </li>
    <li>
        The <code>rowGroupCols</code> and <code>groupKeys</code> properties in the request are used by the server
        to perform grouping.
    </li>
    <li>
        Open the browser's dev console to view the request supplied to the datasource.
    </li>
</ul>

<?= grid_example('Row Grouping', 'row-grouping', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<note>
    <p>
        The example above also demonstrates <a href="../javascript-grid-server-side-model-sorting/">Sorting</a> with groups.
        When the grid sort changes, only impacted rows will be reloaded. For example, if 'Sport' groups are expanded, sorting
        on the 'Year' column won't cause the top level 'Country' groups to reload, but sorting on the 'Gold' column will.
    </p>
    <p>
        To avoid this and always refresh top level groups regardless of which column is sorted,
        set the grid property <code>serverSideSortingAlwaysResets=true</code>.
    </p>
</note>

<h2>In-Memory vs Infinite Store</h2>

<p>
    The Row Grouping mechanics are almost identical with the In-Memory Store and Infinite Store. The difference
    is that when using the Infinite Store, data will be requested in blocks and can have sorting and
    filtering information.
</p>

<p>
    All the examples presented in this section use the Infinite Store as it covers all the semantics found
    when using the In-Memory Store.
</p>

<h2>Group Stores</h2>

<p>
    The <a href="../javascript-grid-server-side-model-configuration/#server-side-cache">Server-Side Cache</a> has already
    been covered, however it is important to note that when rows are grouped each group node contains a cache. This is
    illustrated in the following diagram:
</p>

<p>
    <img src="groupCache.png" width="100%" height="100%" style="border: 1px  grey"/>
</p>

<p>
    When a group node is expanded, such as 'Australia' above, a cache will be created and blocks containing rows will be
    loaded via the <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-Side Datasource</a>.
</p>

<h2>Providing Child Counts</h2>

<p>
    By default, the grid will not show row counts beside the group names. If you do want
    row counts, you need to implement the <code>getChildCount()</code> callback for the
    grid. The callback provides you with the row data; it is your application's responsibility
    to know what the child row count is. The suggestion is you set this information into
    the row data item you provide to the grid.
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    getChildCount = function(data) {
        // here child count is stored in the 'childCount' property
        return data.childCount;
    },

    // other options
}
SNIPPET
) ?>

<?= grid_example('Child Counts', 'child-counts', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Complex Columns</h2>

<p>
    It is possible the data provided has composite objects, in which case it's more difficult for the grid
    to extract group names. This can be worked with using value getters or embedded fields
    (i.e. the field attribute has dot notation).
</p>

<p>
    In the example below, all rows back are modified so that the rows looks something like this:
</p>

<?= createSnippet(<<<SNIPPET
// sample contents of row data
{
    // country field is complex object
    country: {
        name: 'Ireland',
        code: 'IRE'
    },

    // year field is complex object
    year: {
        name: '2012',
        shortName: "'12"
    },

    // other fields as normal
    ...
}
SNIPPET
) ?>

<p>
    Then the columns are set up so that country uses a <code>valueGetter</code> that uses the field
    with dot notation, i.e. <code>data.country.name</code>
</p>

<?= grid_example('Complex Objects', 'complex-objects', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn how to perform <a href="../javascript-grid-server-side-model-pivoting/">Server-Side Pivoting</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
