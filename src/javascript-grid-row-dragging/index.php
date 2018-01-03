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

    <h2>Simple</h2>

    <?= example('Row Drag Simple', 'simple', 'generated') ?>

    <h2>Suppress Row Drag</h2>

    <?= example('Suppress Row Drag', 'suppress-row-drag', 'generated') ?>

    <h2>Passive Events</h2>

    <?= example('Row Drag Passive Events', 'passive-events', 'generated') ?>

    <h2>Simple Passive Moving</h2>

    <ul>
        <li>
            Property suppressRowDrag=true when sorting or filtering is active,
            as the simplistic moving logic only considers the non-sorted non-filtered
            data. If sorted or filtered data is to be considered, the application (not
            the grid) needs to consider what logic to apply in these circumstances.
        </li>
    </ul>

    <?= example('Row Drag Simple Passive Moving', 'simple-passive-moving', 'generated') ?>

    <h2>Dragging with Row Groups</h2>

    <?= example('Dragging with Row Groups', 'dragging-with-row-groups', 'generated', array("enterprise" => 1)) ?>

    <h2>Dragging with Tree Data</h2>

    <?= example('Dragging with Tree Data', 'dragging-with-tree-data', 'generated', array('enterprise' => true, 'extras' => array('fontawesome')) ) ?>

    <h2>Other Row Models</h2>

</div>

<?php include '../documentation-main/documentation_footer.php';?>