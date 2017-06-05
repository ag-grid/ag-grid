<?php
$key = "React Filter";
$pageTitle = "ag-Grid React Filter Component";
$pageDescription = "A Filter Example, with the Filter written as a React Component.";
$pageKeyboards = "ag-Grid react filter component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Filter Component</h2>
    <p>A Filter Example, with the Filter written as a React Component.</p>

    <show-complex-example example="../react-examples/examples/?fromDocs&example=filter"
                          sources="{
                            [
                                { root: '/react-examples/examples/src/filterComponentExample/', files: 'FilterComponentExample.jsx,PartialMatchFilter.jsx' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
