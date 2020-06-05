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

<p>
    Because Static Master Rows are used in all the basic examples of Master / Detail, another example
    is not given here.
</p>

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

<?= grid_example('Dynamic Master Rows', 'dynamic', 'generated', ['enterprise' => true, 'exampleHeight' => 510, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>


<h2>Changing Dynamic Master Rows</h2>

<p>
    The callback <code>isRowMaster</code> is re-called after data changes in the row as a result of a
    <a href="../javascript-grid-data-update-transactions/">Transaction Update</a>. This gives the opportunity
    to change whether the row is expandable or not.
</p>

<snippet>
// to get isRowMaster called again, update the row
// using a Transaction Update
var transaction = {update: [updatedRecord1, updatedRecord2]};
gridOptions.api.applyTransaction(transaction);
</snippet>

<p>
    In the example below, only Master Rows that have data to show are expandable. Note teh following:
</p>
<ul>
    <li>Row 'Nora Thomas' has no detail records, thus is not expandable.</li>
    <li>Row 'Mila Smith' has detail records, thus is expandable.</li>
    <li>
        Clicking 'Clear Milla Calls' removes detail records from Mila Smith which results in the Milla Smith
        row no longer been a Master Row.
    </li>
    <li>
        Clicking 'Set Milla Calls' sets detail records from Mila Smith which results in the Milla Smith
        becoming a Master Row.
    </li>
</ul>

<?= grid_example('Dynamically Changing Master Rows', 'changing-dynamic-1', 'generated', ['enterprise' => true, 'exampleHeight' => 510, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<p>
    The example below extends the previous example. It demonstrates a common scenario of the Master Row
    controlling the Detail Rows.
    Note the following:
</p>

<ul>
    <li>
        Each Master Row has buttons to add or remove one detail rows.
    </li>
    <li>
        Clicking 'Add' will:
        <ul>
            <li>
                Add one detail row.
            </li>
            <li>
                Ensure the Master Row is expandable.
            </li>
            <li>
                Ensure the Master Row is expanded (ie the Detila Grid is visible).
            </li>
        </ul>
    </li>
    <li>
        Clicking 'Remove' will:
        <ul>
            <li>
                Remove one detail row.
            </li>
            <li>
                If no detail rows exist, ensure Master Row is not expandable.
                Ensure the Master Row
            </li>
        </ul>
    </li>
</ul>

<?= grid_example('Dynamically Changing Master Rows', 'changing-dynamic-2', 'generated', ['enterprise' => true, 'exampleHeight' => 510, 'modules'=>['clientside', 'masterdetail', 'menu', 'columnpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
