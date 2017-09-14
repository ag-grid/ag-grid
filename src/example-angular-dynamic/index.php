<?php
$key = "Angular Dynamic";
$pageTitle = "ag-Grid Angular Dynamic Components";
$pageDescription = "Examples showing Angular Components as Cell Renderers";
$pageKeyboards = "ag-Grid angular grid component dynamic cell renderer";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="dynamic">Simple Dynamic Component</h2>
    <p>A simple Grid using Angular Components as Cell Renderers, with Child Components, Two-Way Binding and
        Parent to Child Components Events.</p>

    <?= example('Simple Dynamic Component', 'dynamic-component', 'angular', array("exampleHeight" => 440, "showResult" => true)); ?>

    <h2 id="rich-dynamic">Richer Dynamic Components</h2>
    <p>A Richer Example using Angular Components as Cell Renderers, with Dynamic Components included via Modules.</p>

    <?= example('Richer Dynamic Components', 'rich-dynamic-component', 'angular', array("exampleHeight" => 370, "showResult" => true)); ?>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
