<?php
$pageTitle = "ag-Grid Examples: Grouped Row Renderer with React";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows a React grouped row renderer example.";
$pageKeyboards = "ag-Grid react grouped row component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Group Row Inner Renderer</h2>
    <p>A Group Row Inner Renderer Example</p>

    <?= example('Grouped Row Inner Renderer', 'grouped', 'react', array( "enterprise" => 1, "exampleHeight" => 360, "showResult" => true )); ?></div>

<?php include '../documentation-main/documentation_footer.php';?>
