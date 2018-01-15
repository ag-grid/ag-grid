<?php
$pageTitle = "JavaScript DataGrid Touch";
$pageDescription = "Learn how to interact with ag-Grid on a touch device.";
$pageKeyboards = "JavaScript DataGrid Touch";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="touch">Touch</h2>

    <p>
        ag-Grid is designed to work on touch devices. By default, browsers convert tap events to mouse
        click events. This means, for example, if you tap on a cell in ag-Grid, the cell will get selected
        just like you clicked on the cell with a mouse. The remainder of this page explains touch gestured
        understood by the grid which are NOT simply the grid reacting to taps as mouse clicks. They are touch
        gestures coded into the grid.
    </p>

    <h4 id="touch-gestures-for-ag-grid-free">Touch Gestures for ag-Grid Free</h4>

    <p>
        The following touch gestures are supported by ag-Grid free.
    </p>

    <ul class="content">
        <li>
            Move columns by touch-dragging the column header with a touch.
        </li>
        <li>
            Move column groups by touch-dragging the column group header with a touch.
        </li>
        <li>
            Tap the column header to sort by that column.
        </li>
        <li>
            Tap and hold the column header for 500ms to bring up the column menu.
        </li>
    </ul>

    <h4 id="touch-gestures-for-ag-grid-enterprise">Touch Gestures for ag-Grid Enterprise</h4>

    <p>
        The following touch gestures are support by ag-Grid Enterprise - these are in addition to the ag-Grid free
        gestures mentioned above - they are are relevant to ag-Grid Enterprise only features.
    </p>

        <ul class="content">
            <li>
                Drag columns out of the tool panel using drag.
            </li>
            <li>
                Drag columns out of the row group and pivot drop zones by dragging.
            </li>
        </ul>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
