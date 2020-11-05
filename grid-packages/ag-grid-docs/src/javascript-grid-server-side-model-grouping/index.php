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
        The Partial Store is used (the default).
    </li>
    <li>
        The store block size is set to 5 by setting the grid property <code>cacheBlockSize = 5</code>.
        It can then be observed that rows are loaded in blocks at all levels. For example if you expand
        United States row, the children rows are loaded in blocks using Partial Scrolling.
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

<h2>Grouping and Row Stores</h2>

<p>
    When grouping and a group is expanded, a new Row Store is created to store the
    child rows of the opened group. The diagram below shows what the Row Stores
    could look like with Row Grouping, where two top level Row Groups are open.
</p>

<div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
    <img src="./multi-store.svg" style="width: 80%;"/>
    <div>Fig 1. Node Store - Grouping</div>
</div>

<p>
    This means there can be any number of Row Stores existing inside the SSRM.
    Each time a Row Group is expanded, a new Row Store is created for that level.
</p>

<p>
    The sections
    <a href="../javascript-grid-server-side-model-grouping/">Server-Side Row Grouping</a>
    explains in detail this topic.
</p>



<h2>Full vs Partial Store</h2>

<p>
    The Row Grouping mechanics are almost identical with the Full Store and Partial Store. The difference
    is that when using the Partial Store, data will be requested in blocks and could be requested to have
    sorting and / or filtering applied.
</p>

<p>
    All the examples presented in this section use the Partial Store as it covers all the semantics found
    when using both store types.
</p>


<h2 id="configuring-stores">Configure Stores</h2>

<p>
    By default, each store will have the same configuration (store type, block size etc). This configuration
    is specified using the grid properties <code>serverSideStoreType</code>, <code>maxBlocksInCache</code>
    and <code>cacheBlockSize</code>.
</p>

<p>
    It is possible to have different configurations for different stores. For example if grouping, infinite
    scrolling (using the Partial Store) could be turned off at the top level but turned on at the lower levels.
</p>

<p>
    This is done by implementing the grid callback <code>getServerSideStoreParams()</code>. It's interface
    is as follows:
</p>

<?= createSnippet(<<<SNIPPET
// functions takes params and also returns a different type of params
function getServerSideStoreParams(params: GetServerSideStoreParamsParams): ServerSideStoreParams;

// these params the function gets, gives details on where the store is getting created
interface GetServerSideStoreParamsParams {

    // the level of the store. top level is 0.
    level: number;

    // the Row Node for the group that got expanded, or undefined if top level (ie no parent)
    parentRowNode?: RowNode;

    // active Row Group Columns, if any
    rowGroupColumns: Column[];

    // active Pivot Columns, if any
    pivotColumns: Column[];

    // true if pivot mode is active
    pivotMode: boolean;
}

// these params the function returns, it's configuration for the store about to be created
interface ServerSideStoreParams {

    // what store type to use. if missing, then defaults to grid option 'serverSideStoreType'
    storeType?: ServerSideStoreType;

    // For Partial Store only. How many blocks to keep in cach.
    // If missing, defaults to grid options 'maxBlocksInCache'
    maxBlocksInCache?: number;

    // For Partial Store only. Cache block size.
    // If missing, defaults to grid options 'cacheBlockSize'
    cacheBlockSize?: number;
}

// for storeType above, one of 'full' or 'partial'
enum ServerSideStoreType {
    Full = 'full',
    Partial = 'partial'
}

SNIPPET
, 'ts') ?>

<p>
    The example below demonstrates the <code>getServerSideStoreParams()</code> callback. Note
    the following:
</p>

<ul>
    <li>
        <p>
            The grid is configured differently depending on whether grouping is active of not
            by implementing the <code>getServerSideStoreParams()</code> callback. The callback
            logs it's results to the dev console.
        </p>
    </li>
    <li>
        <p>
            When grouping is active, the stores are configured as follows:
        </p>
        <ul>
            <li>Level 0 - Full Store (no infinite scrolling)</li>
            <li>Level 1 - Partial Store (infinite scrolling) with block size of 5</li>
            <li>Level 2 - Partial Store (infinite scrolling) with block size of 2</li>
        </ul>
        <p></p>
        <p>
            To observe, expand different levels of the data and notice when rows are read back
            in blocks.
        </p>
    </li>
    <li>
        <p>
            When no grouping is active, the store is configured to use infinite scroll and only keeps two blocks
            of rows in the store.
        </p>
        <p>
            To observe this, remove all grouping and scroll down to load more blocks. Then
            scroll back up to observe the initial blocks getting reloaded.
        </p>
    </li>
    <li>
        <p>
            Clicking <b>Store State</b> will print the state of all stores to the console
            using the API <code>getServerSideStoreState()</code>.
        </p>
    </li>
</ul>

<?= grid_example('Dynamic Params', 'dynamic-params', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside']]) ?>


<h2>Store State & Store Info</h2>

<p>
    For debugging purposes, the grid has the API <code>getServerSideStoreState()</code> which returns
    info on all existing <a href="../javascript-grid-server-side-model-row-stores/">Row Stores</a>.
    This is good for learning purposes, as you can see details about the store such as the store type
    and it's route.
</p>

<?= createSnippet(<<<SNIPPET
function getServerSideStoreState(): ServerSideStoreState[];

interface ServerSideStoreState {
    // store type, 'partial' or 'full'
    type: ServerSideStoreType;

    // the route that identifies this store
    route: string[];

    // how many rows the store has. this includes 'loading rows'
    rowCount: number;

    // any extra info provided to the store, when data was loaded
    info?: any;

    // for partial store only, whether the last row index is known
    lastRowIndexKnown?: boolean;
    // for partial store only, max blocks allowed in the store
    maxBlocksInCache?: number;
    // for partial store only, the size (number of rows) of each block
    cacheBlockSize?: number;
}
SNIPPET
) ?>

<p>
    Inspecting the Store State can be useful, for example when wanting to know what Route to use
    when providing <a href="../javascript-grid-server-side-model-transactions/">Transactions</a>
    or doing a <a href="../javascript-grid-server-side-model-refresh/">Store Refresh</a>.
</p>

<p>
    It is also possible to attach info to each store as data is loaded. This is done through the <code>success()</code>
    callback when rows are fetched.
</p>

<?= createSnippet(<<<SNIPPET
// Example - providing info to a store
MyDatasource.prototype.getRows = function(params) {

    // get the rows to return
    let myRowsFromServer = ....

    // pass rows back along with any additional store info
    params.success({rowData: myRowsFromServer, storeInfo: {a: 22, b: 55});
}
SNIPPET
) ?>

<p>
    The info object is merged into the Store Info (which is initially an empty object) and then available
    in the following locations:
</p>
<ol>
    <li>
        Included in the Store State returned from <code>getServerSideStoreState()</code>.
    </li>
    <li>
        Included in the params to <code>isApplyServerSideTransaction()</code>. This method
        is explained in
        <a href="../javascript-grid-server-side-model-transactions/#cancelling-transactions">
            Cancelling Transactions</a>.
    </li>
</ol>

<p>
    If rows are loaded multiple times into the Store, then the Store Info values will over write existing values
    as they are merged on top of the existing values.
    Rows can be loaded multiple times if a) the store is
    <a href="../javascript-grid-server-side-model-refresh/">Refreshed</a> or b) Partial Store is used (as each block
    load will get the opportunity to add info data).
</p>

<p>
    The example below shows <code>isApplyServerSideTransaction()</code> and also Store Info in action.
</p>

<?= grid_example('Store Info', 'store-info', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside']]) ?>

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

<h2>Sorting</h2>

<p>
    When a sort is applied to a grouped grid using the SSRM, the grid will behave differently
    depending on what store is used. How it behaves is as follows:
</p>

<ul>
    <li>
        <h3>Partial Store</h3>

        <ul>
            <li>Non-group levels always refresh - all rows are loaded again from the server.</li>
            <li>
                Group levels refresh (reload from server) if the sort was changed in:
                <ul>
                    <li>Any column with a value active (ie colDef.aggFunc='something')</li>
                    <li>Any secondary column (ie you are pivoting and sort a pivot value column)</li>
                    <li>A Column used for this levels group (eg you are grouping by 'Country' and you sort by 'Country').</li>
                </ul>
            </li>
        </ul>
    </li>
    <li>
        <h3>Full Store</h3>
        <p>
            The Full Store always sorts inside the grid. The rows are never reloaded due to a sort.
        </p>
    </li>
</ul>

<p>
    It is possible to force the grid to always refresh (reload data) after a sort changes. Do this by setting
    grid property <code>serverSideSortingAlwaysResets=true</code>.
</p>


<h2>Filtering</h2>

<p>
    When a filter is applied to a grouped grid using the SSRM, the grid will behave differently
    depending on what store is used. How it behaves is as follows:
</p>

<ul>
    <li>
        <h3>Partial Store</h3>
        <p>
            Changing the filter on any column will always refresh the Partial Store.
            Rows will be loaded again from the server with the new filter information.
        </p>
    </li>
    <li>
        <h3>Full Store</h3>
        <p>
            The Full Store always filters inside the grid. The rows are never reloaded due to a filter change.
        </p>
    </li>
</ul>

<p>
    It is possible to force the grid to always refresh (reload data) after a filter changes. Do this by setting
    grid property <code>serverSideFilteringAlwaysResets=true</code>.
</p>

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
    Continue to the next section to learn how to perform <a href="../javascript-grid-server-side-model-refresh/">Data Refresh</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
