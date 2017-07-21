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

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=floating-row"
                          sources="{
                            [
                                { root: '/ng2-example/app/floating-row-example/', files: 'floating-row-renderer.component.ts,floating-row-renderer.component.html,styled-renderer.component.ts' },
                                { root: '/ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/Of88H3/">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>

