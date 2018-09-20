<?php
$pageTitle = "ag-Grid Row Models: The Server-side Row Model";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of Server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeyboards = "ag-Grid Server-side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise"> Pagination </h1>

<p class="lead">
    This section shows how to perform pagination using the Server-side Row Model.
</p>

<h2>Pagination with Server-side Row Model</h2>

<p>
    To enable pagination when using the Server-side Row Model, all you have to do is turning pagination on with
    <code>pagination=true</code>. Find an example below:
</p>

<?= example('Pagination Example', 'pagination', 'generated', array("enterprise" => 1, "extras" => array('lodash'))) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-selection/">Row Selection</a>
    using the Server-side Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>