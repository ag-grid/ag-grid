<?php
$pageTitle = "ag-Grid Row Models: Introducing our Row Models";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, we recommend that you choose carefully so that it matches your application. This page gives an overview of each with links to get a detailed view.";
$pageKeywords = "Javascript Grid Row Model Pagination Infinite Scrolling";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1>Row Models</h1>

<p class="lead">
    The grid can be configured with different strategies for loading row data into the grid, which are encapsulated into
    different Row Models. Changing which Row Model the grid is using means changing the strategy the grid is using for
    loading rows.
</p>

<p>
    The grid comes with four row models:
</p>

<ol>
    <li>Client-Side</li>
    <li>Server-Side</li>
    <li>Infinite</li>
    <li>Viewport</li>
</ol>

<p>
    The Client-Side Row Model deals with client-side data. The Server-Side, Infinite and Viewport
    Row Models deal with server-side data. The following is a summary of each:
</p>

<ul>
    <li>
        <h2>Client-Side</h2>
        <p>
            This is the default. The grid will load all of the data into the grid in one go.
            The grid can then perform filtering, sorting, grouping, pivoting and aggregation all in memory.
        </p>

        <p><a href="../javascript-grid-client-side-model/">Go to Client-Side Row Model</a></p>
    </li>
    <li>
        <h2>Infinite</h2>
        <p>
            This will present the data to the user and load more data as the user scrolls down.
            Use this if you want to display a large, flat (not grouped) list of data.
        </p>

        <p><a href="../javascript-grid-infinite-scrolling/">Go to Infinite Row Model</a></p>
    </li>
    <li>
        <h2 class="heading-enterprise">Server-Side</h2>
        <p>
            The Server-Side Row Model builds on the Infinite Row Model. In addition to lazy-loading the data as the
            user scrolls down, it also allows lazy-loading of grouped data with server-side grouping and aggregation.
            Advanced users will use Server-Side Row Model to do ad-hoc slice and dice of data with server-side aggregations.
        </p>

        <p><a href="../javascript-grid-server-side-model/">Go to Server-Side Row Model</a></p>
    </li>
    <li>
        <h2 class="heading-enterprise">Viewport</h2>
        <p>
            The grid will inform the server exactly what data it is displaying (first and last row) and the
            server will provide data for exactly those rows only. Use this if you want the server to know exactly
            what the user is viewing, useful for updates in very large live datastreams where the server only
            sends updates to clients viewing the impacted rows.
        </p>

        <p><a href="../javascript-grid-viewport/">Go to Viewport Row Model</a></p>
    </li>
</ul>

<p>
    Which row model you use is set as a grid property <code>rowModelType</code>. Set it to one of
    <code>'clientSide'</code>, <code>'infinite'</code>, <code>'viewport'</code>, or <code>'serverSide'</code>.
    The default is <code>'clientSide'</code>.
</p>

<h2 id="when-to-use">When to Use</h2>

<p>
    Which row model you use will depend on your application. Here are some quick rules of thumb:
</p>

<ul class="content">
    <li>
        If using <b>ag-Grid Community</b>, use <b>Client-Side Row Model</b> if you want to load all
        your data into the browser, or <b>Infinite Row Model</b> if you want to load it in blocks.
    </li>
    <li>
        If using <b>ag-Grid Enterprise</b>, use <b>Client-Side Row Model</b> if you want to load all
        your data into the browser, or <b>Server-Side Row Model</b> if you want to load it in blocks.
        Server-Side Row Model is Infinite Row Model plus more. So if you are an
        ag-Grid Enterprise customer, you should prefer Server-Side Row Model over Infinite Row Model.
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
        If you are not sure, use default <b><a href="../javascript-grid-client-side-model/">Client-Side</a></b>.
        The grid can handle massive amounts of data (100k+ rows). The grid will only
        render what's visible on the screen (40 rows approximately, depending on your screen size) even if you have thousands of rows returned from your
        server. You will not kill the grid with too much data - rather your browser will run out of memory before
        the grid gets into problems. So if you are unsure, go with Client-Side Row Model first and only change if you need to.
        With Client-Side, you get sorting, filtering, grouping, pivoting and aggregation all done for you by the grid.
        All of the examples in the documentation use the Client-Side model unless specified
        otherwise.
    </li>
    <li>
        If you do not want to shift all the data from your server to your client, as the amount of data is too
        large to shift over the network or to extract from the underlying datasource, then use either Infinite,
        Server-Side or Viewport. Each one takes data from the server in different ways.
    </li>
    <li>
        Use <b><a href="../javascript-grid-infinite-scrolling/">Infinite</a></b> or
        <b><a href="../javascript-grid-server-side-model/">Server-Side</a></b>
        to bring back a list of data one block at a time from the server.
        As the user scrolls, the grid will ask for more rows.
        Server-Side has more features than Infinite and will allow row grouping, aggregation,
        lazy-loading of groups and slice and dice of data.
    </li>
    <li>
        Use <b><a href="../javascript-grid-viewport/">Viewport</a></b> if you want the server to know exactly what the user is looking at.
        This is best when you have a large amount of changing data and want to push updates
        to the client when the server-side data changes. Knowing exactly what the user is looking
        at means you only have to push updates to the relevant users. All the row models can receive
        updates but only the Viewport row model provides the server with the information of the rows
        the users currently sees on screen without scrolling.</li>
    </li>
</ul>

<h2>Row Model Comparisons</h2>

<p>
    Below is a quick feature comparison of all the grid's features across all four row models.
</p>

<?php
    function printFeature($enabled) {
        if (is_string($enabled)) {
            echo "<td><i class=\"fas fa-check\" style='color: green;'></i> $enabled</td>";
        } else if ($enabled) {
            echo "<td><i class=\"fas fa-check\" style='color: green;'></i></td>";
        } else {
            echo "<td><i class=\"fas fa-times\" style='color: red;'></i></td>";
        }
    }

    function printFeatureListRows() {
        $features = json_decode(file_get_contents('rowModels.json'))->features;

        foreach ($features as $feature) {
            echo '<tr class="item-row">';
            echo "<td>$feature->feature</td>";
            printFeature($feature->clientSide);
            printFeature($feature->infinite);
            printFeature($feature->serverSide);
            printFeature($feature->viewport);
            echo '</tr>';
        }
    }
?>

<table class="row-model-table reference">
    <tr class="first-row">
        <th>Feature</th>
        <th>Client-Side</th>
        <th>Infinite</th>
        <th>Server-Side</th>
        <th>Viewport</th>
    </tr>
    <?php printFeatureListRows(); ?>
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
    <img src="./rowmodels.svg" class="img-fluid" alt="Diagram of Major Classes involved with the Row Models">
</p>

<p>
    The following should be noted from the diagram:
</p>

<ul class="content">
    <li>
        The grid has exactly one <code>RowRenderer</code> instance. The <code>RowRenderer</code> contains a reference to the <code>PaginationProxy</code>
        where it asks for the rows one at a time for rendering.
    </li>
    <li>
        The grid has exactly one <code>PaginationProxy</code> instance. The <code>PaginationProxy</code> will either a) do nothing
        if pagination is not active and just forward all requests to the Row Model or b) do pagination if
        pagination is active. The <code>PaginationProxy</code> has exactly one <code>RowModel</code> instance.
    </li>
    <li>
        You can configure the grid to use any of the provided <b>Row Models</b> - that's why <code>RowModel</code> is in
        italics, it means it's an interface, the concrete implementation is what you decide when configuring the grid.
        The <code>RowModel</code> contains a list of <code>RowNodes</code>. The <code>RowModel</code> may have a list of
        all the <code>RowNodes</code> (Client-Side Row Model) or have
        a datasource where it can lazy-load <code>RowNodes</code>.
    </li>
    <li>
        A <b>RowNode</b> has a reference to exactly one row data item (the client application provides
        the row data items). The <code>RowNode</code> has state information about the row item, such as whether it is
        selected and the height of it.
    </li>
    <li>
        When there is a change of state in the <code>RowNodes</code>, the <code>RowModel</code> fires a <b>modelUpdated</b>
        event which gets the <code>RowRenderer</code> to refresh. This happens for many reasons, or example the
        data is sorted, filtered, a group is opened, or the underlying data has changed.
    </li>
</ul>

<h2>Pagination</h2>

<p>
    Pagination can be applied to any of the row model types. The documentation on each row model
    type covers pagination for that row model type.
</p>

<h2>Grid Datasource</h2>

<p>
    The <a href="../javascript-grid-client-side-model/">Client-Side</a> row model does not need a datasource.
    <a href="../javascript-grid-infinite-scrolling/">Infinite</a>,
    <a href="../javascript-grid-viewport/">Viewport</a> and
    <a href="../javascript-grid-server-side-model/">Server-Side</a> all use a datasource. The documentation
    on each row model type explains how to configure the datasource for the particular row model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
