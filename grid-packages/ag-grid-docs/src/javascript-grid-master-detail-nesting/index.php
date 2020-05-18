<?php
$pageTitle = "Master Detail: Nesting";
$pageDescription = "How to nest multiple levels of Master / Detail grids";
$pageKeywords = "ag-grid javasript grid table master detail nesting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail - Nesting</h1>

<p class="lead">
    This section describes...
</p>

<h2>Nesting Master / Detail</h2>

<p>
    It is possible to nest Master / Detail grids. There are no special configurations required to achieve this,
    you just configure another detail grid inside the first detail grid.
</p>

<p>
    The following snippet illustrates how to achieve nesting via successive grid option configurations:
</p>

<snippet>
// Level 1 (master)
var gridOptionsLevel1Master = {
    ...
        masterDetail: true,
        detailCellRendererParams: {
            detailGridOptions: gridOptionsLevel2Master,
            getDetailRowData: function (params) {
                params.successCallback(params.data.children);
            }
        }
    }

    // Level 2 (detail and master)
    var gridOptionsLevel2Master = {
        ...
        masterDetail: true,
        detailCellRendererParams: {
                detailGridOptions: gridOptionsLevel3Detail,
                        getDetailRowData: function (params) {
                        params.successCallback(params.data.children);
                                }
                }
        }

    // Level 3 (detail only)
    var gridOptionsLevel3Detail = {
    ...
    // no master / detail configuration
}
</snippet>

<p>
    Below shows a contrived master detail setup to help illustrate how nesting can be achieved.
    The example has very little data - this is on purpose to focus on the nesting.
</p>

<?= grid_example('Nesting Master / Detail', 'nesting', 'generated', ['enterprise' => true, 'exampleHeight' => 425, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
