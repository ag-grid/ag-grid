<?php
$pageTitle = "ag-Grid Examples: React Full Width";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows a Full Width Renderer Component in React.";
$pageKeyboards = "ag-Grid react full width component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Full Width Renderer</h2>
    <p>A Full Width Renderer Example</p>

    <?= example('Full Width Renderer', 'full-width', 'react', array( "exampleHeight" => 500, "showResult" => true, "extras" => array("bootstrap") )); ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
