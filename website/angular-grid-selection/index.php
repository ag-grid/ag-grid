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

    <h4>Selection Callbacks</h4>

    There are two callback with regards selection:<br/>
    rowSelected(row): Gets called when a row is selected and passes the selected row.<br/>
    selectionChanged(): Gets called when a row is selected or deselected.<br/>

    <show-example example="example3"></show-example>

</div>

<?php include '../documentation_footer.php';?>
