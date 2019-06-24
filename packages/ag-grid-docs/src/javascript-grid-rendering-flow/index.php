<?php
$pageTitle = "ag-Grid - Working with Data: Rendering Flow";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Value Handlers. Each grid column typically has a field where it gets the value to display. However you can provide more logic here to get finer control over how data is retrieved (for display) and stored (after editing) with the family of Value Handlers. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Value Handlers";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Rendering Flow</h1>

<p class="lead">
    This section outlines the rendering flow of data. That is the process the values goes through from
    the provided data to ending up as HTML on the screen.
</p>

<h2>Configurable Steps</h2>

<p>
    When rendering the following steps can be configured:
</p>

<table class="properties">
    <tr>
        <td>
            <b><a href="../javascript-grid-value-getters/#value-getter">Value Getter</a></b>:
        </td>
        <td>
            Gets the value from your data for display.
        </td>
    </tr>
    <tr>
        <td>
            <b><a href="../javascript-grid-value-getters/#value-formatter">Value Formatter</a></b>:
        </td>
        <td>
            Allows you to format or transform the value for display purposes.
        </td>
    </tr>
    <tr>
        <td>
            <b><a href="../javascript-grid-cell-rendering">Cell Renderer</a></b>:
        </td>
        <td>
            Gets the value from your data for display.
        </td>
    </tr>
</table>

<p>
    The flow diagram below illustrates how these different steps work together.
</p>

<img src="valueGetterFlow.svg" class="img-fluid" alt="Value Getter Flow" />

<?php include '../documentation-main/documentation_footer.php';?>
