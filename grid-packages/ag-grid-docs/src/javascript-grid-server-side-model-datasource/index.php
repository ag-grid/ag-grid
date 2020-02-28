<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Server-side Datasource </h1>

<p class="lead">
    This section describes the Server-side Datasource and demonstrates how it can be used to lazy load data from a
    server through an infinite scroll.
</p>

<p>
    The Server-side Row Model requires a datasource to fetch rows for the grid. When users scroll or perform grid
    operations such as sorting or grouping more data will be requested via the datasource.
</p>

<h2>Enabling Server-side Row Model</h2>

<p>
    When no row model is specified the grid will use the <a href="../javascript-grid-client-side-model/">Client-side Row Model</a>
    by default. To use the Server-side Row Model instead, set the <code>rowModelType</code> as follows:
</p>

<snippet>
    gridOptions.rowModelType = 'serverSide'
</snippet>

<h2>Implementing the Server-side Datasource</h2>

<p>
    A datasource is used by the Server-side Row Model to fetch rows for the grid. Applications are required to implement
    a datasource that conforms to the <a href="#datasource-interface">Server-side Datasource Interface</a>.
</p>

<p>
    This interface does not impose any restrictions on the server side technologies used.
</p>

<p> The following snippet shows a possible datasource implementation: </p>

<snippet>
var datasource = function getRows(params) {
    var server = lookupServer();

    // get data for request from server
    var response = server.getData(params.request);

    // supply rows for requested block to grid
    params.successCallback(response.rows, response.lastRowIndex);
}
</snippet>

<!--<snippet>-->
<!--function createServerSideDatasource(server) {-->
<!--    return {-->
<!--        getRows: function(params) {-->
<!---->
<!--            // get data for request from server-->
<!--            var response = server.getData(params.request);-->
<!---->
<!--            // supply rows for requested block to grid-->
<!--            params.successCallback(response.rows, response.lastRowIndex);-->
<!--        }-->
<!--    };-->
<!--}-->
<!--</snippet>-->

<p>
Notice that the datasource contains a single method <code>getRows(params)</code> which is called by the grid when more
rows are required. A request is supplied in the <code>params</code> which contains all the information required
by the server to fetch data from the server.
</p>

<p>
Rows fetched from the server are supplied to the grid via <code>params.successCallback(rows,lastRowIndex)</code>.
Note the <code>lastRowIndex</code> can be optionally supplied so the grid. This allows the grid to adjust the height of
the scrollbar match the entire dataset contained on the server.
</p>

<p>
The datasource is registered with the grid via the grid api as follows:
</p>

<snippet>
// register Server-side Datasource with the grid
var datasource = new ServerSideDatasource();
gridOptions.api.setServerSideDatasource(datasource);
</snippet>

<h2>Example - Infinite Scroll</h2>

<p>
    The example below demonstrates lazy loading of data with an infinite scroll. Notice the following:
</p>

<ul class="content">
    <li>The Server-side Row Model is selected using the grid options property: <code>rowModelType = 'serverSide'</code>.</li>
    <li>A datasource is registered with the grid using: <code>api.setServerSideDatasource(datasource)</code>.</li>
    <li>When scrolling down there is a delay when more rows are fetched from the server.</li>
</ul>

<?= grid_example('Infinite Scroll', 'infinite-scroll', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<h2>Datasource Interface</h2>

<p>
    The interface for the Server-sie Datasource is show below:
</p>

<snippet>
interface IServerSideDatasource {
    // grid calls this to get rows
    getRows(params: IServerSideGetRowsParams): void;

    // optional destroy method, if your datasource has state it needs to clean up
    destroy?(): void;
}</snippet>

<p>
    Each time the grid requires more rows, it will call the <code>getRows()</code> method.
    The method is passed a <code>params</code> object that contains two callbacks (one for
    success and one for failure) and a request object with details what row the grid
    is looking for.
</p>

<p>The interface for the <code>params</code> is shown below:</p>

<snippet>
interface IServerSideGetRowsParams {
    // details for the request, simple object, can be converted to JSON
    request: IServerSideGetRowsRequest;

    // the parent row node. is the RootNode (level -1) if request is top level.
    // this is NOT part fo the request as it cannot be serialised to JSON (a rowNode has methods)
    parentNode: RowNode;

    // success callback, pass the rows back the grid asked for.
    // if the total row count is known, provide it via lastRow, so the
    // grid can adjust the scrollbar accordingly.
    successCallback(rowsThisPage: any[], lastRow: number): void;

    // fail callback, tell the grid the call failed so it can adjust its state
    failCallback(): void;

    // grid API
    api: GridApi;

    // column API
    columnApi: ColumnApi;
}</snippet>

<p>
    The request gives details on what the grid is looking for. The success and failure callbacks are not included
    inside the request object to keep the request object simple data (ie simple data types, no functions). This
    allows the request object to be serialised (eg via JSON) and sent to your server.
</p>

<p>The interface for the <code>request</code> is shown below:</p>

<snippet>
interface IServerSideGetRowsRequest {
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
// so the data can be converted to a JSON string and passed to server-side
export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}</snippet>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
     <a href="../javascript-grid-server-side-model-cache-configuration/">Cache Configuration</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
