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

    <?= example('Simple Dynamic Component', 'dynamic-component', 'angular', array("exampleHeight" => 480, "showResult" => true, "extras" => array("bootstrap"))); ?>

    <h2 id="rich-dynamic">Richer Dynamic Components</h2>
    <p>A Richer Example using Angular Components as Cell Renderers, with Dynamic Components included via Modules.</p>

    <p>This example demonstrates Dynamic Angular Components with ag-Grid with nested <code>NgModules</code>.
        Functionally similar
        to the <a href="#dynamic">Simple Dynamic Component</a> example above, but demonstrating how the Angular
        Components within the Grid can
        be modular too.</p>

    <?= example('Richer Dynamic Components', 'rich-dynamic-component', 'angular', array("exampleHeight" => 370, "showResult" => true, "extras" => array("bootstrap"))); ?>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
