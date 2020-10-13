<?php
$pageTitle = "Master Detail: Custom Detail";
$pageDescription = "Configure a customer detail panel instead of using the provided Default Detail Cell Renderer";
$pageKeywords = "ag-grid javasript grid table master detail custom detail panel";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Custom Detail</h1>

<p class="lead">
    When a Master Row is expanded, the grid uses the default Detail Cell Renderer to create and display
    the Detail Grid inside one row of the Master Grid. You can provide a customer Detail Cell Renderer
    to display something else if the default Detail Cell Renderer doesn't do what you want.
</p>

<p>
    Configure the grid to use a customer Detail Cell Renderer using the grid property <code>detailCellRenderer</code>.
</p>
<snippet>
gridOptions = {

    // normally you leave this blank, means the grid
    // will use the default Detail Cell Renderer
    detailCellRenderer: 'myCellRendererComp',

    // these are the parameters that will get sent to the Detail Cell Renderer,
    // in this case, to an instance of your MyCellRendererComp
    detailCellRendererParams: {...},
}
</snippet>

<p>
    The Detail Cell Renderer should be a <a href="../javascript-grid-cell-rendering-components/">Cell Renderer</a>
    component. See <a href="../javascript-grid-cell-rendering-components/">Cell Renderer</a> on how to build
    and register a Cell Renderer with the grid.
</p>

<p>
    The following examples demonstrate minimalist custom Detail Cell Renderer. Note that where a Detail Grid would
    normally appear, only the message "My Customer Detail" is shown.
</p>

<?= grid_example('Simple Detail Cell Renderer', 'simple-custom-detail', 'generated', ['enterprise' => true, 'exampleHeight' => 545, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Custom Detail With Form</h2>

<p>
    It is not mandatory to display a grid inside the detail section. As you are providing a custom component,
    there are no restrictions as to what can appear inside the custom component.
</p>
<p>
    This example shows a custom Detail Cell Renderer that uses a form rather than a grid.
</p>

<?= grid_example('Custom Detail Cell Renderer with Form', 'custom-detail-with-form', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2>Custom Detail With Grid</h2>

<p>
    It is possible to provide a Customer Detail Grid that does a similar job to the default Detail Cell Renderer.
    This example demonstrates displaying a customer grid as the detail.
</p>

<?= grid_example('Custom Detail Cell Renderer with Grid', 'custom-detail-with-grid', 'generated', ['enterprise' => true, 'exampleHeight' => 545, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p>
    In order for the Detail Grid's API to be available via the Master Grid as explained in
    <a href="../javascript-grid-master-detail-detail-grids/#accessing-detail-grids">Accessing Detail Grids</a>,
    a Grid Info object needs to be registered with the Master Grid.
</p>

<p>
    When the Detail Grid is created, register it via <code>masterGridApi.addDetailGridInfo()</code> and
    when the Detail Grid is destroyed, unregister it via <code>masterGridApi.removeDetailGridInfo()</code>.
    A Detail ID is required when calling these methods. Any unique ID can be used, however for consistency
    with how the default Detail Cell Renderer works it's recommended to use the ID of the detail Row Node.
</p>
<snippet>

//////////////////////////////
// Register with Master Grid
var detailId = params.node.id;

// Create Grid Info object
var detailGridInfo = {
    id: detailId,
    api: params.api,
    columnApi: params.columnApi
};

this.masterGridApi.addDetailGridInfo(detailId, detailGridInfo);

//////////////////////////////
// Unregister with Master Grid
this.masterGridApi.removeDetailGridInfo(detailId);

</snippet>

<h2>Refreshing</h2>

<p>
    When data is updated in the grid using
    <a href="../javascript-grid-data-update-transactions/">Transaction Updates</a>, the grid will call
    refresh on all Detail Cell Renderer's.
</p>

<p>
    It is up to the Detail Cell Renderer whether it wants to act on the refresh or not. If the
    <code>refresh()</code> method returns <code>true</code>, the grid will assume the Detail Cell Renderer has
    refreshed successfully and nothing more will happen. However if <code>false</code> is returned,
    the grid will destroy the Detail Cell Renderer and re-create it again.
</p>

<p>
    This pattern is similar to how refresh works for normal grid Cell Renderer's.
</p>

<p>
    The example below shows how components can optionally refresh on updates. The example
    refreshes the first row every one second. The <code>refresh()</code> method gets called on all
    Detail Cell Renderers after the transaction is applied. Only the first Detail Cell Renderer
    returns <code>false</code> so it is the only one that updates.
</p>

<p>
    The creation time is printed to each Detail Cell Renderer so it can be noted when it was
    last created.
</p>

<p>
    In this simple example, it would be possible for the components to just update themselves
    and not rely on the grid destroying and re-creating the components. However the example is
    contrived to demonstrate returning <code>true</code> vs <code>false</code> from the
    refresh method.
</p>

<?= grid_example('Custom Detail with Refresh', 'custom-detail-with-refresh', 'generated', ['enterprise' => true, 'exampleHeight' => 545, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
