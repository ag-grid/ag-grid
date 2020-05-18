<?php
$pageTitle = "Master Detail: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Master Detail. Use Master Detail to expand rows and have another grid with different columns inside. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid full width master detail javascript datagrid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail</h1>

<p class="lead">
    This section describes how to nest grids inside grids using a Master / Detail configuration.
</p>

<? enterprise_feature("Master Detail"); ?>

<?= videoSection("https://www.youtube.com/embed/8OeJn75or2w", "master-detail-video", "Master / Detail Video Tutorial") ?>

<p>
    With the Master Detail grid configuration, the top level grid is referred to as the 'master grid' and the nested grid
    is referred to as the 'detail grid'.
</p>

<p>
    With this configuration the detail grid can be used to display more information about the row in the master grid that was
    expanded to reveal the detail grid.
</p>

<note>
    It's important to mention that because the Master Detail is rendered in a different container, it will not be part of the
    selection when used in combination with <code>enableRangeSelection</code> or <code>enableCellTextSelection</code>.
</note>

<h2>Enabling Master Detail</h2>

<p>
    To enable Master / Detail, you should set the following grid options:
</p>
    <ul class="content">
        <li>
            <b>masterDetail:</b> Set to true to inform the grid you want to allow
            expanding of rows to reveal detail grids.
        </li>
        <li>
            <b>detailGridOptions:</b> The grid options to set for the detail grid.
            The detail grid is a fully featured instance of ag-Grid, so any configuration
            can be set on the detail grid that you would set any other grid.
        </li>
        <li>
            <b>getDetailRowData:</b> A function you implement to provide the grid
            with rows for display in the detail grids.
        </li>
    </ul>

<p>
    These grid options are illustrated below:
</p>

<snippet>
var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,

    // enable master detail
    masterDetail: true,

    // specify params for default detail cell renderer
    detailCellRendererParams: {
        // provide detail grid options
        detailGridOptions: detailGridOptions,

        // extract and supply row data for detail
        getDetailRowData: function(params) {
            params.successCallback(params.data.childRecords);
        }
    }
}

var detailGridOptions = {
    columnDefs: detailColumnDefs
}</snippet>



<p>
    The example shows a simple Master / Detail setup. Note the following:
</p>

<ul class="content">
  <li><b>masterDetail</b> - is set to <code>true</code> in the master grid options.</li>
  <li><b>detailCellRendererParams</b> - specifies the <code>detailGridOptions</code> to use and <code>getDetailRowData</code>
extracts the data for the detail row.</li>
</ul>

<?= grid_example('Simple Example', 'simple', 'generated', ['enterprise' => true, 'exampleHeight' => 535, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>
















<h2>Supported Modes</h2>

<p>
    The Master / Detail feature organises the grid in a way which overlaps with other features.
    For example, Master / Detail expands rows, which is also the case with row grouping. For this reason,
    Master / Detail does not work with certain grid configurations. These configurations are listed below:
</p>

<h3 id="row-models">Row Models</h3>

<p>
    The master grid (i.e. the top level grid) in Master / Detail can be used in the
    <a href="../javascript-grid-client-side-model/">Client-Side</a> and
    <a href="../javascript-grid-server-side-model-master-detail/">Server-Side</a> Row Models.
    However it is not supported with the <a href="../javascript-grid-viewport">Viewport</a> or
    <a href="../javascript-grid-infinite-scrolling">Infinite</a> Row Models.
</p>

<p>
    The detail grid (i.e. the child grid) can use any Row Model, as long as the
    master grid uses the <a href="../javascript-grid-client-side-model/">Client-Side</a> or
    <a href="../javascript-grid-server-side-model-master-detail/">Server-Side</a> Row Models, then the detail
    grid can use any of the other row models.
</p>

<h3 id="tree-data">Tree Data</h3>

<p>
    Master / Detail is not supported with <a href="../javascript-grid-tree-data">Tree Data</a>.
    This is because the concept of tree data conflicts with Master / Detail, in that in tree
    data, any row can expand to show child rows, which would result in a clash when a row
    has child rows in addition to having Master / Detail at the same row.
</p>

<h3 id="layouts">Layouts</h3>

<p>
    It is not possible to mix <a href="../javascript-grid-width-and-height/#dom-layout">DOM layout</a>
    for master detail. This is because the layout is a CSS setting that would be inherited by all
    grids contained with the master grid. So if your master grid was 'for-print', then all child grids
    would pick up the 'for-print' layout.
</p>

<p>
    When using Master / Detail and <a href="../javascript-grid-for-print/">for-print</a>,
    then all detail grids need to use for-print.
</p>

<p>
    When using Master / Detail and <a href="../javascript-grid-width-and-height/#auto-height">auto-height</a>,
    then all detail grids need to use auto-height.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
