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

    <p>This example demonstrates Dynamic React Components with ag-Grid, Parent/Child Communication (cell component to
        parent grid component), as well as
        dynamic data updates of the <code>Currency</code> column.</p>
    <p><span class="bold-roboto">Square, Cube, Row Params, Currency and Child/Parent</span>: React Components
        within the Grid</p>
    <p><span class="bold-roboto">Currency (Pipe)</span>: An React Component mimicking a Currency Pipe, dynamically
        updated with the button above.</p>
    <p><span class="bold-roboto">Child/Parent</span>: Demonstrates the Child Cell Component communicating with the
        Parent Grid Component.</p>
    <p><span class="bold-roboto">Refresh Even Row Currency Data</span>: Dynamically Updates Event Rows Currency
        Value. Only the Currency column will be re-rendered.</p>

    <?= example('Simple Dynamic Component', 'dynamic', 'react', array("exampleHeight" => 460, "showResult" => true, "extras" => array("bootstrap"))); ?>

    <h2 id="rich-dynamic">Richer Dynamic Components</h2>
    <p>A Richer Example using React Components as Cell Renderers.</p>

    <p>This example demonstrates Dynamic React Components with ag-Grid. Functionally similar
        to the <a href="#dynamic">Dynamic React Components Example</a> above but with slightly richer components.</p>

    <?= example('Richer Dynamic Components', 'rich-dynamic', 'react', array("exampleHeight" => 400, "showResult" => true, "extras" => array("bootstrap"))); ?>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
