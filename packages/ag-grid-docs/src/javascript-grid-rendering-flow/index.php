<?php
$pageTitle = "ag-Grid - Working with Data: Rendering Flow";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Value Handlers. Each grid column typically has a field where it gets the value to display. However you can provide more logic here to get finer control over how data is retrieved (for display) and stored (after editing) with the family of Value Handlers. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Value Handlers";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>Cell Content</h1>

<p class="lead">
    Cell content with with regards how values are provided into the cells. There are different aspects
    of the grid that assist this.
</p>

<p>
    The different parts of the grid concerned with cell values are as follows:
</p>

<ul>
    <li>
        <a href="../javascript-grid-value-getters/#value-getter">Value Getter</a>:
        Instead of specifying <code>colDef.field</code>, you can use <code>colDef.valueGetter</code>
        to provide a function for getting cell values. This is more flexible than providing field
        values for specific cells.
    </li>
    <li>
        <a href="../javascript-grid-value-getters/">Value Formatters</a>:
        Use formatters to format values.
    </li>
    <li>
        <a href="../javascript-grid-cell-expressions/">Expressions</a>:
        Use strings instead of functions for value getters and formatters.
    </li>
    <li>
        <a href="../javascript-grid-reference-data/">Reference Data</a>:
        Reference data is used to display alternative values rather that what is in your
        data, eg you data could have USA but you want to display 'America'.
    </li>
</ul>

<h2>Rendering Flow</h2>

<p>
    How value getters, formatters and cell renderers work together to provide the
    end result is helpful. The flow diagram below illustrates how these different steps work together.
</p>

<img src="valueGetterFlow.svg" class="img-fluid" alt="Value Getter Flow" />

<?php include '../documentation-main/documentation_footer.php';?>
