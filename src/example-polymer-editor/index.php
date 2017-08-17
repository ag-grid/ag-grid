<?php
$key = "Polymer Editor";
$pageTitle = "ag-Grid Polymer Component Editor";
$pageDescription = "A Cell Editor example - one with a popup editor, and another with a numeric editor.";
$pageKeyboards = "ag-Grid polymer editor component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Editor Components</h2>
    <p>A Cell Editor example - one with a popup editor, and another with a numeric editor.</p>
    <p>Each component demonstrates different editor related features</p>

    <show-complex-example example="../framework-examples/polymer-examples/src/editor-components-grid/index.html"
                          sources="{
                            [
                                { root: '/framework-examples/polymer-examples/src/editor-components-grid/', files: 'index.html,editor-components-example.html,mood-renderer.html,numeric-editor.html,mood-editor.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>




