<?php
$pageTitle = "ag-Grid Data";
$pageDescription = "How to manager your data inside of ag-Grid";
$pageKeyboards = "JavaScript Grid";
$pageGroup = "features";
include '../documentation-main/documentation_header.php';
?>

    <h1>Data</h1>

    <p class="lead">
        Data refers to your application row data that you want to display inside the grid. This section explains
        the different row models used by the grid and also how to access and update data inside the grid.
    </p>

    <h2>Row Models</h2>

    <p>
        The <a href="../javascript-grid-row-models/">Row Models</a> provide different strategies for loading
        data into the grid.
    </p>
    <p>
        The easiest is the <a href="../javascript-grid-client-side-model/">Client Side
        Row Model</a> where all the data is provided to the grid in one big list - which is great if the size
        of the data is small enough to bring over the network and fit inside the browsers memory.
    </p>
    <p>
        For when data is to large then the a) <a href="../javascript-grid-server-side-model/">Server Side Row Model</a>,
        b) <a href="../javascript-grid-infinite-scrolling/">Infinite Row Model</a> or c)
        <a href="../javascript-grid-viewport/">Viewport Row Model</a> can be used.
    </p>

    <p>
        The <a href="../javascript-grid-row-models/">Row Models Overview</a> explains the differences between
        the row models in detail.
    </p>

    <h2>Accessing Data</h2>

    <p>
        See <a href="../javascript-grid-accessing-data/">Accessing Data</a> for how to access data once it is
        inside the grid.
    </p>

    <h2>Updating Data</h2>

    <p>
        See <a href="../javascript-grid-accessing-data/">Updating Data</a> for how to update data once it is
        inside the grid.
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>

