<?php
$key = "React Full Width";
$pageTitle = "ag-Grid React Full Width Example";
$pageDescription = "A Full Width Renderer Component";
$pageKeyboards = "ag-Grid react full width component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Full Width Renderer</h2>
    <p>A Full Width Renderer Example</p>

    <show-complex-example example="../react-examples/examples/?fromDocs&example=full-width"
                          sources="{
                            [
                                { root: '/react-examples/examples/src/fullWidthExample/', files: 'FullWidthComponentExample.jsx,NameAndAgeRenderer.jsx' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
