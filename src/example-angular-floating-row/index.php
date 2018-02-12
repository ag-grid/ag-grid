<?php
$pageTitle = "ag-Grid Examples: Angular Pinned Row";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows an example of Pinned Rows with Angular.";
$pageKeyboards = "ag-Grid angular pinned row";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Pinned Row Renderer using Angular</h2>
    <p>This page demonstrates a Pinned Row Renderer using Angular.</p>

    <?= example('Pinned Row Component', 'pinned-row', 'angular', array("exampleHeight" => 370, "showResult" => true)); ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>

