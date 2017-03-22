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

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=from-component"
                          sources="{
                            [
                                { root: '/ng2-example/app/dynamic-component-example/', files: 'dynamic.component.ts,dynamic.component.html,square.component.ts,cube.component.ts,params.component.ts,child-message.component.ts,currency.component.ts' },
                                { root: '/ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/J04rdB/">
    </show-complex-example>

    <h2 id="rich-dynamic">Richer Dynamic Components</h2>
    <p>A Richer Example using Angular Components as Cell Renderers, with Dynamic Components included via Modules.</p>

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=from-rich-component"
                          sources="{
                            [
                                { root: '/ng2-example/app/rich-dynamic-component-example/', files: 'rich.component.ts,rich.component.html,ratio.module.ts,ratio.parent.component.ts,ratio.component.ts,clickable.module.ts,clickable.parent.component.ts,clickable.component.ts' },
                                { root: '/ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/qmgvkW/">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
