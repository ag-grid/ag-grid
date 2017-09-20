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

    <p><span class="bold-roboto">Select All/Clear Selection</span>: Select or Deselect
        All
        Rows</p>
    <p><span class="bold-roboto">Hide/Show Country Column</span>: Select or Deselect
        All
        Rows
        (expand the Employee column to show the Country column first)</p>
    <p><span class="bold-roboto">Toggle The Tool Panel</span>: Let your users Pivot,
        Group
        and
        Aggregate using the Tool Panel</p>
    <p><span class="bold-roboto">Refresh Data</span>: Dynamically Update Grid Data</p>
    <p><span class="bold-roboto">Quick Filter</span>: Perform Quick Grid Wide
        Filtering
        with
        the Quick Filter</p>
    <p><span class="bold-roboto">DOB Filter</span>: Set the DOB filter to 01/01/2000
        using
        the
        Filter API (expand the Employee column to show the DOB column)</p>
    <p><span class="bold-roboto">Custom Headers</span>: Sort, Filter and Render
        Headers
        using
        Header Components</p>

    <?= example('ag-Grid in React', 'rich', 'react', array( "enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome", "bootstrap" ) )); ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
