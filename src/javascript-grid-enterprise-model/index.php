<?php
$key = "Enterprise";
$pageTitle = "ag-Grid New Enterprise Model";
$pageDescription = "ag-Grid is going bringing datagrids to the next level with its Enterprise Data Model, allowing slicing and dicing of data driven by your UI.";
$pageKeyboards = "ag-Grid Enterprise Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1" id="enterpriseRowModel">
    <img src="../images/enterprise_50.png" title="Enterprise Feature"/>
    Enterprise Row Model
</h1>

<p>
    The Enterprise Row Model is arguably the most powerful of the row models in ag-Grid
    and presents the ultimate 'big data' user experience, allowing the user to
    navigate through very large data sets using a mixture of server side grouping and aggregation
    while using infinite scrolling to bring the data back in blocks to the client.
</p>

<h1>Enterprise Row Model Features</h1>

<p>
    The best way to learn what the Enterprise Model does is to break it down into the core features.
    You may benefit from the combination of all these
    features or just be interested in a subset. The features of the
    enterprise row model are:
</p>

<p>
    <ul>
        <li>
            <b>Lazy Loading of Groups:</b> The grid will load the top level rows only. Children
            of groups are only loaded when the user expands the group. Some applications may use
            the Enterprise Row Model for this one feature alone e.g. you might have a managers database table,
            you can display a list of all managers, then click 'expand' on the manager and the grid
            will then request to get the 'employees' for that manager.
        </li>
        <li>
            <b>Server Side Grouping and Aggregation:</b> Because the data is coming back from the server one group
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
            only available in expensive reporting tools, now you can embed it into your JavaScript application.</li>
    </ul>
</p>

<h1>Enterprise Datasource</h1>

<p>
    Similar to the <a href="../javascript-grid-infinite-scrolling/">Infinite Scrolling</a> and
    <a href="../javascript-grid-viewport/">Viewport</a> row models, you provide the grid with a datasource.
    The interface for the datasource is as follows:
</p>

<snippet>
// datasource for enterprise row model
interface IEnterpriseDatasource {

    // just one method, to get the rows
    getRows(params: IEnterpriseGetRowsParams): void;
}</snippet>

<p>
    Each time the grid requires more rows, it will call the <code>getRows()</code> method.
    The method is passed a <code>params</code> object that contains two callbacks (one for
    success and one for failure) and a request object with details what row the grid
    is looking for. The interface for the <code>params</code> is as follows:
</p>

<snippet>
interface IEnterpriseGetRowsParams {

    // details for the request
    request: IEnterpriseGetRowsRequest;

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

    // details for the request
    rowGroupCols: ColumnVO[];

    // columns that have aggregations on them
    valueCols: ColumnVO[];

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

<h1>Example - Predefined Master Detail - Mocked Server</h1>

<p>
    Below shows an example of predefined master / detail using the olympic winners dataset.
    It is pre-defined as we set the grid with a particular grouping, and then
    our datasource knows that the grid will either be asking for the top level
    nodes (country list) OR the grid will be looking for the leaf nodes (winners
    for a particular country).
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
    <ul>
        <li><b>Grouping:</b> The data is grouped by country.</li>
        <li><b>Aggregation:</b> The server always sum's gold, silver and bronze.
            The columns are not set as value columns, and hence the user cannot change
            the aggregation function via the column menu. The server just assumes if grouping,
            then these columns should be aggregated using a sum function.
        </li>
        <li><b>Sorting:</b> The sorting, similar to filtering, is done on the server side.
            For example, sort by Athlete, then expand a group and you will
            see Athlete is sorted. </li>
    </ul>
</p>

<?= example('Simple Example', 'simple', 'vanilla', array("enterprise" => 1)) ?>

<h1>Example - Slice and Dice - Mocked Server</h1>

<p>
    Below shows an example of slicing and dicing the olympic winners. The user
    has full control over what they aggregate over by dragging the columns to the
    group drop zone. For example, in the example below, you can remove the grouping
    on 'country' and group by 'year' instead, or you can group by both.
</p>

<p>
    For your application, your server side would need to understand the requests
    from the client. Typically this would be used in a reporting scenario, where the
    server side would build SQL (or the SQL equivalent if using a no-SQL data store)
    and run it against the data store.
</p>

<p>
    This example also demonstrates filtering on the 'Age' Column.
</p>

<note>When filtering using the Enterprise Row Model it's important to specify the filter parameter: <i>newRowsAction: 'keep'</i>.
    This is to prevent the filter from being reset.
</note>


<p>
    A mock data store is used in the following example for demonstration purposes.
</p>



<h1>Example - Slice and Dice - Real Server</h1>

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

<note>
    The example is provided to show what logic you will need on the server side. It is
    provided 'as is' and we hope you find it useful. It is not provided as part of the
    ag-Grid Enterprise product, and as such it is not something we intend to enhance
    and support. It is our intention for ag-Grid users to create their own server side
    connectors to connect into their bespoke data stores. In the future, depending on
    customer demand, we may provide connectors to server sides stores.
</note>

<h1 id="selection">Selection with Enterprise Row Model</h1>

<p>
    Selecting rows and groups in the enterprise row model is supported.
    Just set the property <i>rowSelection</i> to either <i>single</i>
    or <i>multiple</i> as with any other row model.
</p>

<h4 id="selection"><b>Selecting Group Nodes</b></h4>
<p>
    When you select a group, the children of that group may or may not be loaded
    into the grid. For this reason the setting <code>groupSelectsChildren=true</code> (which
    selects all the children of the group when you select a group) does not make
    sense. When you select a group, the group row only will be marked as selected.
</p>

<h1 id="selection">Example - Click Selection</h1>

<p>
    The example below shows both simple 'click' selection as well as multiple 'shift-click' selections. Selecting groups
    is not allowed as clicking on groups is reserved for opening and closing the groups.

<ul>
    <li><b>Single 'Click' Selection</b> - when you click on a leaf level row, the row is selected.</li>
    <li><b>Multiple 'Shift-Click' Selections</b> - select a leaf row (single click) and then 'shift-click' another leaf
        row within the same group to select all rows between that range.</li>
</ul>

</p>

<?= example('Slice And Dice', 'slice-and-dice', 'vanilla', array("enterprise" => 1)) ?>

<note>
    Performing multiple row selections using 'shift-click' has the following restrictions:
    <ul>
        <li>Only works across rows that share the same parent.</li>
        <li>Only works for rows that are loaded (eg a large range selection may span rows that are not loaded).</li>
    </ul>
</note>

<h1 id="selection">Example - Checkbox Selection</h1>

<p>
    Below shows another example using checkbox selection. The example shows:
    <ul>
        <li>
            Checkbox selection on the group column allowing selection of any row.
        </li>
        <li>
            Checkbox selection on the group year column allowing selection on leaf
            level rows only.
        </li>
    </ul>
    The example shows checkboxes on two columns. This is for comparison in the example
    only. Normal applications generally have the checkbox only on one column.
</p>

<?= example('Checkbox Example', 'checkbox', 'vanilla', array("enterprise" => 1)) ?>


<h1 id="selection">Providing Node ID's</h1>
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

<h1 id="enterprise-dynamic-row-height">Dynamic Row Height</h1>

<p>
    To enable <a href="../javascript-grid-row-height/#">Dynamic Row Height</a> when using the enterprise row model you need to provide an implementation
    for the 'getRowHeight' Grid Options property. This is demonstrated in the example below:
</p>

<?= example('Dynamic Row Height Example', 'dynamic-row-height', 'vanilla', array("enterprise" => 1)) ?>

<note>
    Purging the cache and dynamic row heights do not work together for the Enterprise Row Model.
    If you are using dynamic row height, ensure 'maxBlocksInCache' is not set.
</note>

<h1 id="api">Enterprise Model API</h1>

<p>
    The grid has the following API to allow you to interact with the enterprise cache.
</p>

<table class="table">
    <tr>
        <th>Method</th>
        <th>Description</th>
    </tr>
    <tr id="api-purge-virtual-page-cache">
        <th>purgeInfinitePageCache(route)</th>
        <td><p>Purges the cache. If you pass no parameters, then the top level cache is purged. To
                purge a child cache, then pass in the string of keys to get to the child cache.
                For example, to purge the cache two levels down under 'Canada' and then '2002', pass
                in the string array ['Canada','2002']. If you purge a cache, then all row nodes
            for that cache will be reset to the closed state, and all child caches will be destroyed.</p></td>
    </tr>
    <tr id="api-get-virtual-page-state">
        <th>getInfinitePageState()</th>
        <td>
            Returns an object representing the state of the cache. This is useful for debugging and understanding
            how the cache is working.</td>
    </tr>
</table>

<p>
    Below shows the API in action. The following can be noted:
<ul>
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
</ul>
</p>

<?= example('API example', 'api', 'vanilla', array("enterprise" => 1)) ?>

<h1 id="pagination">Pagination with Enterprise Row Model</h1>
<p>
    To enable pagination when using the enterprise row model, all you have to do is turning pagination on with
    <code>pagination=true</code>. Find below an example.
</p>

<show-complex-example example="exampleEnterpriseSimplePagination.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleEnterpriseSimplePagination.html,exampleEnterpriseSimplePagination.js,mockServerSimple.js' }
                                ]
                              }"
                      exampleheight="500px">
</show-complex-example>

<?php include '../documentation-main/documentation_footer.php';?>
