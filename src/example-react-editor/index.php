<?php
$key = "React Editor";
$pageTitle = "ag-Grid React Component Editor";
$pageDescription = "A Cell Editor example - one with a popup editor, and another with a numeric editor.";
$pageKeyboards = "ag-Grid react editor component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Editor Components</h2>
    <p>A Cell Editor example - one with a popup editor, and another with a numeric editor.</p>

    <p>This example demonstrates React Editor Components within ag-Grid, as well as an example using the built in Rich Select editor.</p>
    <p><span class="bold-roboto">Name</span>: Utilises the built in <code>RichSelect</code> editor</p>
    <p><span class="bold-roboto">Mood</span>: A Custom React Editor demonstrating popup functionality, with full keyboard control.</p>
    <p><span class="bold-roboto">Numeric</span>: A Custom React Editor demonstrating pre & post validation. Only numeric characters are allowed,
        and numbers greater than 1000000 will be rejected.</p>

    <?= example('Editor Components', 'editor', 'react', array( "enterprise" => 1, "exampleHeight" => 380, "showResult" => true )); ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>




