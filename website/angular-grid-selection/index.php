<?php
$pageTitle = "Selection";
$pageDescription = "Angular Grid Selection";
$pageKeyboards = "Angular Grid Selection";
include '../documentation_header.php';
?>

<div>

    <h2>Selection</h2>

    Selection can be either single row selection or multiple row selection.
    <p/>
    All the currently selected rows are stored in an array on the grid options named selectedRows.

    <h4>Single Row Selection</h4>

    The example below shows single row selection.

    <show-example example="example1"></show-example>

    <h4>Multiple Row Selection</h4>

    The example below shows multi-row selection.

    <show-example example="example2"></show-example>

    <h4>Checkbox Selection</h4>

    Checkbox selection can be used in two places: a) row selection and b) group selection.

    </p>

    To enable checkbox selection for a row, set the attribute 'checkboxSelection' to true
    on one of the column definitions.

    </p>

    To enable checkbox selection for groups, set the attribute 'groupCheckboxSelection' to
    one of 'group' or 'children'. When set to <b>group</b>, then selecting the group will
    select the group node. When set to <b>children</b>, then selecting the group will
    either select or deselect all of the children.

    <h4>Selection Callbacks</h4>

    There are two callback with regards selection:<br/>
    rowSelected(row): Gets called when a row is selected and passes the selected row.<br/>
    selectionChanged(): Gets called when a row is selected or deselected.<br/>

    <show-example example="example3"></show-example>

</div>

<?php include '../documentation_footer.php';?>
