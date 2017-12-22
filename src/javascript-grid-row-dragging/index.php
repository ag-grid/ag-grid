<?php
$pageTitle = "Row Dragging";
$pageDescription = "Rearranging rows is done by dragging the row with the mouse to the new position.";
$pageKeyboards = "Javascript Grid dragging rows";
$pageGroup = "features";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1" id="row-models">
        Dragging Rows
    </h1>

    <p>
    </p>

    <?= example('Simple Example', 'simple', 'generated') ?>

    <?= example('Events Example', 'events', 'generated') ?>

    <?= example('Simple Example', 'simple', 'generated', array("enterprise" => 1)) ?>

</div>

<?php include '../documentation-main/documentation_footer.php';?>