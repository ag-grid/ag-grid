<?php
$key = "React Redux";
$pageTitle = "ag-Grid React Redux Examples";
$pageDescription = "Example using Redux - utilising ag-Grids deltaRowDataMode";
$pageKeyboards = "ag-Grid react redux immutable component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Simple Redux Example</h2>
    <p>A simple example using Redux to manage the data to be displayed, making use of ag-Grids deltaRowDataMode to ensure only the changed rows are re-renderered.</p>

    <?= example('Simple Redux Example using ag-Grids deltaRowMode', 'simple-redux', 'react', array( "exampleHeight" => 460, "showResult" => true )); ?></div>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
