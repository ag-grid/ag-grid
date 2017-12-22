<?php
$pageTitle = "ag-Grid Angular Third Party Examples";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid angular features third party material design typeahead bootstrap";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h2>ag-Grid Angular with ng2-typeahead</h2>

    <p>This example uses the <code>ng2-typeahead</code> directive as part of an Editor Component.</p>
    <p>Please note that <code>ng2-typeahead</code> does not appear to be AOT friendly, so please keep this in mind if
        you choose to use it.</p>

    <?= example('ng2 typeahead', 'ng2-typeahead', 'angular', array('onlyShow' => 'angular', 'exampleHeight' => '300')) ?>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
