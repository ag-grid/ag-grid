<?php
$key = "Polymer Dynamic";
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

    <show-complex-example example="../framework-examples/polymer-examples/src/dynamic-components-grid/index.html"
                          sources="{
                            [
                                { root: '/framework-examples/polymer-examples/src/dynamic-components-grid/', files: 'index.html,cube-cell-renderer.html,params-cell-renderer.html,currency-cell-renderer.html,parent-child-renderer.html,dynamic-components-example.html,square-cell-renderer.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>

    <h2 id="rich-dynamic">Richer Dynamic Components</h2>
    <p>A Richer Example using Polymer Components as Cell Renderers, with Dynamic Components included via Modules.</p>

    <show-complex-example example="../framework-examples/polymer-examples/src/rich-dynamic-components-grid/index.html"
                          sources="{
                            [
                                { root: '/framework-examples/polymer-examples/src/rich-dynamic-components-grid/', files: 'index.html,ratio-renderer.html,rich-dynamic-components-example.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
