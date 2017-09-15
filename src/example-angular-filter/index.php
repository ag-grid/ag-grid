<?php
$key = "Angular Filter";
$pageTitle = "ag-Grid Angular Filter Component";
$pageDescription = "A Filter Example, with the Filter written as a Angular Component.";
$pageKeyboards = "ag-Grid angular filter component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Filter Component</h2>
    <p>A Filter Example, with the Filter written as a Angular Component.</p>

    <?= example('Filter Component', 'filter', 'angular', array("exampleHeight" => 445, "showResult" => true, "extras" => array( "fontawesome", "bootstrap" ))); ?>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
