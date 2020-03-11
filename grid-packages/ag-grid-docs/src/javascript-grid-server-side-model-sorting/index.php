<?php
$pageTitle = "Server-side Row Model - Sorting";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Server-side Sorting </h1>

<p class="lead">
    This section covers Server-side Sorting using the Server-side Row Model.
</p>

<h2>Enabling Sorting</h2>

<p>
    Sorting is enabled in the grid via the <code>sortable</code> column definition attribute. Some example column
    definitions with sorting enabled are shown below:
</p>

<snippet>
gridOptions: {
    columnDefs: [
        {field: 'country', sortable: true},
        {field: 'year', sortable: true},
        {field: 'sport'},
    ],

    // other options
}
</snippet>

<p>
    For more details on sorting configurations see the section on <a href="../javascript-grid-sorting/">Row Sorting</a>.
</p>

<h2>Sorting on the Server</h2>

<p>
    The actual sorting of rows is performed on the server when using the Server-side Row Model. When a sort is applied
    in the grid a request is made for more rows via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-side Datasource</a>. The
    supplied params includes a request containing sort metadata contained in the <code>sortModel</code> property.
</p>

<p>
    An example of the contents contained in the <code>sortModel</code> is shown below:
</p>

<snippet>
//IServerSideGetRowsRequest
{
    sortModel: [
        { colId: "country", sort: "asc" },
        { colId: "year", sort: "desc" },
    ],

    // other properties
}
</snippet>

<p>
    Notice in the snippet above that the <code>sortModel</code> contains an array of sorts for each column that has
    active sorts in the grid. The column id and sort type can then be used by the server to perform the actual sorting.
</p>

<h2>Example: Server-side Sorting</h2>

<p>
    The example below demonstrates server-side sorting. Notice the following:
</p>

<ul class="content">
    <li>Try single / multi column (using shift key) sorting by clicking on columns headers.</li>
    <li>All columns have sorting enabled using the <code>defaultColDef</code> grid options property with
        <code>sortable=true</code>.
    </li>
    <li>The server uses the metadata contained in the <code>sortModel</code> to sort the rows.</li>
    <li>Open the browsers dev console to view the <code>sortModel</code> supplied in the request to the datasource.</li>
</ul>

<?= grid_example('Server-side Sorting', 'sorting', 'generated', array("enterprise" => 1, "extras" => array('alasql'))) ?>


<note>
    <p>Fake Server Implementation</p>
    <p>
    Most of the Server-side Row Model examples include a fake server that generates SQL to imitate how a real server
    might use the requests sent from the grid. These examples use <a href="http://alasql.org/">AlaSQL</a> which is a
    JavaScript SQL database that works in browsers.
    </p>
    <p>
        However note that the Server-side Row Model does not impose any restrictions on the server-side technologies used.
    </p>
</note>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
    <a href="../javascript-grid-server-side-model-filtering/">Server-side Filtering</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
