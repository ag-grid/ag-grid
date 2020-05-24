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
    The height of detail rows can be configured statically (same height for each detail row)
    or dynamically (different height for each detail row).
</p>

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

<h2 id="dynamic-height">Dynamic Height</h2>

<p>
    Use callback <code>getRowHeight()</code> to set height for each row individually.
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

<h2 id="auto-height">Auto Height</h2>
<?= grid_example('Auto Height', 'auto-height', 'generated', ['enterprise' => true, 'modules'=>['clientside', 'masterdetail']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
