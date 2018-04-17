<?php
$pageTitle = "ag-Grid - Working with Data: Value Handlers";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Value Handlers. Each grid column typically has a field where it gets the value to display. However you can provide more logic here to get finer control over how data is retrieved (for display) and stored (after editing) with the family of Value Handlers. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Value Handlers";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Value Handlers</h1>

<p>
    This section gives an overview of the various <code>Value Handlers</code> available that can be used to provide custom handling
    when displaying and editing values in the grid.
</p>

<h2>Rendering Value Flow</h2>

<p>
    When Rendering a value in a cell the following handlers get invoked:
</p>

<table style="border-collapse: separate; border-spacing: 10px 5px;">
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
        <td >
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

<br>
<p>
    The flow diagram below illustrates the chain of handlers that get invoked prior to a value being displayed in a cell:
</p>

<img src="valueGetterFlow.svg" class="img-fluid" />

<h2>Value Saving Flow</h2>

<p>
    After editing a value in a cell the following handlers that get invoked:
</p>

<table style="border-collapse: separate; border-spacing: 10px 5px;">
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
    The flow diagram below shows the flow of a value after it is edited using the UI.
</p>

<img src="valueSetterFlow.svg" class="img-fluid" />

<?php include '../documentation-main/documentation_footer.php';?>
