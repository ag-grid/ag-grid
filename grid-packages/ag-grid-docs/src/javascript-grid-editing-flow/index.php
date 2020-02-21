<?php
$pageTitle = "ag-Grid - Working with Data: Editing Flow";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Value Handlers. Each grid column typically has a field where it gets the value to display. However you can provide more logic here to get finer control over how data is retrieved (for display) and stored (after editing) with the family of Value Handlers. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Value Handlers";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Saving Content</h1>

<p class="lead">
    This section outlines the flow of saving cell content after editing. That is the process that values go through from
    leaving the editors and then into your data.
</p>

<p>
    The different parts of the grid concerned with saving cell values are as follows:
</p>

<ul>
    <li>
        <a href="../javascript-grid-value-parsers/">Value Parser</a>:
        Allows you to parse values after an edit.
    </li>
    <li>
        <a href="../javascript-grid-value-setters/">Value Setter</a>:
        Allows you to put values back into the underlying data.
    </li>
</ul>

<h2>Saving Flow</h2>

<p>
    How value parsers, setters and cell editors work together to provide the
    end result is helpful. The flow diagram below illustrates how these different steps work together.
</p>

<img src="valueSetterFlow.svg" class="img-fluid" alt="Value Setter Flow" />

<?php include '../documentation-main/documentation_footer.php';?>
