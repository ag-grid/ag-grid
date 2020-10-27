<?php
$pageTitle = "Server-Side Row Model - Node Stores";
$pageDescription = "Node Stores are using by the Server-Side Row Model. The In Memory allows in-browser Sorting and Filtering, the Infinite allows Infinite Scrolling";
$pageKeywords = "ag-Grid Server-Side Node Stores";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Node Stores</h1>

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

<p>
    When grouping and a group is expanded, a new Row Store is created to store the
    child rows of the opened group.
</p>

<div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
    <img src="./multi-store.svg" style="width: 80%;"/>
    <div>Fig 2. Node Store - Grouping</div>
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
            Blocks are loaded as the user scrolls down. This allows presenting big datasets
            by only bringing back from the server what the user scrolls over.
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


<?php include '../documentation-main/documentation_footer.php';?>
