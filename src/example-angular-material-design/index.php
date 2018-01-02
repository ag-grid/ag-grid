<?php
$pageTitle = "ag-Grid Angular with Material Design Components";
$pageDescription = "ag-Grid Angular with Material Design Components";
$pageKeyboards = "ag-Grid angular features third party material design component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h2>ag-Grid Angular Examples with Material Design Components</h2>

    <h4 id="material-design1">ag-Grid with Material Design Components - Set 1</h4>
    <p>This example uses the <code>Material Design</code> components as part of Editor Components.</p>

    <?= example('Material Design Components #1', 'material-design-1', 'angular', array('onlyShow' => 'angular', 'exampleHeight' => '260', 'extras' => array('materialdesign'))) ?>

    <h4 id="material-design2" style="margin-top: 20px">ag-Grid with Material Design Components - Set 2</h4>
    <p>This example uses the <code>Material Design</code> components as part of Editor Components, as well as an example
        of using a <code>Material Design</code> component in the Header.</p>

    <?= example('Material Design Components #2', 'material-design-2', 'angular', array('onlyShow' => 'angular', 'exampleHeight' => '300', 'extras' => array('materialdesign'))) ?>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
