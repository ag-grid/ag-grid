<?php
$key = "Polymer Group Row";
$pageTitle = "ag-Grid Polymer Grouped Row Renderer";
$pageDescription = "ag-Grid Polymer Grouped Row Renderer Example";
$pageKeyboards = "ag-Grid polymer grouped row component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Group Row Inner Renderer</h2>
    <p>A Group Row Inner Renderer Example</p>

    <show-complex-example example="../polymer-examples/src/grouped-inner-row-components-example/index.html"
                          sources="{
                            [
                                { root: '/polymer-examples/src/grouped-inner-row-components-example/', files: 'index.html,grouped-inner-row-components-example.html,medal-renderer.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
