<?php
$key = "React Rich Grid";
$pageTitle = "ag-Grid React Rich Grid";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid react feature rich grid";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>React Rich Grid Example</h2>
    <p>A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.</p>

    <?= example('ag-Grid in React', 'rich', 'react', array( "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome" ) )); ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
