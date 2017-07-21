<?php
$key = "Row Models";
$pageTitle = "Row Models";
$pageDescription = "ag-Grid can be configured to retrieve rows from the server in different ways. Select which way is best for your application.";
$pageKeyboards = "Javascript Grid Row Model Pagination Infinate Scrolling";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<div>

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

        .green-tick {
            color: darkgreen;
        }
        .red-x {
            color: darkred;
        }
    </style>

    <h1 class="first-h1" id="row-models">
        <img src="../images/svg/docs/row_models.svg" width="50" />
        Row Models
    </h1>

    <p>
        Depending on your needs, the grid can be configured with different row models. The row models
        differ in how the data is loaded. You can load all the data and hand it
        over to the grid (In Memory Row Model) or you can keep most of the data on the server
        and lazy-load based on what is currently visible to the user (Infinite,
        Viewport and Enterprise Row Models).
    </p>
    <p>
        The following is a summary of the different row models:
        <ul>
            <li>
                <a href="../javascript-grid-in-memory/"><b>In Memory:</b></a> This is the default. The grid will load all of the data into the grid in one go.
                The grid can then perform filtering, sorting, grouping, pivoting and aggregation all in memory.</li>
            <li>
                <a href="../javascript-grid-infinite-scrolling/"><b>Infinite:</b></a> This will present the data to
                the user and load more data as the user scrolls down.
                Use this if you want to display a large (to large to bring back from the server
                in one go) flat list (not grouped) of data.
            </li>
            <li>
                <a href="../javascript-grid-enterprise-model/"><b>Enterprise:</b></a>
                Enterprise builds on Infinite, is also lazy loads the data as teh user scrolls down. In addition it
                also allows lazy loading of grouped data with server side grouping and aggregation.
                Advanced users will use Enterprise Row Model to do ad-hoc slice and dice of data with server side aggregations.
            </li>
            <li>
                <a href="../javascript-grid-viewport/"><b>Viewport:</b></a> This will present the data to the user on screen with a vertical scrollbar.
                The grid will inform the server exactly what data it is displaying (first and last row) and the
                server will provide data for exactly those rows only. Use this if you want the server to know exactly
                what the user is viewing, typically used for updates in live datastreams (as server knows exactly
                what each user is looking at).
            </li>
        </ul>
    </p>

    <p>
        What row model you use is set as a grid property <code>rowModelType</code>. Set it to one of
        <i>{inMemory, infinite, viewport, enterprise}</i>. The default is <code>inMemory</code>.
    </p>

    <h1 id="when-to-use">When to Use</h1>

    <p>
        Which row model you use will depend on your application. Here are some quick rules of thumb:
        <ul>
            <li>
                If using <b>ag-Grid Free</b>, use <b>In Memory Row Model</b> if you want to load all
                your data into the browser, or <b>Infinite Row Model</b> if you want to load it in blocks.
            </li>
            <li>
                If using <b>ag-Grid Enterprise</b>, use <b>In Memory Row Model</b> if you want to load all
                your data into the browser, or <b>Enterprise Row Model</b> if you want to load it in blocks.
                Enterprise Row Model is Infinite Row Model plus more. So if you are an
                ag-Grid Enterprise customer, you should prefer Enterprise Row Model over Infinite Row Model.
            </li>
            <li>
                Don't use <b>Viewport Row Model</b> unless you understand what it's advantages are and
                you need them. We find a lot of users of ag-Grid are using Viewport Row Model when they
                don't need to and end up with more complicated applications as a result.
            </li>
        </ul>

        Here are more detailed rules of thumb.
        <ul>
            <li>
                If you are not sure, use default <b><a href="../javascript-grid-in-memory/">In Memory</a></b>.
                The grid can handle massive (100k+) amounts of data. The grid will only
                render what's visible on the screen (40 rows approx???) even if you have thousands of rows returned from your
                server. You will not kill the grid with too much data - rather your browser will run out of memory before
                the grid gets into problems. So if you are unsure, go with In Memory row model first and only change if you need another.
                With In Memory, you get sorting, filtering, grouping, pivoting and aggregation all done for you by the grid.
                All of the examples in the documentation use the In Memory model unless specifically specified
                otherwise.
            </li>
            <li>
                If you do not want to shift all the data from your server to your client, as the amount of data is too
                large to shift over the network or to extract from the underlying datasource, then use on of infinite,
                enterprise or viewport. Each one takes data from the server in different ways.
            </li>
            <li>
                Use <b><a href="../javascript-grid-infinite-scrolling/">Infinite</a></b> or
                <b><a href="../javascript-grid-enterprise-model/">Enterprise</a></b>
                to bring back a list of data one block at a time from the server.
                As the user scrolls down the grid will ask for more rows.
                Enterprise has more features than Infinite and will allow row grouping, aggregation,
                lazy loading of groups and slice and dice of data.
            </li>
            <li>
                Use <b><a href="../javascript-grid-viewport/">Viewport</a></b> if you want the server to know exactly what the user is looking at.
                This is best when you have a large amount of changing data and want to push updates
                to the client when the server side data changes. Knowing exactly what the user is looking
                at means you only have to push updates to the relevant users.</li>
            </li>
        </ul>
    </p>

    <h1 id="row-model-summary">Row Model Comparisons</h1>

    <p>
        Below is a quick feature comparison of all the grids features across all four row models.
    </p>

    <table class="row-model-table">
        <tr class="first-row">
            <td>Feature</td>
            <td>In Memory</td>
            <td>Infinite</td>
            <td>Enterprise</td>
            <td>Viewport</td>
        </tr>
        <tr class="item-row">
            <td>All Data in Client</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Fetch Data as User Scrolls</td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Row Sorting</td>
            <td><span class="green-tick">&#10004;</span> (client)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
        </tr>
        <tr class="item-row">
            <td>Row Filtering</td>
            <td><span class="green-tick">&#10004;</span> (client)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
        </tr>
        <tr class="item-row">
            <td>Quick Filter</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Floating Filters</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Dynamic Row Height</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Row Grouping</td>
            <td><span class="green-tick">&#10004;</span> (client)</td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Lazy Loading Row Groups</td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Value Aggregation</td>
            <td><span class="green-tick">&#10004;</span> (client)</td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Row Selection</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Select All Checkbox</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Range Selection</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Column Spanning</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Column Pinning</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Row Pinning</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Pagination</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Customer Filters</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Cell Editors</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Cell Renderers</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Value Getter</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Value Setter</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Value Formatter</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Value Parser</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Tree Data</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Full Width Rows</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Flower Nodes</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>CSV Export</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Excel Export</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td>Clipboard Copy & Paste</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td>Value Setters</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
    </table>


    <h1>Deeper Understanding of Row Models</h1>

    <p>
        The grid follows an MVC pattern. Each data item is wrapped in a <code>Row Node</code> and then
        stored in the <code>Row Model</code>. The grid rendering engine is called <code>Row Renderer</code>
        and listens for changes to the row model and updates the DOM accordingly.
    </p>

    <p>
        Below shows a simplified version of a class diagram showing the relationships between the major classes
        involved with the row models.
    </p>

    <p>
        <img src="./rowmodels.svg"/>
    </p>

    <p>
        The following should be noted from the diagram:
        <ul>
            <li>
                The grid has exactly one <b>RowRenderer</b> instance. The RowRenderer contains a reference to the PaginationProxy
                where it asks for the rows one at a time for rendering.
            </li>
            <li>
                The grid has exactly one <b>PaginationProxy</b> instance. The PaginationProxy will either a) do nothing
                if pagination is not active and just forward all requests to the Row Model or b) do pagination if
                pagination is active. The PaginationProxy has exactly one RowModel instance.
            </li>
            <li>
                You can configure the grid to use any of the provided <b>Row Models</b> - that's why RowModel is in
                italics, it means it's an interface, the concrete implementation is what you decide at run time.
                The RowModel contains a list of RowNodes. The RowModel may have a list of all the RowNodes (In Memory Row Model) or have
                a DataSource where it can lazy load RowNodes
            </li>
            <li>
                A <b>RowNode</b> has a reference to exactly one row data item (the client application provides
                the row data items). The RowNode has state information about the row item, such as whether it is
                selected and the height of it.
            </li>
            <li>
                When there is a change in state in the RowNodes, the RowModel fires a <b>modelUpdated</b>
                event which gets the RowRenderer to refresh. This happens for many reasons, or example the
                data is sorted, filtered, a group is opened, or the underlying data has changed.
            </li>
        </ul>
    </p>

    <h1 id="datasource">Pagination</h1>

    <p>
        Pagination can be applied to any of the row model types. The documentation on each row model
        type covers pagination for that row model type.
    </p>

    <h1 id="datasource">Grid Datasource</h1>

    <p>
        The <a href="../javascript-grid-in-memory/">In Memory</a> row model does not need a datasource.
        <a href="../javascript-grid-infinite-scrolling/">Infinite</a>,
        <a href="../javascript-grid-viewport/">Viewport</a> and
        <a href="../javascript-grid-enterprise-model/">Enterprise</a> all use a datasource. The documentation
        on each row model type explains how to configure the datasource for the particular row model.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>