<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter - Overview</h1>

<p class="lead">
    The Set Filter takes inspiration from Excel's AutoFilter and allows filtering on sets of data. It is built on top of
    the shared functionality that is common across all <a href="../javascript-grid-filter-provided/">Provided Filters</a>.
</p>

<? enterprise_feature('Set Filter'); ?>

<p>
    <img src="set-filter.png" alt="set filter"/>
</p>

<h2>
    Set Filter Sections
</h2>

<p>
    The Set Filter is comprised of the following sections:
</p>

<p>
<ul class="content">
    <li>
        <b><a href="../javascript-grid-filter-set-mini-filter/">Mini Filter</a></b>: used to narrow the values
        available for selection inside the Filter List.
    </li>
    <li>
        <b>Select All</b>: used to select / deselect all values shown in the Filter List.
    </li>
    <li>
        <b><a href="../javascript-grid-filter-set-filter-list/">Filter List</a></b>: a list of Set Filter Values which
        can be selected / deselected to set the filter.
    </li>
    <li>
        <b>Filter Buttons</b>: Action buttons that can be optionally added to the bottom of the Set Filter.
    </li>
</ul>
</p>


<h2>Enabling Set Filters</h2>

<p>
    The Set Filter is the default filter used in the ag-Grid Enterprise, however it can also be explicitly
    configured as shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    columnDefs: [
        {
            field: 'country',
            filter: true // Set Filter is used by default in Enterprise version
        },
        {
            field: 'year',
            filter: 'agSetColumnFilter' // explicitly configure the Set Filter
        },
    ],
    // other options
}
SNIPPET
    , 'ts') ?>

<p>
    The following example demonstrates how the Set Filter can be enabled. Note the following:
</p>

<ul class="content">
    <li>
        The <b>Athlete</b> column has <code>filter=true</code> which defaults to the Set Filter as this example is using
        ag-Grid Enterprise.
    </li>
    <li>
        The <b>Country</b> column is explicitly configured to use the Set Filter using
        <code>filter='agSetColumnFilter'</code>.
    </li>
    <li>
        All other columns are configured to use the <a href="../javascript-grid-filter-number/">Number Filter</a>
        using <code>filter='agNumberColumnFilter'</code>.
    </li>
    <li>
        Filters can be accessed from the <a href="../javascript-grid-column-menu/">Column Menu</a> or by clicking on the
        filter icon in the <a href="../javascript-grid-floating-filters/">Floating Filters</a>.
    </li>
</ul>

<?= grid_example('Enabling Set Filters', 'enabling-set-filters', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<h2>Set Filter Parameters</h2>

<p>
    Parameters that are common to all <a href="../javascript-grid-filter-provided/">Provided Filters</a>:
</p>

<?php createDocumentationFromFile('../javascript-grid-filter-provided/providedFilters.json', 'filterParams') ?>

<p>
    Parameters that are specific to the Set Filter:
</p>
<?php createDocumentationFromFile('setFilterParams.json', 'filterParams') ?>

<h2>Next Up</h2>

<p>
    Continue to the next section: <a href="../javascript-grid-filter-set-filter-list">Filter List</a>.
</p>


<?php include '../documentation-main/documentation_footer.php';?>
