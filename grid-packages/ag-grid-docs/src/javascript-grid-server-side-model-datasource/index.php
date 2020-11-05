<?php
$pageTitle = "Server-Side Row Model - Datasource";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Datasource</h1>

<p class="lead">
    This section describes the Server-Side Datasource and demonstrates how it can be used to lazy-load data from a
    server through an infinite scroll.
</p>

<p>
    The Server-Side Row Model (SSRM) requires a datasource to fetch rows for the grid. As the grid requires more
    data (eg the user scrolls down and Infinite Scrolling is active) more data will be requested via the datasource.
</p>

<note>
    The SSRM does not impose any restrictions on the server-side technologies used. It is left up
    to applications to decide how and where data is sourced for the grid.
</note>

<h2>Enabling Server-Side Row Model</h2>

<p>
    When no row model is specified the grid will use the <a href="../javascript-grid-client-side-model/">Client-Side Row Model</a>
    by default. To use the SSRM instead, set the <code>rowModelType</code> as follows:
</p>

<?= createSnippet("gridOptions.rowModelType = 'serverSide'") ?>

<h2>Implementing the Server-Side Datasource</h2>

<p>
    A datasource is used by the SSRM to fetch rows for the grid. Applications are required to implement
    a datasource that conforms to the <a href="#datasource-interface">Server-Side Datasource</a> interface.
</p>

<p>The following snippet shows a simple datasource implementation:</p>

<?= createSnippet(<<<SNIPPET
function createDatasource(server) {
    return {
        // called by the grid when more rows are required
        getRows: function(params) {

            // get data for request from server
            var response = server.getData(params.request);

            if (response.success) {
                // supply rows for requested block to grid
                params.success({
                    rowData: response.rows,
                    rowCount: response.lastRow
                });
            } else {
                // inform grid request failed
                params.fail();
            }
        }
    };
}
SNIPPET
) ?>

<p>
    Notice that the datasource contains a single method <code>getRows(params)</code> which is called by the grid when more
    rows are required. A request is supplied in the <code>params</code> which contains all the information required
    by the server to fetch data from the server.
</p>

<p>
    Rows fetched from the server are supplied to the grid via <code>params.success()</code>.
    Note the <code>rowCount</code> can be optionally supplied to the grid.
</p>

<h2>Registering the Datasource</h2>

<p>
    The datasource is registered with the grid via either a) the grid property <code>serverSideDatasoruce</code>
    or b) the grid API.
</p>

<?= createSnippet(<<<SNIPPET

// Create Datasource
var myDatasource = createDatasource();

// Option A - Register via Grid Property
gridOptions = {
    serverSideDatasource: myDatasource
}

// Optoin B - Register via API
gridOptions.api.setServerSideDatasource(myDatasource);
SNIPPET
) ?>

<h2>Simple Example</h2>

<p>
    The example below demonstrates lazy-loading of data with an infinite scroll. Notice the following:
</p>

<ul class="content">
    <li>The Server-Side Row Model is selected using the grid options property: <code>rowModelType = 'serverSide'</code>.</li>
    <li>The datasource is registered with the grid using: <code>api.setServerSideDatasource(datasource)</code>.</li>
    <li>A request is contained in params supplied to <code>getRows(params)</code> with <code>startRow</code> and <code>endRow</code>.
        This is used by the server to determine the range of rows to return.</li>
    <li>When scrolling down there is a delay as more rows are fetched from the server.</li>
    <li>Open the browser's dev console to view the contents of the requests made by the grid for more rows.</li>
</ul>

<?= grid_example('Infinite Scroll', 'infinite-scroll', 'generated', ['enterprise' => true, 'modules' => ['serverside', 'menu', 'columnpanel']]) ?>

<h2>Datasource Interface</h2>

<p>
    The interface for the Server-sie Datasource is show below:
</p>

<?= createSnippet(<<<SNIPPET
interface IServerSideDatasource {
    // grid calls this to get rows
    getRows(params: IServerSideGetRowsParams): void;

    // optional destroy method, if your datasource has state it needs to clean up
    destroy?(): void;
}
SNIPPET
, 'ts') ?>

<p>
    Each time the grid requires more rows, it will call the <code>getRows()</code> method.
    The method is passed a <code>params</code> object that contains two callbacks (one for
    success and one for failure) and a request object with details what row the grid
    is looking for.
</p>

<p>The interface for the <code>params</code> is shown below:</p>

<?= createSnippet(<<<SNIPPET

interface IServerSideGetRowsParams {
    // details for the request, simple object, can be converted to JSON
    request: IServerSideGetRowsRequest;

    // the parent row node. is the RootNode (level -1) if request is top level.
    // this is NOT part of the request as it cannot be serialised to JSON (a rowNode has methods)
    parentNode: RowNode;

    // success callback
    success(params: LoadSuccessParams): void;

    // fail callback, tell the grid the call failed so it can adjust its state
    fail(): void;

    // grid API
    api: GridApi;

    // column API
    columnApi: ColumnApi;
}
SNIPPET
, 'ts') ?>

<p>
    The request gives details on what the grid is looking for. The success and failure callbacks are not included
    inside the request object to keep the request object simple data (i.e. simple data types, no functions). This
    allows the request object to be serialised (e.g. via JSON) and sent to your server.
</p>

<p>The interface for the <code>request</code> is shown below:</p>

<?= createSnippet(<<<SNIPPET
interface IServerSideGetRowsRequest {
    // for Partial Store only, first row requested
   startRow: number;

   // for Partial Store only, last row requested
   endRow: number;

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
interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}
SNIPPET
, 'ts') ?>

<p>
    In the example above, no sorting, filter, grouping or pivoting was active. This means the request didn't have any
    information for these. The only attributes used in the above example were
    <code>startRow</code> and <code>endRow</code>.
</p>

<h2>Success Callback</h2>

<p>
    The success callback passes rows to the grid with the following parameters:
</p>

<?= createSnippet(<<<SNIPPET
// The success() callback uses the following params
interface LoadSuccessParams {

    // data retreived from the server
    rowData: any[];

    // the last row, if known
    rowCount?: number;

    // any extra info for the grid to associate with this load
    storeInfo?: any;
}
SNIPPET
, 'ts') ?>

<p>
    The <code>rowData</code> attribute provides the grid with the requested data.
</p>

<p>
    The <code>rowCount</code> is used when Partial Store is used. When the total row count
    is known, this should be passed to the grid to enable the grid to set the vertical scroll range. This
    then allows the user to scroll the full extend of the dataset and the grid will never ask for data
    past the provided row count. Otherwise the grid will assume the total number of rows is not known and the vertical scrollbar
    range will grow as the user scrolls down (the default behaviour for Partial Store).
</p>

<p>
    The <code>info</code> is additional data the application can pass to the grid about a particular load.
    This is useful when doing <a href="../javascript-grid-server-side-model-high-frequency/">High
    Frequency Updates</a> and explained further in that section.
</p>

<h2>Fail Callback</h2>

<p>
    The Fail callback has no parameters. It informs the grid the request has failed - eg a network error.
    It is important to inform the grid of failed requests as it limits the number of concurrent datasource requests.
    If the Fail callback was not called, the grid would still count the request as pending. For example
    if the grid was configured with <code>maxConcurrentDatasourceRequests = 1</code>, only one request can
    be pending at any time, and all other requests would be paused until either the Fail or Success callbacks
    were called for the outstanding request.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
     <a href="../javascript-grid-server-side-model-row-stores/">Row Stores</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
