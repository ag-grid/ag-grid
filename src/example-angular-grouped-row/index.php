<?php
$pageTitle = "ag-Grid Examples: Angular Grouped Row Renderer";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows an example of Angular Grouped Row Renderers.";
$pageKeyboards = "ag-Grid angular grouped row component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Group Row Inner Renderer</h2>
    <p>A Group Row Inner Renderer Example</p>

    <?= example('Grouped Row Inner Renderer', 'grouped-row', 'angular', array("enterprise" => 1, "exampleHeight" => 370, "showResult" => true)); ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
