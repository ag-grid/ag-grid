<?php
$pageTitle = "ag-Grid Polymer Dynamic Components";
$pageDescription = "Examples showing Polymer Components as Cell Renderers";
$pageKeyboards = "ag-Grid polymer grid component dynamic cell renderer";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="dynamic">Simple Dynamic Component</h2>
    <p>A simple Grid using Polymer Components as Cell Renderers, with Child Components, Two-Way Binding and
        Parent to Child Components Events.</p>

    <?= example('Simple Dynamic Component', 'dynamic-components', 'polymer', array("exampleHeight" => 460)) ?>

    <h2 id="rich-dynamic">Richer Dynamic Components</h2>
    <p>A Richer Example using Polymer Components as Cell Renderers, with Dynamic Components included via Modules.</p>

    <?= example('Richer Dynamic Components', 'rich-dynamic-components', 'polymer', array("exampleHeight" => 390) ) ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
