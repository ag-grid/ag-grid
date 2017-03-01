<?php
$key = "Angular Filter";
$pageTitle = "ag-Grid Angular Filter Component";
$pageDescription = "A Filter Example, with the Filter written as a Angular Component.";
$pageKeyboards = "ag-Grid angular filter component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Filter Component</h2>
    <p>A Filter Example, with the Filter written as a Angular Component.</p>

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=filter"
                          sources="{
                            [
                                { root: '../ng2-example/app/filter-component-example/', files: 'filter.component.ts,filter.component.html,partial-match-filter.component.ts' },
                                { root: '../ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/ePKaio/"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
