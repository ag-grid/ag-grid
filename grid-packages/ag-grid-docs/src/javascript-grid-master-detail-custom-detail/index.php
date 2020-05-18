<?php
$pageTitle = "Master Detail: Custom Detail";
$pageDescription = "Configure a customer detail panel instead of using the provided Default Detail Cell Renderer";
$pageKeywords = "ag-grid javasript grid table master detail custom detail panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Custom Detail Panel</h1>

<p class="lead">
    This section describes...
</p>


<h2>Providing a Custom Detail Cell Renderer</h2>

<p>
    The previous section described how to override the detail template used in the default Cell Renderer, however it is also
    possible to provide a custom detail <a href="../javascript-grid-cell-rendering-components/">Cell Renderer Component</a>.
    This approach provides more flexibility but is more difficult to implement as you have to provide your
    own custom detail cell renderer. Use this approach if you want to add additional functionality to the
    detail panel that cannot be done by simply changing the template.
</p>

<p>
    To supply a custom detail Cell Renderer instead of using the default use: <code>gridOptions.detailCellRenderer</code>
</p>

<p>
    The following examples demonstrate custom Cell Renderer components for the detail row with and without a grid.
</p>

<p>
    By the very nature of a custom detail cell renderer it can contain zero or many grid instances. For this reason if
    you need the master grid to reference it's detail grids you will have to register them manually.
</p>

<p>
    When the detail grid is initialised, register it via <code>masterGridApi.addDetailGridInfo()</code> like so:
</p>

<snippet>
    onGridReady(params) {
    var detailGridId = "detail_" + masterRowIndex;

    var detailGridInfo = {
    id: detailGridId,
    api: params.api,
    columnApi: params.columnApi
    };

    this.masterGridApi.addDetailGridInfo(detailGridId, detailGridInfo);
    }
</snippet>

<p>
    And in a similar way unregister it when the detail cell renderer is destroyed using:
</p>

<snippet>
    var detailGridId = "detail_" + masterRowIndex;
    this.masterGridApi.removeDetailGridInfo(detailGridId);
</snippet>

<p>
    For details on how to access the detail grid api see:
    <a href="../javascript-grid-master-detail/#accessing-detail-grid-api">Accessing Detail Grid API</a>.
</p>

<p>
    This example demonstrates how to embed a grid into the detail row using a custom Cell Renderer component:
</p>

<?= grid_example('Custom Detail Cell Renderer with Grid', 'custom-detail-with-grid', 'generated', ['enterprise' => true, 'exampleHeight' => 545, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p>
    This example demonstrates a custom Cell Renderer Component that uses a form rather than a grid:
</p>

<?= grid_example('Custom Detail Cell Renderer with Form', 'custom-detail-with-form', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
