<?php
$key = "Enterprise";
$pageTitle = "ag-Grid New Enterprise Model";
$pageDescription = "ag-Grid is going bringing datagrids to the next level with it's Enterprise Data Model, allowing slicing and dicing of data driven by your UI.";
$pageKeyboards = "ag-Grid Enterprise Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h2 id="enterpriseRowModel">
    <img src="../images/enterprise_50.png" title="Enterprise Feature"/>
    Enterprise Row Model
</h2>

<p>
    The Enterprise Row Model is arguably the most powerful of the row models in ag-Grid
    and presents the ultimate 'big data' user experience, allowing the user to
    navigate through very large data sets using a mixture of server side grouping and aggregation
    while using infinite scrolling to bring the data back in blocks to the client.
</p>

<h3>Enterprise Row Model Features</h3>

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
            you can display a list of all managers, then then click 'expand' on the manager and the grid
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

<h3>Enterprise Datasource</h3>

<p>
    Similar to the <a href="../javascript-grid-infinite-scrolling/">Infinite Scrolling</a> and
    <a href="../javascript-grid-viewport/">Viewport</a> row models, you provide the grid with a datasource.
    The interface for the datasource is as follows:
</p>

<pre><span class="codeComment">// datasource for enterprise row model</span>
interface IEnterpriseDatasource {

    <span class="codeComment">// just one method, to get the rows</span>
    getRows(params: IEnterpriseGetRowsParams): void;
}
</pre>

<p>
    Each time the grid requires more rows, it will call the <i>getRows()</i> method.
    The method is passed a <i>params</i> object that contains two callbacks (one for
    success and one for failure) and a request object with details what row the grid
    is looking for. The interface for the <i>params</i> is as follows:
</p>

<pre>interface IEnterpriseGetRowsParams {

    <span class="codeComment">// details for the request</span>
    request: IEnterpriseGetRowsRequest;

    <span class="codeComment">// success callback, pass the rows back the grid asked for</span>
    successCallback(rowsThisPage: any[]): void;

    <span class="codeComment">// fail callback, tell the grid the call failed so it can adjust it's state</span>
    failCallback(): void;
}
</pre>

<p>
    The request, with details about what the grid needs. The success and failure callbacks are not included
    inside the request object to keep the request object simple data. This allows the request object to be
    a candidate for serialising and sending to your server. The request has the following interface:
</p>

<pre>interface IEnterpriseGetRowsRequest {

    <span class="codeComment">// details for the request</span>
    rowGroupCols: ColumnVO[];

    <span class="codeComment">// columns that have aggregations on them</span>
    valueCols: ColumnVO[];

    <span class="codeComment">// what groups the user is viewing</span>
    groupKeys: string[];

    <span class="codeComment">// if filtering, what the filter model is</span>
    filterModel: any;

    <span class="codeComment">// if sorting, what the sort model is</span>
    sortModel: any;
}

<span class="codeComment">// we pass a VO (Value Object) of the column and not the column itself,</span>
<span class="codeComment">// so the data can be converted to a JSON string and passed to server side</span>
export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}
</pre>

<p>
    All the interfaces above is a lot to take in. The best thing to do is look at the examples below
    and debug through them with the web console and observed what is passed back as you interact
    with the grid.
</p>

<h3>Example - Predefined Master Detail - Mocked Server</h3>

<p>
    Below shows an example of predefined master / detail using the olympic winners dataset.
    It is pre-defined as we set the grid with a particular grouping, and then
    our datasource knows that the grid will either be asking for the top level
    nodes (country list) OR the grid will be looking for the leaf nodes (winners
    for a particular country).
</p>

<p>
    In your application, your server side would know where to get the data based
    on what the user is looking for, eg it could go to a relational database table
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
        <li><b>Filtering:</b> The age, country and year columns have filters.
            The filter state is passed to the server to allow executing the filter on the server side.</li>
        <li><b>Sorting:</b> The sorting, similar to filtering, is done on the server side.
            For example, sort by Athlete, then expand a group and you will
            see Athlete is sorted. </li>
    </ul>
</p>

<show-complex-example example="exampleEnterpriseSimple.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleEnterpriseSimple.html,exampleEnterpriseSimple.js,mockServerSimple.js' }
                                ]
                              }"
                      exampleheight="500px">
</show-complex-example>

<h3>Example - Slice and Dice - Mocked Server</h3>

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
    The example below mocks a data store for demonstration purposes.
</p>

<show-complex-example example="exampleEnterpriseSliceAndDice.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleEnterpriseSliceAndDice.html,exampleEnterpriseSliceAndDice.js,columns.js,mockServerComplex.js' }
                                ]
                              }"
                      exampleheight="500px">
</show-complex-example>

<h3>Example - Slice and Dice - Real Server</h3>

<p>
    It is not possible to put up a full end to end example of the Enterprise row model
    on the documentation website, as we cannot host servers on our website.
    Instead we have put a full end to end example
    in Github at <a href="https://github.com/ceolter/ag-grid-enterprise-mysql-sample/">
    https://github.com/ceolter/ag-grid-enterprise-mysql-sample/</a>.
</p>

<p>
    The example puts all the olympic winners data into a MySQL database and creates SQL
    on the fly based on what the user is querying. This is a full end to end example of
    the type of slicing and dicing we want ag-Grid to be able to do in your enterprise
    applications.
</p>

<h3 id="selection">Example - Selection with Enterprise Row Model</h3>

<p>
    And this is how you do selection.
</p>

<p>
    If providing your own id's, the id's MUST be unique across the grid, for both
    groups and rows. You must provide your own id's to keep selection when you sort
    or filter.
</p>

<show-complex-example example="exampleEnterpriseSelection.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleEnterpriseSelection.html,exampleEnterpriseSelection.js,mockServerComplex.js' }
                                ]
                              }"
                      exampleheight="500px">
</show-complex-example>

<p>
    And checkbox selection
</p>

<show-complex-example example="exampleEnterpriseCheckboxSelection.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleEnterpriseCheckboxSelection.html,exampleEnterpriseCheckboxSelection.js,mockServerComplex.js' }
                                ]
                              }"
                      exampleheight="500px">
</show-complex-example>

<h3 id="api">Enterprise Model API</h3>

<p>
    The grid has the following API to allow you to interact with the enterprise cache.
</p>

<table class="table">
    <tr>
        <th>Method</th>
        <th>Description</th>
    </tr>
    <tr id="api-purge-virtual-page-cache">
        <th>purgeInfinitePageCache(route: string[])</th>
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

<show-complex-example example="exampleEnterpriseApi.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleEnterpriseApi.html,exampleEnterpriseApi.js,columns.js,mockServerComplex.js' }
                                ]
                              }"
                      exampleheight="500px">
</show-complex-example>

<h3 id="pagination">Example - Pagination with Enterprise Row Model</h3>
<p>
    To enable pagination when using the enterprise row model, all you have to do is turning pagination on with
    <i>pagination=true</i>. Find below an example.
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
