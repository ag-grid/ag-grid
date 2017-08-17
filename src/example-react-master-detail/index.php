<?php
$key = "React MasterDetail";
$pageTitle = "ag-Grid React Master/Detail Components";
$pageDescription = "A Master/Detail Example, with both the Master and the Detail elements being React Components.";
$pageKeyboards = "ag-Grid react master detail component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Master/Detail Components</h2>
    <p>A Master/Detail Example, with both the Master and the Detail elements being React Components.</p>

    <show-complex-example example="../framework-examples/react-examples/examples/?fromDocs&example=master-detail"
                          sources="{
                            [
                                { root: '/framework-examples/react-examples/examples/src/masterDetailExample/', files: 'MasterDetailExample.jsx,DetailPanelComponent.jsx,DetailPanelComponent.css' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
