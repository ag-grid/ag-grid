<?php
$key = "Angular Editor";
$pageTitle = "ag-Grid Angular Component Editor";
$pageDescription = "A Cell Editor example - one with a popup editor, and another with a numeric editor.";
$pageKeyboards = "ag-Grid angular editor component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Editor Components</h2>
    <p>A Cell Editor example - one with a popup editor, and another with a numeric editor.</p>
    <p>This example demonstrates Angular Editor Components within ag-Grid, as well as an example using the built in Rich
        Select editor.</p>
    <p><span style="font-weight: bold">Name</span>: Utilises the built in <code>RichSelect</code> editor</p>
    <p><span style="font-weight: bold">Mood</span>: A Custom Angular Editor demonstrating popup functionality, with full
        keyboard control.</p>
    <p><span style="font-weight: bold">Numeric</span>: A Custom Angular Editor demonstrating pre & post validation. Only
        numeric characters are allowed,
        and numbers greater than 1000000 will be rejected.</p>


    <?= example('Editor Components', 'editor', 'angular', array("exampleHeight" => 370, "showResult" => true)); ?>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>




