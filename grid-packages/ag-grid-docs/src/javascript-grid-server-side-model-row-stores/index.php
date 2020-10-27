<?php
$pageTitle = "Server-Side Row Model - Row Stores";
$pageDescription = "Node Stores are using by the Server-Side Row Model. The In Memory allows in-browser Sorting and Filtering, the Infinite allows Infinite Scrolling";
$pageKeywords = "ag-Grid Server-Side Node Stores";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Row Stores</h1>

<p class="lead">
    Inside the Server-Side Row Model (SSRM), rows are stored in Row Stores. There are two types of
    Row Stores: 1) Infinite Store and 2) In Memory Store. This section explains more on these two
    different Row Store types.
</p>

<h2 id="node-store">Row Stores</h2>

<p>
    A Row Store stores <a href="../javascript-grid-row-node/">Row Nodes</a>. A Row Node represents
    one Row inside the grid.
</p>

<p>
    There is at least one Row Store inside the grid for storing top level rows.
    The diagram below shows a SSRM with one Row Store. That means there is either no grouping
    present (no rows to expand), or there are groups present but no groups are yet opened
    (so the children are yet to be lazy loaded).
</p>

<div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
    <img src="./single-store.svg" style="width: 40%;"/>
    <div>Fig 1. Node Store - No Grouping</div>
</div>

<h2>Row Store Types</h2>

<p>
    There are two types of Row Stores, which differ in their strategy for loading and
    managing rows. The types of Row Stores are as follows:
</p>

<ul>
    <li>
        <p>
            <b>Infinite Store</b>:
            Loads rows in blocks (eg 100 rows in a block, thus loading 100 rows at a time).
            Blocks are loaded as the user scrolls down and stored in a cache inside the
            Infinite Store. Blocks that are no longer needed (the user has scrolled past the
            blocks rows) are optionally purged from the cache, thus controlling the browser's
            memory footprint.
        </p>
        <p>
            The name "Infinite Store" comes from the fact it provides
            <a href="https://en.wiktionary.org/wiki/infinite_scroll">Infinite Scrolling</a>
            over the dataset.
        </p>
    </li>
    <li>
        <p>
            <b>In Memory Store</b>:
            Loads rows all at once (eg if 500 children when you expand a group, it loads
            all 500 children). This allows sorting and filtering inside the grid (a server
            request isn't required to sort and filter) and also provides the option of
            inserting and removing rows (explained in the section on
            <a href="../javascript-grid-server-side-model-transactions/">Transactions</a>).
        </p>
        <p>
            The name "In Memory Store" comes from the fact all data is loaded into the client's
            memory, and not in blocks.
        </p>
    </li>
</ul>

<div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
    <img src="./in-memory-store-vs-infinite-store.svg" style="width: 80%;"/>
    <div>Fig 2. Infinite vs In Memory Store</div>
</div>



<p>
    Set the store type using the grid property <code>serverSideStoreType</code>. Set to
    <code>inMemory</code> to use the In Memory Store and <code>infinite</code> to use
    the Infinite Store. If not set, the Infinite Store is used.
</p>

<p>
    Below shows a simple example using Infinite Store. Note the following:
</p>
<ul>
    <li>
        Open the console to observe when the server is called to load rows.
    </li>
    <li>
        Rows are loaded back 100 rows at a time. As the user scrolls down, more rows will be loaded.
    </li>
    <li>
        Sorting the data is not possible by the grid. Sorting on the server side
        is explained in <a href="../javascript-grid-server-side-model-sorting/">Server-Side Sorting</a>.
    </li>
</ul>

<?= grid_example('Infinite Store', 'infinite-store', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<p>
    Below shows a simple example using In Memory Store. Note the following:
</p>
<ul>
    <li>
        Open the console to observe when the server is called to load rows.
    </li>
    <li>
        All the rows are loaded back in one go.
    </li>
    <li>
        Sorting the data is done by the grid when the columns headers are clicked. Sorting
        is possible by the grid because the entire dataset is loaded into the grid.
    </li>
</ul>

<?= grid_example('In Memory Store', 'in-memory-store', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<note>
    At this point you might be wondering the advantage of the In Memory store with just using
    the standard <a href="../javascript-grid-client-side-model/">Client-Side Row Model</a>.
    The difference is when Row Grouping, the children of the row groups are loaded as the
    groups are expanded. For Client-Side Row Model, all data needs to be loaded up front.
</note>

<h2>Row Stores and Grouping</h2>

<p>
    When grouping and a group is expanded, a new Row Store is created to store the
    child rows of the opened group.
</p>

<div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
    <img src="./multi-store.svg" style="width: 80%;"/>
    <div>Fig 3. Node Store - Grouping</div>
</div>

<p>
    This means there can be any number of Row Stores existing inside the SSRM.
    Each time a Row Group is expanded, a new Row Store is created for that level.
</p>

<p>
    The sections
    <a href="../javascript-grid-server-side-model-grouping/">Server-Side Row Grouping</a>
    explains in detail this topic.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about the
    <a href="../javascript-grid-server-side-model-configuration/">SSRM Configuration</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
