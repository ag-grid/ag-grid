<?php
$pageTitle = "ag-Grid Row Models: The Enterprise Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Enterprise Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Enterprise Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Enterprise Row Model </h1>

<p class="lead">
    The Enterprise Row Model is arguably the most powerful of the row models in ag-Grid
    and presents the ultimate 'big data' user experience, allowing the user to
    navigate through very large data sets using a mixture of server side grouping and aggregation
    while using infinite scrolling to bring the data back in blocks to the client.
</p>

<h2>Enterprise Row Model Features</h2>

<p>
    The best way to learn what the Enterprise Model does is to break it down into the core features.
    You may benefit from the combination of all these
    features or just be interested in a subset. The features of the
    enterprise row model are:
</p>

    <ul class="content">
        <li>
            <b>Lazy Loading of Groups:</b> The grid will load the top level rows only. Children
            of groups are only loaded when the user expands the group. Some applications may use
            the Enterprise Row Model for this one feature alone e.g. you might have a managers database table,
            you can display a list of all managers, then click 'expand' on the manager and the grid
            will then request to get the 'employees' for that manager.
        </li>
        <li>
            <b>Server Side Grouping, Pivot and Aggregation:</b> Because the data is coming back from the server one group
            level at a time, this allows you to do aggregation on the server, returning back the aggregated
            results for the top level parent rows. For example you could include 'employee count' as an attribute
            on the returned manager record, to say how many employees a manager manages.
        </li>
        <li>
            <b>Infinite Scrolling:</b> Rows are read back from the server in blocks to provide the experience
            of infinite scrolling. This happens at each grouping level
            (ie the top level rows are brought back in blocks, then when you expand a group, the children
            of that group are also loaded in blocks). This allows viewing very large datasets in the browser by
            only bringing back data one block at a time. This feature reuses the logic from the
            <a href="../javascript-grid-infinite-scrolling/">Infinite Scrolling</a> row model, so understanding
            how that row model works will help you in understanding this part of the enterprise row model.
        </li>
        <li>
            <b>Slice and Dice:</b> Assuming your server side can build the data query, you can allow the user
            to use the ag-Grid UI to drag columns around to select what columns you want to group by and aggregate
            on. What the user selects will then be forwarded to your datasource as part of the request. This feature
            is advanced and will require some difficult server side coding from you, however if done correctly then
            your users will have an experience of slicing and dicing large data in real time, something previously
            only available in expensive reporting tools, now you can embed it into your JavaScript application.
        </li>
    </ul>


<h2>Enterprise Datasource</h2>

<p>
    Similar to the <a href="../javascript-grid-infinite-scrolling/">Infinite Scrolling</a> and
    <a href="../javascript-grid-viewport/">Viewport</a> row models, you provide the grid with a datasource.
    The interface for the datasource is as follows:
</p>

<snippet>
// datasource for enterprise row model
interface IEnterpriseDatasource {

    // grid calls this to get rows
    getRows(params: IEnterpriseGetRowsParams): void;

    // optional destroy method, if your datasource has state it needs to clean up
    destroy?(): void;
}</snippet>

<p>
    Each time the grid requires more rows, it will call the <code>getRows()</code> method.
    The method is passed a <code>params</code> object that contains two callbacks (one for
    success and one for failure) and a request object with details what row the grid
    is looking for. The interface for the <code>params</code> is as follows:
</p>

<snippet>
interface IEnterpriseGetRowsParams {

    // details for the request, simple object, can be converted to JSON
    request: IEnterpriseGetRowsRequest;

    // the parent row node. is the RootNode (level -1) if request is top level.
    // this is NOT part fo the request as it cannot be serialised to JSON (a rowNode has methods)
    parentNode: RowNode;

    // success callback, pass the rows back the grid asked for.
    // if the total row count is known, provide it via lastRow, so the
    // grid can adjust the scrollbar accordingly.
    successCallback(rowsThisPage: any[], lastRow: number): void;

    // fail callback, tell the grid the call failed so it can adjust its state
    failCallback(): void;
}</snippet>

<p>
    The request gives details on what the grid is looking for. The success and failure callbacks are not included
    inside the request object to keep the request object simple data (ie simple data types, no functions). This
    allows the request object to be serialised (eg via JSON) and sent to your server. The request has the following interface:
</p>

<snippet>
interface IEnterpriseGetRowsRequest {

    // row group columns
    rowGroupCols: ColumnVO[];

    // value columns
    valueCols: ColumnVO[];

    // pivot columns
    pivotCols: ColumnVO[];

    // true if pivot mode is one, otherwise false
    pivotMode: boolean;

    // what groups the user is viewing
    groupKeys: string[];

    // if filtering, what the filter model is
    filterModel: any;

    // if sorting, what the sort model is
    sortModel: any;
}

// we pass a VO (Value Object) of the column and not the column itself,
// so the data can be converted to a JSON string and passed to server side
export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}</snippet>

<p>
    Studying the interfaces above alone probably won't describe the whole story in an understandable way. The best
    thing to do is look at the examples below and debug through them with the web console and observe what is
    passed back as you interact with the grid.
</p>

<h2>Example - Pre-defined Grouping - Mocked Server</h2>

<p>
    Below shows an example of pre-defined grouping using the olympic winners dataset.
    It is pre-defined as we set the grid with specific columns for row grouping and
    do not allow the user to change this. Then
    the datasource knows that the grid will either be asking for the top level
    country list OR the grid will be looking for winners
    for a particular country.
</p>

<p>
    In your application, your server side would know where to get the data based
    on what the user is looking for, eg it could go to a relational database
    table to get the list of countries and then a web service to get the winners
    for the country as the user expands the group (a web service to get the winners
    per country is improbable, however the example demonstrates you do not need to
    go to the same datastore for the different levels in the grid).
</p>

<p>
    In the example, the work your server would do is mocked for demonstrations
    purposes (as the online examples are self contained and do not contact any
    servers).
</p>

<p>
    The example demonstrates the following:
</p>
    <ul class="content">
        <li><b>Grouping:</b> The data is grouped by country.</li>
        <li><b>Aggregation:</b> The server always sum's gold, silver and bronze.
            The columns are not set as value columns, and hence the user cannot change
            the aggregation function via the column menu. The server just assumes if grouping,
            then these columns should be aggregated using a sum function.
        </li>
        <li><b>Sorting:</b> The sorting is done on the server side.
            For example, sort by Athlete, then expand a group and you will
            see Athlete is sorted. </li>
    </ul>

<?= example('Simple Example', 'simple', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<h2>Example - Slice and Dice - Mocked Server</h2>

<p>
    The concept of 'Slice and Dice' means the user can decide what they want to group,
    aggregate and pivot on by dragging the columns around in the grid.
</p>

<p>
    When the user changes the status of the columns (ie the user changes how the data is
    grouped, aggregated or pivoted) then the grid data is cleared out and loaded again
    from scratch using the new configuration.
</p>

<p>
    A mock data store running inside the browser is used in the below example. The purpose
    of the mock server is to demonstrate the interaction between the grid and the server.
    For your application, your server side would need to understand the requests
    from the client and build SQL (or the SQL equivalent if using a no-SQL data store)
    to run the relevant query against the data store.
</p>

<p>
    The example demonstrates the following:
</p>
    <ul class="content">
        <li>
            Columns <code>Athlete, Age, Country, Year</code> and <code>Sport</code> all have <code>enableRowGroup=true</code>
            which means they can be grouped on. To group you drag the columns to the row group panel section.
            By default the example is grouping by <code>Country</code> and then <code>Year</code> as these columns have
            <code>rowGroup=true</code>.
        </li>
        <li>
            Columns <code>Gold, Silver</code> and <code>Bronze</code> all have <code>enableValue=true</code> which means
            they can be aggregated on. To aggregate you drag the column to the <code>Values</code> section.
            When you are grouping, then all columns in the <code>Values</code> section will be aggregated.
        </li>
        <li>
            You can turn the grid into <strong>Pivot Mode</strong>. To do this, you click the pivot mode checkbox.
            When the grid is in pivot mode, the grid behaves similar to an Excel grid. This extra information
            is passed to your server as part of the request and it is your servers responsibility to return
            the data in the correct structure.
        </li>
        <li>
            Columns <strong>Gold, Silver</strong> and <strong>Bronze</strong> all have <code>enablePivot=true</code> which means
            they can be pivoted on when <strong>Pivot Mode</strong> is active. To pivot you drag the column to the <strong>Pivot</strong>
            section.
        </li>
        <li>
            Note that when you pivot, it is not possible to drill all the way down the leaf levels.
        </li>
        <li>
            In addition to grouping, aggregation and pivot, the example also demonstrates filtering.
            The columns <b>Country</b> and <b>Year</b> have grid provided filters. The column <b>Age</b>
            has an example provided custom filter. You can use whatever filter you want, as long as
            your server side knows what to do with it.
        </li>
    </ul>

<note>
    When filtering using the Enterprise Row Model it's important to specify the filter parameter: <code>newRowsAction: 'keep'</code>.
    This is to prevent the filter from being reset as data is loaded into the grid.
</note>

<?= example('Slice And Dice', 'slice-and-dice', 'generated', array("enterprise" => 1)) ?>

<h2>Pivoting Challenges</h2>

<p>
    Achieving pivot on the server side is difficult. If you manage to implement it, you deserve lots of credit from
    your team and possibly a few hugs (disclaimer, we are not responsible for any inappropriate hugs you try). Here
    are some quick references on how you can achieve pivot in different relational databases:
    All databases will either implement pivot (like Oracle) or require you to fake it (like MySQL).
</p>
    <ul class="content">
        <li>Oracle: Oracle has native support for filtering which they call
            <a href="http://www.oracle.com/technetwork/articles/sql/11g-pivot-097235.html">pivot feature</a>.
        </li>
        <li>
            MySQL: MySQL does not support pivot, however it is possible to achieve by building SQL using
            inner select statements. See the following on Stack Overflow:
            <a href="https://stackoverflow.com/questions/7674786/mysql-pivot-table">MySQL Pivot Table</a> and
            <a href="https://stackoverflow.com/questions/12598120/mysql-pivot-table-query-with-dynamic-columns">
                MySQL Pivot Table Query with Dynamic Columns
            </a>.
        </li>
    </ul>

<p>
    To understand <a href="../javascript-grid-pivoting/#pivot-mode">Pivot Mode</a> and
    <a href="../javascript-grid-pivoting/#secondary-columns">Secondary Columns</a> please refer to
    the relevant sections on <a href="../javascript-grid-pivoting/">Pivoting in In Memory Row Model</a>.
    The concepts mean the same in both In Memory Row Model and the Enterprise Row Model.
</p>

<p>
    Secondary columns are the columns that are created as part of the pivot function. You must provide
    these to the grid in order for the grid to display the correct columns for the active pivot function.
    For example, if you pivot on <code>Year</code>, you need to tell the grid to create columns for
    <code>2000, 2002, 2004, 2006, 2008, 2010</code> and <code>2012</code>.
</p>

<p>
    Secondary columns are defined identically to primary columns, you provide a list of
    <a href="../javascript-grid-column-definitions/">Column Definitions</a> to the grid. The columns are set
    by calling <code>columnApi.setSecondaryColumns()</code> and passing a list of columns and / or column
    groups. There is no limit or restriction as to the number of columns or groups you pass - the only
    thing you should ensure is that the field (or value getter) that you set for the columns matches.
</p>

<p>
    If you do pass in secondary columns with the server response, be aware that setting secondary columns
    will reset all secondary column state. For example if resize or reorder the columns, then setting the
    secondary columns again will reset this. In the example above, a hash function is applied to the secondary
    columns to check if they are the same as the last time the server was asked to process a request. This
    is the examples way to make sure the secondary columns are only set into the grid when they have actually
    changed.
</p>

<p>
    If you do not want pivot in your enterprise row model grid, then you can remove it from the tool
    panel by setting <code>toolPanelSuppressPivotMode=true</code> and
    <code>toolPanelSuppressValues=true</code>.
</p>

<h2>Example - Slice and Dice - Real Server</h2>

<p>
    It is not possible to put up a full end to end example of the Enterprise row model
    on the documentation website, as we cannot host servers on our website.
    Instead we have put a full end to end example
    in Github at <a href="https://github.com/ag-grid/ag-grid-enterprise-mysql-example/">
    https://github.com/ag-grid/ag-grid-enterprise-mysql-sample/</a>.
</p>

<p>
    The example puts all the olympic winners data into a MySQL database and creates SQL
    on the fly based on what the user is querying. This is a full end to end example of
    the type of slicing and dicing we want ag-Grid to be able to do in your enterprise
    applications.
</p>

<p>
    The example does not demonstrate pivoting. This is because pivot is not easily achievable in
    MySQL.
</p>

<p>
    You can also check out these guides on connecting to other data sources:
    <ul>
        <li><a href="../oracle-server-side-operations/">Java Server connecting to Oracle</a></li>
        <li><a href="../spark-server-side-operations/">Java Server connecting to Apache Spark</a></li>
    </ul>
</p>

<note>
    The example is provided to show what logic you will need on the server side. It is
    provided 'as is' and we hope you find it useful. It is not provided as part of the
    ag-Grid Enterprise product, and as such it is not something we intend to enhance
    and support. It is our intention for ag-Grid users to create their own server side
    connectors to connect into their bespoke data stores. In the future, depending on
    customer demand, we may provide connectors to server sides stores.
</note>

<h2>Selection with Enterprise Row Model</h2>

<p>
    Selecting rows and groups in the enterprise row model is supported.
    Just set the property <code>rowSelection</code> to either <code>single</code>
    or <code>multiple</code> as with any other row model.
</p>

<h3>Selecting Group Nodes</h3>

<p>
    When you select a group, the children of that group may or may not be loaded
    into the grid. For this reason the setting <code>groupSelectsChildren=true</code> (which
    selects all the children of the group when you select a group) does not make
    sense. When you select a group, the group row only will be marked as selected.
</p>

<h2>Example - Click Selection</h2>

<p>
    The example below shows both simple 'click' selection as well as multiple 'shift-click' selections. Selecting groups
    is not allowed as clicking on groups is reserved for opening and closing the groups.
</p>

<ul class="content">
    <li><b>Single 'Click' Selection</b> - when you click on a leaf level row, the row is selected.</li>
    <li><b>Multiple 'Shift-Click' Selections</b> - select a leaf row (single click) and then 'shift-click' another leaf
        row within the same group to select all rows between that range.</li>
</ul>


<?= example('Click Selection', 'click-selection', 'generated', array("enterprise" => 1)) ?>

<note>
    Performing multiple row selections using 'shift-click' has the following restrictions:
    <ul class="content">
        <li>Only works across rows that share the same parent.</li>
        <li>Only works for rows that are loaded (eg a large range selection may span rows that are not loaded).</li>
    </ul>
</note>

<h2>Example - Checkbox Selection</h2>

<p>
    Below shows another example using checkbox selection. The example shows:
    The example shows checkboxes on the groups and a regular column. This is for comparison in the example
    only. Normal applications generally have the checkbox on one column or the groups.
</p>

    <ul class="content">
        <li>
            Checkbox selection on the group column allowing selection of any row.
        </li>
        <li>
            Checkbox selection on the group sport column. Selection is restricted to leaf level rows only
            via <code>gridOptions.isRowSelectable(rowNode)</code> callback.

        </li>
    </ul>
<?= example('Checkbox Example', 'checkbox', 'generated', array("enterprise" => 1)) ?>


<h2>Providing Child Counts</h2>

<p>
    By default, the grid will not show row counts beside the group names. If you do want
    row counts, you need to implement the <code>getChildCount()</code> callback for the
    grid. The callback provides you with the row data, it is your applications responsibility
    to know what the child row count is. The suggestion is you set this information into
    the row data item you provide to the grid.
</p>

<snippet>
gridOptions.getChildCount = function(data) {
    // in this example, the data has the child count
    // stored in the attribute 'childCount'.
    return data.childCount;
};
</snippet>

<h2>Providing Node ID's</h2>

<p>
    Providing node ID's is optional. If you provide your own node id's
    (using the <code>getRowNodeId()</code> callback)
    then you must make sure that the rows have unique ID's across your entire data
    set. This means all the groups and all leaf level nodes must have unique
    id's, even if the leafs are not part of the same group. This is because
    the grid uses node id's internally and requires them to be unique.
</p>

<p>
    If you do not provide node id's, the grid will provide the id's for you,
    and will make sure they are unique.
</p>

<h2>Dynamic Row Height</h2>

<p>
    To enable <a href="../javascript-grid-row-height/#">Dynamic Row Height</a> when using the enterprise row model you need to provide an implementation
    for the 'getRowHeight' Grid Options property. This is demonstrated in the example below:
</p>

<?= example('Dynamic Row Height Example', 'dynamic-row-height', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<note>
    Purging the cache and dynamic row heights do not work together for the Enterprise Row Model.
    If you are using dynamic row height, ensure 'maxBlocksInCache' is not set.
</note>

<h2>Auto Row Height</h2>

<p>
    To have the grid calculate the row height based on the cell contents, set <code>autoHeight=true</code>
    on columns that require variable height. The grid will calculate the height once when the data is loaded
    into the grid.
</p>

<p>
    This is different to the <a href="../javascript-grid-in-memory/">In Memory Row Model</a> where the
    grid height can be changed. For Enterprise Row Model the row height cannot be changed once it is set.
</p>

<p>
    In the example below, the following can be noted:
    <ul>
        <li>All top level groups are the same height.</li>
        <li>All bottom level rows are auto-sized based on the contents of the Auto A, Auto B and Auto C columns.</li>
        <li>All columns with auto-size have CSS <code>white-space: normal</code> to wrap the text.</li>
    </ul>
</p>

<?= example('Auto Row Height Example', 'auto-row-height', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<note>
    Purging the cache and auto row heights do not work together for the Enterprise Row Model.
    If you are using auto row height, ensure 'maxBlocksInCache' is not set.
</note>

<h2>Enterprise Model API</h2>

<p>
    The grid has the following API to allow you to interact with the enterprise cache.
</p>

<table class="table reference">
    <tr>
        <th>Method</th>
        <th>Description</th>
    </tr>
    <tr id="api-purge-virtual-page-cache">
        <th>purgeEnterprisePageCache(route)</th>
        <td><p>Purges the cache. If you pass no parameters, then the top level cache is purged. To
                purge a child cache, then pass in the string of keys to get to the child cache.
                For example, to purge the cache two levels down under 'Canada' and then '2002', pass
                in the string array ['Canada','2002']. If you purge a cache, then all row nodes
            for that cache will be reset to the closed state, and all child caches will be destroyed.</p></td>
    </tr>
    <tr id="api-get-virtual-page-state">
        <th>getEnterprisePageState()</th>
        <td>
            Returns an object representing the state of the cache. This is useful for debugging and understanding
            how the cache is working.</td>
    </tr>
</table>

<p>
    Below shows the API in action. The following can be noted:
</p>

<ul class="content">
    <li>
        Button <b>Purge Everything</b> purges the top level cache.
    </li>
    <li>
        Button <b>Purge [Canada]</b> purges the Canada cache only. To see this in action, make sure you have
        Canada expanded.
    </li>
    <li>
        Button <b>Purge [Canada,2002]</b> purges the 2002 cache under Canada only. To see this in action, make
        sure you have Canada and then 2002 expanded.
    </li>
    <li>
        Button <b>Print Block State</b> prints the state of the blocks in the cache to the console.
    </li>
    <li>
        The example implements <code>getChildCount()</code> to set the child count for each group.
        Your application is responsible for figuring out the child count (maybe it's an attribute you set
        on the data?), the example sets a random number.
    </li>
</ul>

<?= example('API example', 'api', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<h2>Pagination with Enterprise Row Model</h2>

<p>
    To enable pagination when using the enterprise row model, all you have to do is turning pagination on with
    <code>pagination=true</code>. Find an example below:
</p>

<?= example('Pagination Example', 'pagination', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<h2>CRUD</h2>

<p>
    The enterprise row model acts as a cache against the original store of data which typically
    resides on the server side of an application. To add or remove records, the pattern is to update
    the original data set (typically on the server) and then get the enterprise row model to
    refresh.
</p>

<p>
    The example below shows this in action where the following can be noted:
</p>

    <ul class="content">
        <li>The <b>Add Row</b> will add a row before the currently selected row.</li>
        <li>The <b>Remove Row</b> will remove the currently selected row.</li>
        <li>All operations are done outside of the grid and the grid is then told to refresh.</li>
    </ul>

<?= example('Enterprise Row Model & CRUD', 'crud', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
