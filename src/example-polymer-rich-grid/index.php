<?php
$key = "Polymer Rich Grid";
$pageTitle = "ag-Grid Polymer Rich Grid";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid polymer feature rich grid";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Polymer Rich Grid Example</h2>
    <p>A feature rich Grid example, demonstrating many of ag-Grid's features, including a Polymer Component for the "name" column.</p>

    <show-complex-example example="../framework-examples/polymer-examples/src/rich-grid/index.html"
                          sources="{
                            [
                                { root: '/framework-examples/polymer-examples/src/rich-grid/', files: 'index.html,simple-cell-renderer.html,proficiencyFilter.js,skillsFilter.js,rich-grid-example.css,static-data.js,rich-grid-example.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
