<?php
$pageTitle = "ag-Grid - Working with Data: Editing Flow";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Value Handlers. Each grid column typically has a field where it gets the value to display. However you can provide more logic here to get finer control over how data is retrieved (for display) and stored (after editing) with the family of Value Handlers. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Value Handlers";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Editing Flow</h1>

<p class="lead">
    This section outlines the editing flow of data. That is the process the values goes through from
    editors and then into your data.
</p>

<h2>Configurable Steps</h2>

<p>
    When editing the following steps can be configured:
</p>

<table class="properties">
    <tr>
        <td>
            <b><a href="../javascript-grid-value-setters/#value-parser">Value Parser</a></b>:
        </td>
        <td>
            Allows you to parse values after an edit.
        </td>
    </tr>
    <tr>
        <td>
            <b><a href="../javascript-grid-value-setters/#value-setter">Value Setter</a></b>:
        </td>
        <td>
            Allows you to put values back into the underlying data.
        </td>
    </tr>
</table>

<p>
    The flow diagram below illustrates how these different steps work together.
</p>

<img src="valueSetterFlow.svg" class="img-fluid" alt="Value Setter Flow" />

<?php include '../documentation-main/documentation_footer.php';?>
