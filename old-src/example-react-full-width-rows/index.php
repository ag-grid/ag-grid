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

    <?= example('Full Width Renderer', 'full-width', 'react', array( "exampleHeight" => 500, "showResult" => true, "extras" => array("bootstrap") )); ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
