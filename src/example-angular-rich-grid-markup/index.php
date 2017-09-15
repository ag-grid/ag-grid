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

    <div class="row">
        <div class="col-sm-12">
            <h5>This example demonstrates many features of ag-Grid.</h5>
            <p><span style="font-weight: bold">Select All/Clear Selection</span>: Select or Deselect All Rows</p>
            <p><span style="font-weight: bold">Hide/Show Country Column</span>: Select or Deselect All Rows (expand the Employee column to show the Country column first)</p>
            <p><span style="font-weight: bold">Toggle The Tool Panel</span>: Let your users Pivot, Group and Aggregate using the Tool Panel</p>
            <p><span style="font-weight: bold">Refresh Data</span>: Dynamically Update Grid Data</p>
            <p><span style="font-weight: bold">Quick Filter</span>: Perform Quick Grid Wide Filtering with the Quick Filter</p>
            <p><span style="font-weight: bold">DOB Filter</span>: Set the DOB filter to 01/01/2000 using the Filter API (expand the Employee column to show the DOB column)</p>
            <p><span style="font-weight: bold">Custom Headers</span>: Sort, Filter and Render Headers using Header Components</p>
        </div>
    </div>

    <?= example('ag-Grid in Angular with Markup', 'rich-grid-markup', 'angular', array( "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome", "bootstrap" ) )); ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
