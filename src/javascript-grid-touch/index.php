<?php
$pageTitle = "Touch support: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Touch Support. User can navigate the features of the grid on a touch device with the built-in Touch Support. You don't need to do anything, it works out of the box. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "JavaScript DataGrid Touch";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>Touch</h1>

    <p class="lead">
        ag-Grid is designed to work on touch devices. By default, browsers convert tap events to mouse
        click events. This means, for example, if you tap on a cell in ag-Grid, the cell will get selected
        just like you clicked on the cell with a mouse. The remainder of this page explains touch gestured
        understood by the grid which are NOT simply the grid reacting to taps as mouse clicks. They are touch
        gestures coded into the grid.
    </p>

    <h2>Touch Gestures for ag-Grid Free</h2>

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

    <h2 class="heading-enterprise">Touch Gestures for ag-Grid Enterprise</h2>

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

<h2 class="heading-viewport-zooming">Enabling Double Clicking on Mobile Devices</h2>

<p>
    The default behaviour on many mobile devices when a page is double clicked on it to zoom in. To prevent this behaviour
    so that a double click would, for example, edit a cell you need to disable viewport zooming.
</p>

<p>You can disable viewport zooming by setting the following tag at the top level page:</p>

<snippet language="html">
&lt;meta name="viewport" content="width=device-width, initial-scale=1" /&gt;
</snippet>




<?php include '../documentation-main/documentation_footer.php';?>
