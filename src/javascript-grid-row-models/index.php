<?php
$pageTitle = "ag-Grid Row Models: Introducing our Row Models";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, we recommend that you choose carefully so that it matches your application. This page gives an overview of each with links to get a detailed view.";
$pageKeyboards = "Javascript Grid Row Model Pagination Infinate Scrolling";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>


    <style>
        .green-tick {
            color: darkgreen;
        }
        .red-x {
            color: darkred;
        }
    </style>

    <h1>
        Row Models
    </h1>
    <p class="lead">
        Depending on your needs, the grid can be configured with different row models. The row models
        differ in how the data is loaded. You can load all the data and hand it
        over to the grid (In Memory Row Model) or you can keep most of the data on the server
        and lazy-load based on what is currently visible to the user (Infinite,
        Viewport and Enterprise Row Models).
    </p>
    <p>
        The following is a summary of the different row models:
    </p>

<div class="docs-homepage-section-preview">
    <div>
    <h2>In Memory</h2>
    <p>

                    This is the default. The grid will load all of the data into the grid in one go.
                    The grid can then perform filtering, sorting, grouping, pivoting and aggregation all in memory.
                
    </p>

    <p> <a href="../javascript-grid-in-memory/">Go to In Memory Row Model</a> </p>
    </div>
</div>
<div class="docs-homepage-section-preview">
    <div>
    <h2>Infinite</h2>
    <p>


                    This will present the data to
                    the user and load more data as the user scrolls down.
                    Use this if you want to display a large flat (not grouped) list of data.
                
                
    </p>

    <p> <a href="../javascript-grid-infinite-scrolling/">Go to Infinite Row Model</a> </p>
    </div>
</div>
<div class="docs-homepage-section-preview">
    <div>
    <h2 class="heading-enterprise">Enterprise</h2>
    <p>
        Enterprise builds on Infinite. It also lazy loads the data as the user scrolls down. In addition it
        allows lazy loading of grouped data with server side grouping and aggregation.
        Advanced users will use Enterprise Row Model to do ad-hoc slice and dice of data with server side aggregations.                
    </p>

    <p> <a href="../javascript-grid-enterprise-model/">Go to Enterprise Row Model</a> </p>
    </div>
</div>
<div class="docs-homepage-section-preview">
    <div>
    <h2 class="heading-enterprise">Viewport</h2>
    <p>
        The grid will inform the server exactly what data it is displaying (first and last row) and the
        server will provide data for exactly those rows only. Use this if you want the server to know exactly
        what the user is viewing, useful for updates in very large live datastreams where server only
        sends updates to clients viewing the impacted rows.
    </p>

    <p> <a href="../javascript-grid-viewport/">Go to Viewport Row Model</a> </p>
    </div>
</div>    
    <p>
        What row model you use is set as a grid property <code>rowModelType</code>. Set it to one of
        <code>inMemory, infinite, viewport, enterprise</code>. The default is <code>inMemory</code>.
    </p>

    <h2 id="when-to-use">When to Use</h2>

    <p>
        Which row model you use will depend on your application. Here are some quick rules of thumb:
</p>
        <ul class="content">
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
                Don't use <b>Viewport Row Model</b> unless you understand what its advantages are and when
                you need them. We find many of our users use Viewport Row Model when they
                don't need to and end up with more complicated applications as a result.
            </li>
        </ul>

        <p>Here are more detailed rules of thumb.</p>

        <ul class="content">
            <li>
                If you are not sure, use default <b><a href="../javascript-grid-in-memory/">In Memory</a></b>.
                The grid can handle massive (100k+) amounts of data. The grid will only
                render what's visible on the screen (40 rows approximately, depending on your screen size) even if you have thousands of rows returned from your
                server. You will not kill the grid with too much data - rather your browser will run out of memory before
                the grid gets into problems. So if you are unsure, go with In Memory row model first and only change if you need to.
                With In Memory, you get sorting, filtering, grouping, pivoting and aggregation all done for you by the grid.
                All of the examples in the documentation use the In Memory model unless specified
                otherwise.
            </li>
            <li>
                If you do not want to shift all the data from your server to your client, as the amount of data is too
                large to shift over the network or to extract from the underlying datasource, then use either infinite,
                enterprise or viewport. Each one takes data from the server in different ways.
            </li>
            <li>
                Use <b><a href="../javascript-grid-infinite-scrolling/">Infinite</a></b> or
                <b><a href="../javascript-grid-enterprise-model/">Enterprise</a></b>
                to bring back a list of data one block at a time from the server.
                As the user scrolls the grid will ask for more rows.
                Enterprise has more features than Infinite and will allow row grouping, aggregation,
                lazy loading of groups and slice and dice of data.
            </li>
            <li>
                Use <b><a href="../javascript-grid-viewport/">Viewport</a></b> if you want the server to know exactly what the user is looking at.
                This is best when you have a large amount of changing data and want to push updates
                to the client when the server side data changes. Knowing exactly what the user is looking
                at means you only have to push updates to the relevant users. All the row models can receive
                updates however only the Viewport row model provides the server with the information of the rows
                the users currently sees on screen without scrolling.</li>
            </li>
        </ul>
    </p>

    <h2>Row Model Comparisons</h2>

    <p>
        Below is a quick feature comparison of all the grids features across all four row models.
    </p>

    <table class="row-model-table reference">
        <tr class="first-row">
            <th>Feature</th>
            <th>In Memory</th>
            <th>Infinite</th>
            <th>Enterprise</th>
            <th>Viewport</th>
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
            <td><a href="../javascript-grid-sorting/">Row Sorting</a></td>
            <td><span class="green-tick">&#10004;</span> (client)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-filtering/">Row Filtering</a></td>
            <td><span class="green-tick">&#10004;</span> (client)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-filter-quick/">Quick Filter</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-filtering/#floatingFilter">Floating Filters</td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-row-height/">Dynamic Row Height</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-grouping/">Row Grouping</a></td>
            <td><span class="green-tick">&#10004;</span> (client)</td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-grouping/">Row Pivoting</a></td>
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
            <td><a href="../javascript-grid-aggregation/">Value Aggregation</a></td>
            <td><span class="green-tick">&#10004;</span> (client)</td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="green-tick">&#10004;</span> (server)</td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-selection/">Row Selection</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-selection/#headerCheckboxSelection">Header Checkbox Selection</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-range-selection/">Range Selection</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-column-spanning/">Column Spanning</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-pinning/">Column Pinning</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-row-pinning/">Row Pinning</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-pagination/">Pagination</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-filter-component/">Custom Filters</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-cell-editor/">Cell Editors</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-cell-rendering-components/">Cell Renderers</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-value-getters/">Value Getter</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-value-setters/">Value Setter</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-value-getters/">Value Formatter</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-value-setters/">Value Parser</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-tree/">Tree Data</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-full-width-rows/">Full Width Rows</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-full-width-rows/#flowerNodes">Flower Nodes</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
            <td><span class="red-x">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-export/">CSV Export</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004; (Data on screen)</span></td>
            <td><span class="green-tick">&#10004; (Data on screen)</span></td>
            <td><span class="green-tick">&#10004; (Data on screen)</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-excel/">Excel Export</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004; (Data on screen)</span></td>
            <td><span class="green-tick">&#10004; (Data on screen)</span></td>
            <td><span class="green-tick">&#10004; (Data on screen)</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-clipboard/">Clipboard Copy & Paste</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-data-update/#transactions">Update via Transaction</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004; (Add Only)</span></td>
            <td><span class="green-tick">&#10005;</span></td>
            <td><span class="green-tick">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-clipboard/#batch-transactions">Update via Batch</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10005;</span></td>
            <td><span class="green-tick">&#10005;</span></td>
            <td><span class="green-tick">&#10005;</span></td>
        </tr>
        <tr class="item-row">
            <td><a href="../javascript-grid-selection/#specify-selectable-rows">Specify Selectable Rows</a></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10004;</span></td>
            <td><span class="green-tick">&#10005;</span></td>
        </tr>
    </table>

    <h2>Deeper Understanding of Row Models</h2>

    <p>
        The grid follows an MVC pattern. Each data item is wrapped in a <strong>Row Node</strong> and then
        stored in the <strong>Row Model</strong>. The grid rendering engine is called <strong>Row Renderer</strong>
        and listens for changes to the row model and updates the DOM accordingly.
    </p>

    <p>
        Below shows a simplified version of a class diagram showing the relationships between the major classes
        involved with the row models.
    </p>

    <p>
        <img src="./rowmodels.svg" class="img-fluid">
    </p>

    <p>
        The following should be noted from the diagram:
</p>
        <ul class="content">
            <li>
                The grid has exactly one <code>RowRenderer</code> instance. The RowRenderer contains a reference to the PaginationProxy
                where it asks for the rows one at a time for rendering.
            </li>
            <li>
                The grid has exactly one <code>PaginationProxy</code> instance. The PaginationProxy will either a) do nothing
                if pagination is not active and just forward all requests to the Row Model or b) do pagination if
                pagination is active. The PaginationProxy has exactly one RowModel instance.
            </li>
            <li>
                You can configure the grid to use any of the provided <b>Row Models</b> - that's why RowModel is in
                italics, it means it's an interface, the concrete implementation is what you decide when configuring the grid.
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

    <h2>Pagination</h2>

    <p>
        Pagination can be applied to any of the row model types. The documentation on each row model
        type covers pagination for that row model type.
    </p>

    <h2>Grid Datasource</h2>

    <p>
        The <a href="../javascript-grid-in-memory/">In Memory</a> row model does not need a datasource.
        <a href="../javascript-grid-infinite-scrolling/">Infinite</a>,
        <a href="../javascript-grid-viewport/">Viewport</a> and
        <a href="../javascript-grid-enterprise-model/">Enterprise</a> all use a datasource. The documentation
        on each row model type explains how to configure the datasource for the particular row model.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>