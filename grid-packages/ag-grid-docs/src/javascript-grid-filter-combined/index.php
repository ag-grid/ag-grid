<?php
$pageTitle = "Combined Filter - Overview";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Combined Filter - Overview</h1>

<p class="lead">
    The Combined Filter allows you to combine the Set Filter with one of the other Provided Filters.
</p>

<?= grid_example('Combined Filter', 'combined-filter', 'generated', ['enterprise' => true, 'exampleHeight' => 700, 'modules' => ['clientside', 'setfilter', 'menu']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
