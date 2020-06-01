<?php
$pageTitle = "Number Filter: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Number Filter. Number Filter allows filtering numbers with {equals, notEquals, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange}. Free and Commercial version available.";
$pageKeywords = "ag-Grid Number Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Number Filter</h1>

<p class="lead">
    Number filters allow you to filter number data.
</p>

<p>
    Unlike <a href="../javascript-grid-filter-text/">Text</a> and <a href="../javascript-grid-filter-date/">Date</a>
    filters, the Number filter does not have any features beyond those shared with the other simple filters, which
    are explained in <a href="../javascript-grid-filter-provided/">Provided Filters</a> and
    <a href="../javascript-grid-filter-provided-simple/">Simple Filters</a>.
</p>

<h2>Number Filter Parameters</h2>

<p>
    Number Filters are configured though the <code>filterParams</code> attribute of the column definition. All of the
    parameters from Provided Filters are available:
</p>

<?= createDocumentationFromFile('../javascript-grid-filter-provided/providedFilters.json', 'filterParams'); ?>

<p>
    In addition, the following parameters are also available:
</p>

<?= createDocumentationFromFile('../javascript-grid-filter-provided-simple/simpleFilters.json', 'filterParams', ['Number']); ?>


<?php include '../documentation-main/documentation_footer.php';?>
