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

    <show-complex-example example="../react-examples/examples/?fromDocs&example=dynamic"
                          sources="{
                            [
                                { root: '/react-examples/examples/src/dynamicComponentExample/', files: 'ChildMessageRenderer.jsx,CurrencyRenderer.jsx,ParamsRenderer.jsx,CubeRenderer.jsx,DynamicComponentsExample.jsx,SquareRenderer.jsx' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>

    <h2 id="rich-dynamic">Richer Dynamic Components</h2>
    <p>A Richer Example using React Components as Cell Renderers, with Dynamic Components included via Modules.</p>

    <show-complex-example example="../react-examples/examples/?fromDocs&example=rich-dynamic"
                          sources="{
                            [
                                { root: '/react-examples/examples/src/richComponentExample/', files: 'ClickableRenderer.jsx,RatioRenderer.jsx,RichComponentsExample.jsx' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
