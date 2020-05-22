<?php
$pageTitle = "Master Detail: Nesting";
$pageDescription = "How to nest multiple levels of Master / Detail grids";
$pageKeywords = "ag-grid javasript grid table master detail nesting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail - Nesting</h1>

<p class="lead">
    It is possible to nest Master / Detail grids. There is no special configuration required to do this,
    you just configure another Detail Grid to also act as a Master Grid.
</p>

<p>
    The following snippet illustrates how to achieve nesting by configuring Detail Grids to also act as Master Grids.
</p>

<snippet>
// Level 3 (bottom level), Detail Grid only, no Master / Detail configuration
var gridOptionsLevel3 = {
    ...
}


// Level 2, configured to be a Master Grid and use Level 3 grid as Detail Grid,
var gridOptionsLevel2 = {
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel3,
        getDetailRowData: function (params) {
            ...
        }
    }
    ...
}

// Level 1, configured to be a Master Grid and use Level 2 grid as Detail Grid,
var gridOptionsLevel1 = {
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel2,
        getDetailRowData: function (params) {
            ...
        }
    }
    ...
}
</snippet>

<p>
    Below shows a simple Master Detail setup with two levels of Master Detail.
    The example is kept short (few rows and columns) so as to focus on the nesting.
</p>

<?= grid_example('Nesting Master / Detail', 'nesting', 'generated', ['enterprise' => true, 'exampleHeight' => 425, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p>
    The next example is identical to the previous except all the Detail Grid's have property
    <code>autoHeight=true</code>. Notice that this removes all vertical scrolls from all the Detail Grids, leaving
    just the main Master Grid with a vertical scroll.
</p>

<?= grid_example('Nesting Auto-Height', 'nesting-autoheight', 'generated', ['enterprise' => true, 'exampleHeight' => 425, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
