<?php
$key = "Angular Floating Row";
$pageTitle = "ag-Grid Angular Floating Row";
$pageDescription = "ag-Grid Angular Floating Row Example";
$pageKeyboards = "ag-Grid angular floating row";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Floating Row Renderer</h2>
    <p>A Floating Row Renderer Example</p>

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=floating-row"
                          sources="{
                            [
                                { root: '../ng2-example/app/floating-row-example/', files: 'floating-row-renderer.component.ts,floating-row-renderer.component.html,styled-renderer.component.ts' },
                                { root: '../ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/Of88H3/">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>

