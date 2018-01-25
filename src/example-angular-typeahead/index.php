<?php
$pageTitle = "ag-Grid Examples: Angular Third Party";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows how to use Angular with ng2-typeahead.";
$pageKeyboards = "ag-Grid angular features third party material design typeahead bootstrap";
$pageGroup = "examples";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>
    <h1>ag-Grid Angular with ng2-typeahead</h1>

    <p class="lead">This example uses the <code>ng2-typeahead</code> directive as part of an Editor Component.</p>

    <p>Please note that <code>ng2-typeahead</code> does not appear to be AOT friendly, so please keep this in mind if
        you choose to use it.</p>

    <?= example('ng2 typeahead', 'ng2-typeahead', 'angular', array('onlyShow' => 'angular', 'exampleHeight' => '300')) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
