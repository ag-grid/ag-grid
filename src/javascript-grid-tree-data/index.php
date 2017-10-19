<?php
$key = "Tree Data";
$pageTitle = "ag-Grid Tree Data";
$pageDescription = "ag-Grid Tree Data";
$pageKeyboards = "ag-Grid Tree Data";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1"><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Tree Data</h1>

    <p>
        This page describes how you can supply Tree Data to the grid. This is data which contains a pre-defined grouping.

        We start by introducing simple ways to work with Tree Data before covering more advanced uses and considerations.
    </p>

    <h2>Specifying Group Column</h2>


    <?= example('Simple Org Hierarchy', 'simple-org-hierarchy', 'generated', array("enterprise" => 1)) ?>


    <?= example('File Browser', 'file-browser', 'generated', array('enterprise' => true, 'extras' => array('fontawesome')) ) ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
