<?php
$key = "Angular Rich Grid";
$pageTitle = "ag-Grid Angular Rich Grid";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid angular feature rich grid";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Angular Rich Grid Example</h2>
    <p>A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.</p>

    <show-complex-example example="../framework-examples/angular-examples/index.html?fromDocs=true&example=rich-grid"
                          sources="{
                            [
                                { root: '/framework-examples/angular-examples/app/rich-grid-example/', files: 'rich-grid.component.ts,rich-grid.component.html,proficiency-renderer.css,rich-grid.css' },
                                { root: '/framework-examples/angular-examples/app/header-group-component/', files: 'header-group.component.ts,header-group.component.html,header-group.component.css' },
                                { root: '/framework-examples/angular-examples/app/header-component/', files: 'header.component.ts,header.component.html,header.component.css' },
                                { root: '/framework-examples/angular-examples/app/filters/', files: 'skillFilter.ts,proficiencyFilter.ts' },
                                { root: '/framework-examples/angular-examples/app/date-component/', files: 'date.component.ts,date.component.html,date.component.css' },
                                { root: '/framework-examples/angular-examples/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/EINfsm/"
                          exampleHeight="525px">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
