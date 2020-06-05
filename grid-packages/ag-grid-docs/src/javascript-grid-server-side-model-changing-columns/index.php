<?php
$pageTitle = "Server-Side Row Model - Changing Columns";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Changing Columns</h1>

<p class="lead">
    It is possible to add and remove columns to the Server-Side Row Model without having
    the row model reset.
</p>

<p>
    <a href="../javascript-grid-column-definitions/#column-changes">Changing columns</a> allows you to
    specify new column definitions to the grid and the grid will work out which columns are new
    and which are old, keeping the state of the old columns.
</p>

<p>
    For the Server-Side Row Model this means adding and removing columns will reload the data
    if the changed column has row group, pivot, value, sort or filter active. This is because
    a change to row group, pivot, value, sort or filter will impact the row data that comes
    back.
</p>

<p>
    The example below demonstrates how changing columns impacts the server side row model.
    The following can be noted:
</p>

<ul class="content">
    <li>Adding or removing Athlete, Age or Sport will not reload the data as they have
    no row group, pivot, value, sort or filter set.</li>
    <li>Adding or removing Country or Year will reload the data as they are part of the grouping.</li>
    <li>Adding or removing Gold, Silver or Bronze will reload the data as they are selected as values.</li>
    <li>If you apply a sort or filter (on Athlete) and then remove the column the data will reload.</li>
</ul>

<?= grid_example('Changing Columns', 'changing-columns', 'generated', ['enterprise' => true, 'exampleHeight' => 605, 'extras' => ['alasql'], 'modules' => ['serverside', 'rowgrouping', 'menu', 'columnpanel']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about <a href="../javascript-grid-server-side-model-crud/">CRUD Operations</a>
    using the Server-Side Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
