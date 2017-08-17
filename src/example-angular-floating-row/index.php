<?php
$key = "Angular Pinned Row";
$pageTitle = "ag-Grid Angular Pinned Row";
$pageDescription = "ag-Grid Angular Pinned Row Example";
$pageKeyboards = "ag-Grid angular pinned row";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Pinned Row Renderer</h2>
    <p>A Pinned Row Renderer Example</p>

    <show-complex-example example="../framework-examples/angular-examples/index.html?fromDocs=true&example=pinned-row"
                          sources="{
                            [
                                { root: '/framework-examples/angular-examples/app/pinned-row-example/', files: 'pinned-row-renderer.component.ts,pinned-row-renderer.component.html,styled-renderer.component.ts' },
                                { root: '/framework-examples/angular-examples/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/Of88H3/">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>

