<?php
$key = "Polymer Rich Grid";
$pageTitle = "ag-Grid Polymer Rich Grid";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid polymer feature rich grid";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Polymer Rich Grid Example</h2>
    <p>A feature rich Grid example, demonstrating many of ag-Grid's features, including a Polymer Component for the "name" column.</p>

<?= example('Rich Polymer Grid', 'rich-grid', 'polymer', array("exampleHeight" => 350, 'enterprise' => true)) ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
