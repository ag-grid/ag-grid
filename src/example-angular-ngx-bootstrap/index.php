<?php
$pageTitle = "ag-Grid Examples: Angular and ngx-bootstrap";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page shows examples with Angular and ngx-bootstrap.";
$pageKeyboards = "ag-Grid angular features third party material design typeahead bootstrap";
$pageGroup = "examples";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>


    <h1>ag-Grid Angular Examples with ngx-bootstrap</h1>

    <h2>Cell Editor with ngx-bootstrap Components</h2>
    <p>This example uses ngx-bootstrap as part of an Editor Components.</p>

    <ul class="content">
        <li>Date Picker</li>
        <li>Dropdown</li>
        <li>Radio Button - in this case demonstrating how you can do inline editing of cell values</li>
    </ul>

    <?= example('ngx bootstrap', 'ngx-bootstrap', 'angular', array('onlyShow' => 'angular', 'exampleHeight' => '350', 'extras' => array('ngx-bootstrap'))) ?>


<?php include '../documentation-main/documentation_footer.php'; ?>
