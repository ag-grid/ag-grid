<?php
$key = "Keyboard Navigation";
$pageTitle = "AngularJS Angular Grid Keyboard Navigation";
$pageDescription = "AngularJS Angular Grid Keyboard Navigation";
$pageKeyboards = "AngularJS Angular Grid Keyboard Navigation";
include '../documentation_header.php';
?>

<div>

    <h2>Keyboard Navigation</h2>

    <p>
        Clicking on a cell gives the cell focus. You can then navigate and interact with the grid in the
        following ways...
    </p>

    <h4>Navigation</h4>

    <p>
        Use the arrow keys to move focus to the selection up, down, left and right. If the selected cell is
        already on the boundary for that position (eg if on the first column and the left key is pressed)
        then the key press has no effect.
    </p>

    <p>
        If using grouping and <i>groupUseEntireRow=true</i>, then the group row is not focusable. When
        navigating, the grouping row is skipped.
    </p>

    <h4>Groups</h4>

    <p>
        If on a group element, hitting the Enter key will expand or collapse the group. This only works
        when displaying groups in a column (<i>groupUseEntireRow=false</i>), as otherwise the group cell
        is not selectable.
    </p>

    <h4>Editing</h4>

    <p>
        Pressing the Enter key on a cell will put the cell into edit mode, if editing is allowed on the cell.
        This will work for the default cell editor.
    </p>

    <h4>Selection</h4>

    <p>
        Pressing the Space key on a cell will select the cells row, or deselect the row if already selected.
        If multi-select is enabled, then the selection will not remove any previous selections.
    </p>

    <h4>Custom Actions</h4>

    <p>
        Custom cell renderers can listen to key presses on the focused div. The grid element that receives
        the focus is provided to the cell renderers via the <i>eGridCell</i> parameter. You can add your
        own listeners to this cell. Via this method you can, for example, have your custom cell editors
        go into edit mode when the Enter key is pressed.
    </p>

    <h4>Suppress Cell Selection</h4>

    <p>
        If you want keyboard navigation turned off, then set <i>suppressCellSelection=true</i> in the <i>gridOptions</i>.
    </p>

    <h4>Example</h4>

    <p>
        All the items above (navigation, editing, groups, selection) are observable in the test drive.
        As such, a separate example is not provided here.
    </p>

</div>

<?php include '../documentation_footer.php';?>
