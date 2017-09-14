<?php
$key = "Angular Markup";
$pageTitle = "ag-Grid Angular Rich Grid via Markup";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components, written in Markup.";
$pageKeyboards = "ag-Grid angular feature rich grid markup";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Rich Grid with Markup</h2>
    <p>A feature rich Grid example (as above), this time using Markup.</p>

    <?= example('ag-Grid in Angular with Markup', 'rich-grid-markup', 'angular', array( "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
