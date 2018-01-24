<?php
$pageTitle = "ag-Grid React Redux Examples";
$pageDescription = "Example using Redux - utilising ag-Grids deltaRowDataMode";
$pageKeyboards = "ag-Grid react redux immutable component";
$pageGroup = "examples";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Simple Redux Example</h1>
<p class="lead">A simple example using Redux to manage the data to be displayed, making use of ag-Grids deltaRowDataMode to ensure only the changed rows are re-renderered.</p>

<?= example('Simple Redux Example using ag-Grids deltaRowMode', 'simple-redux', 'react', array( "exampleHeight" => 460, "showResult" => true )); ?>


<?php include '../documentation-main/documentation_footer.php';?>
