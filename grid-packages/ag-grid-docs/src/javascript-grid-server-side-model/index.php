<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Server-side Row Model </h1>

<p class="lead">
    When working with very large datasets, use the Server-side Row Model to lazy-load data while performing server-side
    operations such as grouping, filtering and pivoting.
</p>

<? enterprise_feature("Server-side Row Model"); ?>

<h2>Overview</h2>

<p>
    When designing a grid based application, one of the key considerations is how much data needs to be sent from
    the server to the client? As a developer using ag-Grid you won't need to switch between grids based on the
    answer to this question, instead just select the appropriate Row Model used by the grid.
</p>

<note>
    <p>
        Also see our guides which provide reference implementations for numerous data sources:
    <ul>
        <li><a href="../nodejs-server-side-operations/">Node.js connecting to MySQL</a></li>
        <li><a href="../oracle-server-side-operations/">Java Server connecting to Oracle</a></li>
        <li><a href="../graphql-server-side-operations/">GraphQL connecting to MySQL</a></li>
        <li><a href="../spark-server-side-operations/">Java Server connecting to Apache Spark</a></li>
    </ul>
    </p>
</note>

<h4>Client-side Row Model</h4>

<p>
    The simplest approach is to send all row data to the browser in response to a single request at initialisation.
    For this use case the <a href="/javascript-grid-client-side-model/">Client-side Row Model</a> has been designed.

<p>
    This scenario is illustrated below where 10,000 records are loaded directly into the browser:
</p>

<p><img src="in-memory-row-model.png" alt="in-memory-row-model" width="90%" style="border: 1px solid grey"/></p>

<p>
    The Client-side Row Model only renders the rows currently visible, so the upper limit of rows is governed by the
    browsers memory footprint and data transfer time, rather than any restrictions inside the grid.
</p>

<h4>Server-side Row Model</h4>

<p>
    However many real world applications contain much larger data sets, often involving millions of records. In this
    case it simply isn't feasible to load all the data into the browser in one go. Instead data will somehow need
    to be lazy-loaded as required and then purged to limit the memory footprint in the browser?
</p>

<p>
    This is precisely the problem the Server-side Row Model addresses, along with delegating server-side operations
    such as filtering, sorting, grouping and pivoting.
</p>

<p>
    The following diagram shows the approach used by the Server-side Row Model. Here there are 10 million records,
    however the number of records is only constrained by the limits of the server-side:
</p>

<p><img src="enterprise-row-model.png" alt="enterprise-row-model" width="90%" style="border: 1px solid grey"/></p>

<p>
    As the user performs operations such as sorting and grouping, the grid issues requests to the server that contains
    all the necessary metadata required, including which portion of data should be returned based on the users position in
    the data set.
</p>

<p>
    The browser will never run out of heap space as the grid will automatically purge out-of-range records.
</p>


<h2>Features</h2>

<p>
    You may benefit from the combination of all these features or just be interested in a subset. The features of the
    Server-side Row Model are:
</p>

<ul class="content">
    <li>
        <b>Lazy Loading of Groups:</b> The grid will load the top level rows only. Children
        of groups are only loaded when the user expands the group. Some applications may use
        the Server-side Row Model for this one feature alone e.g. you might have a managers database table,
        you can display a list of all managers, then click 'expand' on the manager and the grid
        will then request to get the 'employees' for that manager.
    </li>
    <li>
        <b>Server-side Grouping, Pivot and Aggregation:</b> Because the data is coming back from the server one group
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
        how that row model works will help you in understanding this part of the Server-side Row Model.
    </li>
    <li>
        <b>Slice and Dice:</b> Assuming your server-side can build the data query, you can allow the user
        to use the ag-Grid UI to drag columns around to select what columns you want to group by and aggregate
        on. What the user selects will then be forwarded to your datasource as part of the request. This feature
        is advanced and will require some difficult server-side coding from you, however if done correctly then
        your users will have an experience of slicing and dicing large data in real time, something previously
        only available in expensive reporting tools, now you can embed it into your JavaScript application.
    </li>
</ul>


<h2>Next Up</h2>

<p>
    To see how the above interfaces are implemented, continue to the next section: <a href="../javascript-grid-server-side-model-infinite/">Infinite Scroll</a>.
</p>


<?php include '../documentation-main/documentation_footer.php';?>