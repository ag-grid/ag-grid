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

    <p>This example demonstrates Dynamic Angular Components with ag-Grid, Parent/Child Communication (cell component to parent grid component), as well as
        dynamic data updates of the <code>Currency</code> column.</p>
    <p><span class="bold-roboto">Square, Cube, Row Params, Currency and Child/Parent</span>: Angular Components within the Grid</p>
    <p><span class="bold-roboto">Currency (Pipe)</span>: An Angular Component utilising the Currency Pipe, dynamically updated with the button above.</p>
    <p><span class="bold-roboto">Child/Parent</span>: Demonstrates the Child Cell Component communicating with the Parent Grid Component.</p>
    <p><span class="bold-roboto">Refresh Even Row Currency Data</span>: Dynamically Updates Event Rows Currency Value. Only the Currency column will be re-rendered.</p>

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
