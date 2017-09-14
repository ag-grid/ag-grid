<?php
$key = "Angular Editor";
$pageTitle = "ag-Grid Angular Component Editor";
$pageDescription = "A Cell Editor example - one with a popup editor, and another with a numeric editor.";
$pageKeyboards = "ag-Grid angular editor component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Editor Components</h2>
    <p>A Cell Editor example - one with a popup editor, and another with a numeric editor.</p>
    <p>Each component demonstrates different editor related features</p>

    <?= example('Editor Components', 'editor', 'angular', array("exampleHeight" => 370, "showResult" => true)); ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>




