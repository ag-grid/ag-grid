<?php
$key = "Polymer MasterDetail";
$pageTitle = "ag-Grid Polymer Master/Detail Components";
$pageDescription = "A Master/Detail Example, with both the Master and the Detail elements being Polymer Components.";
$pageKeyboards = "ag-Grid polymer master detail component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Master/Detail Components</h2>
    <p>A Master/Detail Example, with both the Master and the Detail elements being Polymer Components.</p>

    <show-complex-example example="../polymer-examples/src/master-detail-components-example/index.html"
                          sources="{
                            [
                                { root: '/polymer-examples/src/master-detail-components-example/', files: 'index.html,master-detail-components-example.html,detail-panel-component.html,detail-panel-component.css,static-data.js' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
