<?php
$key = "Angular Full Width";
$pageTitle = "ag-Grid Angular Full Width Example";
$pageDescription = "A Full Width Renderer Component";
$pageKeyboards = "ag-Grid angular full width component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Full Width Renderer</h2>
    <p>A Full Width Renderer Example</p>

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=full-width"
                          sources="{
                            [
                                { root: '/ng2-example/app/full-width-example/', files: 'full-width-renderer.component.ts,full-width-renderer.component.html,name-age-renderer.component.ts' },
                                { root: '/ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/DoMWeU/">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
