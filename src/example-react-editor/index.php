<?php
$key = "React Editor";
$pageTitle = "ag-Grid React Component Editor";
$pageDescription = "A Cell Editor example - one with a popup editor, and another with a numeric editor.";
$pageKeyboards = "ag-Grid react editor component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Editor Components</h2>
    <p>A Cell Editor example - one with a popup editor, and another with a numeric editor.</p>
    <p>Each component demonstrates different editor related features</p>

    <show-complex-example example="../react-examples/examples/?fromDocs&example=editor"
                          sources="{
                            [
                                { root: '/react-examples/examples/src/editorComponentExample/', files: 'EditorComponentsExample.jsx,MoodRenderer.jsx,MoodEditor.jsx,NumericEditor.jsx' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>




