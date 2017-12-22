<?php
$pageTitle = "ag-Grid Angular Third Party Examples";
$pageDescription = "A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.";
$pageKeyboards = "ag-Grid angular features third party material design typeahead bootstrap";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h2>ag-Grid Angular Examples with ngx-bootstrap</h2>

    <h4 id="ng2bootstrap">Cell Editor with ng2-bootstrap Components</h4>
    <p>This example uses <code>ng2-bootstrap</code> as part of an Editor Components.</p>
    <ul>
        <li>Date Picker</li>
        <li>Dropdown</li>
        <li>Radio Button - in this case demonstrating how you can do inline editing of cell values</li>
    </ul>

    <?= example('ngx bootstrap', 'ngx-bootstrap', 'angular', array('onlyShow' => 'angular', 'exampleHeight' => '350', 'extras' => array('ngx-bootstrap'))) ?>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
