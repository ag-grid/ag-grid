<?php
$key = "Angular MasterDetail";
$pageTitle = "ag-Grid Angular Master/Detail Components";
$pageDescription = "A Master/Detail Example, with both the Master and the Detail elements being Angular Components.";
$pageKeyboards = "ag-Grid angular master detail component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Master/Detail Components</h2>
    <p>A Master/Detail Example, with both the Master and the Detail elements being Angular Components.</p>

    <show-complex-example example="../framework-examples/angular-examples/index.html?fromDocs=true&example=master-detail"
                          sources="{
                            [
                                { root: '/framework-examples/angular-examples/app/master-detail-example/', files: 'masterdetail-master.component.ts,masterdetail-master.component.html,detail-panel.component.ts,detail-panel.component.html,detail-panel.component.css' },
                                { root: '/framework-examples/angular-examples/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/bpJgdo/">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
