<?php
$key = "Angular Editor";
$pageTitle = "ag-Grid Angular Component Editor";
$pageDescription = "A Cell Editor example - one with a popup editor, and another with a numeric editor.";
$pageKeyboards = "ag-Grid angular editor component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Editor Components</h2>
    <p>A Cell Editor example - one with a popup editor, and another with a numeric editor.</p>
    <p>Each component demonstrates different editor related features</p>

    <show-complex-example example="../framework-examples/angular-examples/index.html?fromDocs=true&example=editor-component"
                          sources="{
                            [
                                { root: '/framework-examples/angular-examples/app/editor-component-example/', files: 'editor.component.ts,editor.component.html,mood-editor.component.ts,mood-renderer.component.ts,numeric-editor.component.ts' },
                                { root: '/framework-examples/angular-examples/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/259RDD/">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>




