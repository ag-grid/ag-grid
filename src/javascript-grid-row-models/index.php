<?php
$key = "Row Models";
$pageTitle = "Row Models";
$pageDescription = "ag-Grid can be configured to retrieve rows from the server in different ways. Select which way is best for your application.";
$pageKeyboards = "Javascript Grid Row Model Pagination Infinate Scrolling";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="row-models">
        <img src="../images/svg/docs/row_models.svg" width="50" />
        Row Models
    </h2>

    <p>
        ag-Grid can be configured to retrieve rows from the server in different ways. You should choose the way
        which best suits your needs. The supported ways are as follows:
        <ul>
            <li><b>In Memory:</b> This is the default. The grid will load all of the data into the grid in one go.</li>
            <li><b>Pagination:</b> This is standard pagination, the grid will load the data in pages and provide next & previous buttons.</li>
            <li><b>Virtual Paging:</b> This will present the data to the user in one screen with a vertical scrollbar.
                The grid will retrieve the data from the server in blocks using a least recently used algorithm to
                cache the blocks on the client.</li>
            <li><b>Viewport:</b> This will present the data to the user on screen with a vertical scrollbar.
                The grid will inform the server exactly what data it is displaying (first and last row) and the
                server will provide data for exactly those rows only.</li>
        </ul>
    </p>

    <style>
        .row-model-table .item-row {
            border-top: 1px solid lightgray;
        }
        .row-model-table .first-row {
            background-color: aliceblue;
            font-weight: bold;
        }

        .row-model-table td {
            padding: 4px;
            border-left: 1px solid lightgray;
        }

        .row-model-table {
            border-top: 1px solid lightgray;
            border-bottom: 1px solid lightgray;
            border-right: 1px solid lightgray;
        }
    </style>

    <h3 id="row-model-summary">Row Model Summary</h3>

    <table class="row-model-table">
        <tr class="first-row">
            <td>Model</td>
            <td>Grouping</td>
            <td>Aggregation</td>
            <td>Filtering</td>
            <td>Sorting</td>
            <td>Server State</td>
            <td>Availability</td>
        </tr>
        <tr class="item-row">
            <td>In Memory</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>No</td>
            <td>Free</td>
        </tr>
        <tr class="item-row">
            <td>Pagination</td>
            <td>Per Page</td>
            <td>Per Page</td>
            <td>Per Page or Server Side</td>
            <td>Per Page or Server Side</td>
            <td>No</td>
            <td>Free</td>
        </tr>
        <tr class="item-row">
            <td>Virtual Paging</td>
            <td>No</td>
            <td>No</td>
            <td>Server Side Only</td>
            <td>Server Side Only</td>
            <td>No</td>
            <td>Free</td>
        </tr>
        <tr class="item-row">
            <td>Viewport</td>
            <td>No</td>
            <td>No</td>
            <td>Server Side Only</td>
            <td>Server Side Only</td>
            <td>Yes</td>
            <td>Enterprise</td>
        </tr>
    </table>

    <h3 id="setting-row-model">Setting Row Model</h3>

    <p>
        What row model you use is set as a grid property. Set it to one of <i>{normal, pagination, virtual, viewport}</i>.
        The default is <i>normal</i>.
    </p>

    <h3 id="when-to-use">When to Use</h3>

    <p>
        Which row model you use will depend on your application. Here are some rules of thumb:
    <ul>
        <li>If you are not sure, use default In Memory. The grid can handle massive (100k+) amounts of data. The grid will only
            render what's visible on the screen (40 rows approx???) even if you have thousands of rows returned from your
            server. You will not kill the grid with too much data - rather your browser will run out of memory before
            the grid gets into problems. So if you are unsure, go with In Memory row model first and only change if you need another.</li>
        <li>If you do not want to shift all the data from your server to your client, as the amount of data is too
            large to shift over the network or to extract from the underlying datasource, then use either pagination
            or virtual paging. Each one takes data from the server in blocks. Pagination allows the user to view the
            data using next / previous buttons. Virtual pagination allows the user to view the data with a vertical scroll.</li>
        <li>If you want the server to know exactly what the user is looking at, then use viewport, as this will
            put the state on the server side. This is best when you have changing data and want to push updates
            to the client when the server side data changes.</li>
    </ul>
    </p>

    <h3 id="next-steps">Next Steps</h3>

    <p>
        For <b>In Memory</b> (ie normal) there is nothing else to do. This is the default for the grid and
        no other configuration is required.
    </p>
    <p>
        For <b>Pagination</b> and <b>Virtual Paging</b> you need to create a
        <a href="../javascript-grid-datasource/">Datasource</a>. Then go to the section either on
        <a href="../javascript-grid-pagination/">Pagination</a> or
        <a href="../javascript-grid-virtual-paging/">Virtual Paging</a>. A datasource can be used
        by pagination or virtual paging.
    </p>
    <p>
        For <b>Viewport</b> go to the section
        <a href="../javascript-grid-viewport/">Viewport</a> where you will learn how to create a Viewport
        Datasouce. A ViewportDatasource is used by viewport only.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>