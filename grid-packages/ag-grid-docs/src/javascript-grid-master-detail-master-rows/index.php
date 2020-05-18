<?php
$pageTitle = "Master Detail: Master Rows";
$pageDescription = "How to configure Master Rows within the Master Detail feature of the grid";
$pageKeywords = "ag-grid javasript grid table master detail rows";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Master / Detail - Master Rows</h1>

<p class="lead">
    This section describes...
</p>


<h2>Optional Master Rows</h2>

<p>
    It certain cases it may be required to not treat all top level rows as a master rows. For instance if a master has
    no child records it may not be desirable to expand the master row to an empty detail.
</p>

<p>
    In order to prevent this the following callback can be used on the master grid options:
</p>

<snippet>
    masterGridOptions.isRowMaster = function (dataItem) {
    // return true when row data has children, false otherwise
    return dataItem ? dataItem.children.length > 0 : false;
    }
</snippet>

<p>
    As shown above our callback function will return <code>true</code> when there are detail (i.e. children) records,
    otherwise it will return <code>false</code>.
</p>

<p>
    The following example only shows detail rows when there are corresponding child records.
</p>

<?= grid_example('Dynamically Specify Master Nodes', 'dynamic-master-nodes', 'generated', ['enterprise' => true, 'exampleHeight' => 510, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
