<?php
$pageTitle = "Server-Side Row Model - Row Stores";
$pageDescription = "Node Stores are using by the Server-Side Row Model. The Full allows in-browser Sorting and Filtering, the Infinite allows Infinite Scrolling";
$pageKeywords = "ag-Grid Server-Side Node Stores";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">SSRM Row Stores</h1>

<p class="lead">
    Inside the Server-Side Row Model (SSRM), rows are stored in Row Stores. There are two types of
    Row Stores: 1) Infinite Store and 2) Full Store. This section explains more on these two
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
    present (no rows to expand).
</p>

<div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
    <img src="./single-store.svg" style="width: 40%;"/>
    <div>Fig 1. Node Store - No Grouping</div>
</div>

<p>
    If there were groups expanded, there would be multiple row stores
    which is explained later.
</p>

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
            <b>Full Store</b>:
            Loads rows all at once (eg if 500 children when you expand a group, it loads
            all 500 children). This allows sorting and filtering inside the grid (a server
            request isn't required to sort and filter) and also provides the option of
            inserting and removing rows (explained in the section on
            <a href="../javascript-grid-server-side-model-transactions/">Transactions</a>).
        </p>
        <p>
            The name "Full Store" comes from the fact all data is loaded into the store,
            and not in blocks. The store is full of rows, no more rows will be loaded
            after the initial load.
        </p>
    </li>
</ul>

<div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
    <img src="./in-memory-store-vs-infinite-store.svg" style="width: 80%;"/>
    <div>Fig 2. Infinite vs Full Store</div>
</div>



<p>
    Set the store type using the grid property <code>serverSideStoreType</code>. Set to
    <code>full</code> to use the Full Store and <code>infinite</code> to use
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
    Below shows a simple example using Full Store. Note the following:
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

<?= grid_example('Full Store', 'full-store', 'generated', ['enterprise' => true, 'modules' => ['serverside']]) ?>

<note>
    At this point you might be wondering the advantage of the Full store with just using
    the standard <a href="../javascript-grid-client-side-model/">Client-Side Row Model</a>.
    The difference is when Row Grouping, the children of the row groups are loaded as the
    groups are expanded. For Client-Side Row Model, all data needs to be loaded up front.
</note>


<h2>Infinite vs Full</h2>

<p>
    So when is it best to use Infinite Store? And when is it best to use Full Store?
</p>

<p>
    Use Full Store when all of the data comfortable fit's inside the browsers memory.
    It is possible to present big data inside an application using a combination of Full
    Store and Row Grouping. For example a dataset could have 10 million rows, however due to
    grouping only 200 rows are brought back at any group level - in this case Full Store
    would work fine.
</p>

<p>
    Use Infinite Store when all of the data at a particular group level will not comfortably
    fit inside the browsers memory. For example a dataset with 10 million rows with no grouping
    applied would not fit inside a browsers memory, thus Infinite Store would be needed to view it.
</p>

<h2>Infinite Store Restrictions</h2>

<p>
    The Infinite Store comes with one advantage - it can manage an very large (infinite?) amount of data.
    However it comes with the following restrictions.
</p>

<ul>
    <li>
        <h3>In Grid Sorting</h3>
        <p>
            Because data is read back in blocks from the Infinite Store, the grid cannot sort the data,
            as it does not have all the data loaded.
        </p>

    </li>
    <li>
        <h3>In Grid Filtering</h3>
        <p>
            Because data is read back in blocks from the Infinite Store, the grid cannot filter the data,
            as it does not have all the data loaded.
        </p>

    </li>
    <li>
        <h3>Live Data</h3>
        <p>
            If data is live with regards inserts and deletes, this will cause problems with the
            Infinite Store. This is because data is read back from the server in blocks.
            If the data is changing such that the data in each block changes,
            then the Infinite Store will get incorrect rows. For example consider the following
            scenario:
        </p>

        <ol class="content">
            <li>The grid asks for rows 0 to 99 (i.e. first block of 100 rows) and these get read from a database.</li>
            <li>Another application inserts a row at index 50.</li>
            <li>The grid asks for rows 100 to 199 (the second block of 100 rows) and again these get read from the database.</li>
        </ol>

        <p>
            In this scenario the grid will have the last row in the first block appear again as the first row in the second
            block. This is because the row was at index 99 before the insert and then at index 100 after the insert.
        </p>

        <p>
            If data is changing such that row indexes will change and result in duplicate or missing rows across
            blocks, then it is best either avoid the Infinite Store or use a snapshot of data to prevent data
            updates.
        </p>

    </li>
</ul>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-configuration/">Configuration</a>
    of the SSRM.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
