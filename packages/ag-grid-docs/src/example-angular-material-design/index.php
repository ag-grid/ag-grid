<?php
$pageTitle = "ag-Grid Examples: Angular with Material Design Components";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page demostrates Angular with Material Design Components.";
$pageKeyboards = "ag-Grid angular features third party material design component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>


    <h1>ag-Grid Angular Examples with Material Design Components</h1>

    <h2>ag-Grid with Material Design Components - Set 1</h2>
    <p>This example uses the Material Design components as part of Editor Components.</p>

    <?= example('Material Design Components #1', 'material-design-1', 'angular', array('onlyShow' => 'angular', 'exampleHeight' => '260', 'extras' => array('materialdesign'))) ?>

    <h2>ag-Grid with Material Design Components - Set 2</h2>
    <p>This example uses the Material Design components as part of Editor Components, as well as an example
        of using a Material Design component in the Header.</p>

    <?= example('Material Design Components #2', 'material-design-2', 'angular', array('onlyShow' => 'angular', 'exampleHeight' => '300', 'extras' => array('materialdesign'))) ?>

    <h2>
    Angular Grid Resources
</h2>
<br/>
<ul>
    <li>
        Get started with Angular Grid in 5 minutes in our <a href="../angular-getting-started/" target="_blank">guide</a>.
    </li>
    <br/>
    <li>
        Browse our <a href="../best-angular-2-data-grid/" target="_blank">Angular Grid</a> page to discover all major benefits in using ag-Grid Angular. 
    </li>
    <br/>
    <li>
        Please take a look at the <a href="../angular-more-details">more details</a> section next for more detailed information on using Angular with ag-Grid. 
    </li>
</ul>
<?php include '../documentation-main/documentation_footer.php'; ?>
