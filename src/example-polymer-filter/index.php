<?php
$key = "Polymer Filter";
$pageTitle = "ag-Grid Polymer Filter Component";
$pageDescription = "A Filter Example, with the Filter written as a Polymer Component.";
$pageKeyboards = "ag-Grid polymer filter component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Filter Component</h2>
    <p>A Filter Example, with the Filter written as a Polymer Component.</p>

    <show-complex-example example="../framework-examples/polymer-examples/src/filter-components-example/index.html"
                          sources="{
                            [
                                { root: '/framework-examples/polymer-examples/src/filter-components-example/', files: 'index.html,filter-components-example.html,partial-match-filter.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example></div>

<?php include '../documentation-main/documentation_footer.php';?>
