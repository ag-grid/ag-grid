<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Infinite Scroll </h1>

<p class="lead">
    This section introduces the Server-side Row Model with lazy loading of data fetched through an infinite scroll.
</p>

<p>
    To introduce how to implement the
    <a href="../javascript-grid-server-side-model-overview/#server-side-datasource">Server-side Datasource</a> interface
    outlined in the previous section, we will consider the simplest use case for the Server-side Row Model with no grouping or pivoting.
</p>

<h2>Enabling Server-side Row Model</h2>

<p>
    By default the grid will use the <a href="../javascript-grid-client-side-model/">Client-side Row Model</a>, so
    to enable the Server-side Row Model define the <code>rowModelType</code> as follows:
</p>

<snippet>
    gridOptions.rowModelType = 'serverSide'
</snippet>


<h2>Implementing the Server-side Datasource</h2>

<p>
    The following snippet outlines how to implement a <code>ServerSideDatasource</code> and then register it with the grid:
</p>

<snippet>
// create ServerSideDatasource with a reference to your server
function ServerSideDatasource(server) {
    this.server = server;
}

ServerSideDatasource.prototype.getRows = function(params) {
    // invoke your server with request params supplied by grid
    var response = server.getResponse(params.request);

    if (response.success) {
        // call the success callback
        params.successCallback(response.rows, response.lastRow);
    } else {
        // inform the grid request failed
        params.failCallback();
    }
};

// register Server-side Datasource with the grid
var server = getServer();
var datasource = new ServerSideDatasource(server);
gridOptions.api.setServerSideDatasource(datasource);
</snippet>

<h2>Example - Infinite Scroll</h2>

<p>
    The example below demonstrates the following:
</p>

<ul class="content">
    <li><b>Enabling Server-side Row Model: </b> via the grid options property: <code>rowModelType = 'serverSide'</code>.</li>
    <li><b>Lazy-loading:</b> with the grid options property: <code>cacheBlockSize = 100</code> data will be fetched
        in blocks of 100 rows at a time.
    </li>
    <li><b>Auto Purge Cache:</b> to limit the amount of data cached in the grid you can set <code>maxBlocksInCache</code>
    via the gridOptions.</li>
</ul>

<?= example('Infinite Scroll', 'infinite-scroll', 'generated', array("enterprise" => 1)) ?>


<p>
    <h2 style="color: red">TODO: discuss cache configurations!</h2>
</p>


<p>
    Continue to the next section to see how to lazy load data with: <a href="../javascript-grid-server-side-model-grouping/">Row Grouping</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>