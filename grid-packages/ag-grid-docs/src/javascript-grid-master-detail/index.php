<?php
$pageTitle = "Master Detail: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Master Detail. Use Master Detail to expand rows and have another grid with different columns inside. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid full width master detail javascript datagrid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail</h1>

<?= videoSection("https://www.youtube.com/embed/8OeJn75or2w", "master-detail-video", "Master / Detail Video Tutorial") ?>

<p class="lead">
    Master Detail refers to a top level grid called a Master Grid having rows that expand. When
    the row is expanded, another grid is displayed with more details related to the expanded
    row. The grid that appears is known as the Detail Grid.
</p>

<h2>Enabling Master / Detail</h2>

<p>
    Set the following items within the Master Grid to enabled Master / Detail:
</p>

<snippet>
var gridOptions = {

    // enable Master / Detail
    masterDetail: true,

    // the first Column is configured to use agGroupCellRenderer
    columnDefs: [
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' }
    },

    // provide Detail Cell Renderer Params
    detailCellRendererParams: {

        // provide the Grid Options to use on the Detail Grid
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number'}
            ]
        },

        // get the rows for each Detail Grid
        getDetailRowData: function(params) {
            params.successCallback(params.data.callRecords);
        }
    }
    ...
}
</snippet>

<ol class="content">
    <li>
        Set the grid property <code>masterDetail=true</code>. This tells the grid to allow expanding rows
        to display Detail Grids.
    </li>
    <li>
        Set the Cell Renderer on one Master Grid column to <code>agGroupCellRenderer</code>. This tells the grid
        to use the Group Cell Renderer which in turn includes the expand / collapse functionality for that column.
    </li>
    <li>
        Set the Detail Cell Renderer* parameter <code>detailGridOptions</code>. This contains configuration for
        the Detail Grid such as what columns to display and what grid features you want enabled inside
        the Detail Grid.
    </li>
    <li>
        Provide a callback via the Detail Cell Renderer* parameter <code>getDetailRowData</code>. The callback is called
        for each Detail Grid and sets the rows to display in each Detail Grid.
    </li>
</ol>

<p style="font-style: italic;">
    * The significance of using Detail Cell Renderer parameters to configure the Detail Grid is explained in
    <a href="../javascript-grid-master-detail-detail-grids/">Detail Grids</a>.
</p>

<p>
    The example below shows a simple Master / Detail with all the above configured.
</p>

<?= grid_example('Simple Example', 'simple', 'generated', ['enterprise' => true, 'exampleHeight' => 535, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Row Models</h2>

<p>
    When using Master / Detail the Master Grid must be using either the
    <a href="../javascript-grid-client-side-model/">Client-Side</a> or
    <a href="../javascript-grid-server-side-model-master-detail/">Server-Side</a> Row Models.
    It is not supported with the <a href="../javascript-grid-viewport">Viewport</a> or
    <a href="../javascript-grid-infinite-scrolling">Infinite</a> Row Models.
</p>

<p>
    The Detail Grid on the other hand can use any Row Model.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
