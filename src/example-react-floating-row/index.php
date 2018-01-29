<?php
$pageTitle = "ag-Grid Examples: React Pinned Row";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows a React pinned row example.";
$pageKeyboards = "ag-Grid react pinned row";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Pinned Row Renderer</h2>
    <p>A Pinned Row Renderer Example</p>

    <?= example('Pinned Row Component', 'pinned', 'react', array( "exampleHeight" => 420, "showResult" => true )); ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>

