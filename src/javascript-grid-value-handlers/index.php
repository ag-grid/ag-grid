<?php
$key = "Value Handlers";
$pageTitle = "ag-Grid Value Handlers";
$pageDescription = "ag-Grid Value Handlers";
$pageKeyboards = "ag-Grid Value Handlers";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h2 id="valueHandlers">Value Handlers</h2>

<p>
    This section gives an overview of the various value handlers available that can be used to provide custom handling
    when displaying and editing values in the grid.
</p>

<h2>Rendering Value Flow</h2>

<p>
    The flow diagram below shows the flow of the value to displaying it on the screen.
</p>

<img src="valueGetterFlow.svg"/>

<h2>Value Saving Flow</h2>

<p>
    The flow diagram below shows the flow of a value after it is edited using the UI.
</p>

<img src="valueSetterFlow.svg"/>

<?php include '../documentation-main/documentation_footer.php';?>
