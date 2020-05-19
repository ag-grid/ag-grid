<?php
$pageTitle = "Master Detail: Master Rows";
$pageDescription = "How to configure Master Rows within the Master Detail feature of the grid";
$pageKeywords = "ag-grid javasript grid table master detail rows";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail - Master Rows</h1>

<p class="lead">
    Master Rows are the rows inside the Master Grid that can be expanded to display
    Detail Grids.
</p>

<h2>Static Master Rows</h2>

<p>
    Once a Master Grid is configured with <code>masterDetail=true</code>, all rows in the
    Master Grid behave as Master Rows, in that they can be expanded to display Detail Grids.
</p>

<snippet>
gridOptions = {

    // by itself, all rows will be expandable
    masterDetail=true,

    ...
}
</snippet>

<h2>Dynamic Master Rows</h2>

<p>
    Dynamic Master Rows allows specifically deciding what rows in the Master Grid can be expanded.
    This can be useful if, for example, a Master Row has no child records, then it may not be desirable
    to allow expanding the Master Row.
</p>

<p>
    In specify which rows should expand, provide the grid callback <code>isRowMaster</code>. The callback
    will be called once for each row. Return
    <code>true</code> to allow expanding and <code>false</code> to disallow expanding for that row.
</p>

<snippet>
gridOptions = {

    // turn on master detail
    masterDetail = true,

    // specify which rows to expand
    isRowMaster = function(dataItem) {
        return expandThisRow ? true : false;
    }

    ...
}
</snippet>

<p>
    The following example only shows detail rows when there are corresponding child records.
</p>

<?= grid_example('Dynamically Specify Master Nodes', 'dynamic-master-nodes', 'generated', ['enterprise' => true, 'exampleHeight' => 510, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
