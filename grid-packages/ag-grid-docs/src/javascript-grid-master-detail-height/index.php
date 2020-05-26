<?php
$pageTitle = "Master Detail: Detail Height";
$pageDescription = "How to configure Details Height within the Master Detail feature of the grid";
$pageKeywords = "ag-grid javascript grid table master detail";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<style>
    .example-title {
        font-size: 20px;
        padding-top: 20px;
    }
</style>

<h1 class="heading-enterprise">Master / Detail - Detail Height</h1>

<p class="lead">
    The default height of each detail section (ie the row containing the Detail Grid in the master)
    is fixed at 300px. The height does not change based on how much data there is to display in the detail
    section.
</p>

<p>
    To change the height of the details section from the default you have the following options:
</p>

<ul>
    <li>
        Set a <b>Fixed Height</b> for all detail sections using grid property <code>detailRowHeight</code>.
        This will fix all detail sections to the new height in pixels.
    </li>
    <li>
        Set the detail sections to <b>Auto Height</b> by setting the property
        <code>detailCellRendererParams.autoHeight=true</code>. This will get each detail section to
        auto-size to fit it's content.
    </li>
    <li>
        Use <b>Dynamic Height</b> to set a different height for each details section by implementing
        the grid callback <code>getRowHeight()</code>. This callback is called once for each detail section thus
        allowing different heights to be provided for different sections.
    </li>
</ul>

<h2 id="fixed-height">Fixed Height</h2>

<p>
    Use the grid property <code>detailRowHeight</code> to set a fixed height for each detail row.
</p>

<snippet>
// statically fix row height for all detail grids
masterGridOptions.detailRowHeight = 200;
</snippet>

<p>
    The following example sets a fixed row height for all detail rows.
</p>

<?= grid_example('Fixed Detail Row Height', 'fixed-detail-row-height', 'generated', ['enterprise' => true, 'exampleHeight' => 575, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<h2 id="auto-height">Auto Height</h2>

<p>
    Set <code>detailCellRendererParams.autoHeight=true</code> to have the detail grid to dynamically change
    it's height to fit it's rows.
</p>

<snippet>
detailCellRendererParams: {
    // enable auto-height
    autoHeight: true

    // define detail grid options as normal
    detailGridOptions: {
        ...
    },

    ...
},
</snippet>

<?= grid_example('Auto Height', 'auto-height', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail']]) ?>

<note>
    <p>
        When using Auto Height feature, the Detail Grid will render all of it's rows all the time.
        <a href="../javascript-grid-dom-virtualisation/">Row Virtualisation</a> will not happen.
        This means if the Detail Grid has many rows, it could slow down your application and could
        result in stalling he browser.
    </p>
    <p>
        Do not use Auto Height if you have many rows (eg 100+) in the Detail Grid's. To know if this
        is a concern for your grid and dataset, try it out and check the performance.
    </p>
</note>

<h2 id="dynamic-height">Dynamic Height</h2>

<p>
    Use the callback <code>getRowHeight()</code> to set height for each row individually. This is a specific use
    of the callback that is explained in more detail in
    <a href="../javascript-grid-row-height/#getrowheight-callback">Get Row Height</a>
</p>
<p>
    Note that this callback gets called for <b>all rows</b> in the Master Grid, not just
    rows containing Detail Grids. If you do not want to set row heights explicitly for
    other rows simply return <code>undefined / null</code> and the grid will ignore the
    result for that particular row.
</p>

<snippet>
// dynamically assigning detail row height
masterGridOptions.getRowHeight = function (params) {
    var isDetailRow = params.node.detail;

    // for all rows that are not detail rows, return nothing
    if (!isDetailRow) { return undefined; }

    // otherwise return height based on number of rows in detail grid
    var detailPanelHeight = params.data.children.length * 50;
    return detailPanelHeight;
}
</snippet>

<p>
    The following example demonstrates dynamic detail row heights:
</p>

<?= grid_example('Dynamic Detail Row Height', 'dynamic-detail-row-height', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
