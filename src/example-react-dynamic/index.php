<?php
$key = "React Dynamic";
$pageTitle = "ag-Grid React Dynamic Components";
$pageDescription = "Examples showing React Components as Cell Renderers";
$pageKeyboards = "ag-Grid react grid component dynamic cell renderer";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="dynamic">Simple Dynamic Component</h2>
    <p>A simple Grid using React Components as Cell Renderers, with Child Components, Two-Way Binding and
        Parent to Child Components Events.</p>

    <?= example('Simple Dynamic Component', 'dynamic', 'react', array( "exampleHeight" => 460, "showResult" => true )); ?>

    <h2 id="rich-dynamic">Richer Dynamic Components</h2>
    <p>A Richer Example using React Components as Cell Renderers, with Dynamic Components included via Modules.</p>

    <?= example('Richer Dynamic Components', 'rich-dynamic', 'react', array( "exampleHeight" => 400, "showResult" => true )); ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
