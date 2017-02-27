<?php
$key = "Angular Markup";
$pageTitle = "ag-Grid Angular Rich Grid via Markup";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components, written in Markup.";
$pageKeyboards = "ag-Grid angular feature rich grid markup";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Rich Grid with Markup</h2>
    <p>A feature rich Grid example (as above), this time using Markup.</p>

    <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=rich-grid-declarative"
                          sources="{
                            [
                                { root: '../ng2-example/app/rich-grid-declarative-example/', files: 'rich-grid-declarative.component.ts,rich-grid-declarative.component.html,proficiency-renderer.css,rich-grid.css' },
                                { root: '../ng2-example/app/header-group-component/', files: 'header-group.component.ts,header-group.component.html,header-group.component.css' },
                                { root: '../ng2-example/app/header-component/', files: 'header.component.ts,header.component.html,header.component.css' },
                                { root: '../ng2-example/app/filters/', files: 'skillFilter.ts,proficiencyFilter.ts' },
                                { root: '../ng2-example/app/date-component/', files: 'date.component.ts,date.component.html,date.component.css' },
                                { root: '../ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/1rHK9l/"
                          exampleHeight="525px">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
