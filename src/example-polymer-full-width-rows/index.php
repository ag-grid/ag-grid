<?php
$key = "Polymer Full Width";
$pageTitle = "ag-Grid Polymer Full Width Example";
$pageDescription = "A Full Width Renderer Component";
$pageKeyboards = "ag-Grid polymer full width component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Full Width Renderer</h2>
    <p>A Full Width Renderer Example</p>

    <show-complex-example example="../polymer-examples/src/full-width-components-example/index.html"
                          sources="{
                            [
                                { root: '/polymer-examples/src/full-width-components-example/', files: 'index.html,full-width-components-example.html,full-width-renderer.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
