<?php
$pageTitle = "Provided Filters";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. Out of the box many filters are provided. This page introduced the provided filters.";
$pageKeywords = "ag-Grid Provided Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Provided Filters</h1>

<p class="lead">
    This section describes the functionality common to all filters that are provided by the grid.
</p>

<p>
   The grid provides four filters out of the box: three
   <a href="../javascript-grid-filter-provided-simple/">Simple Filters</a> (Text, Number and Date), and an advanced
   <a href="../javascript-grid-filter-set/">Set Filter</a> which is available in the Enterprise version of the grid.
</p>

<p>
    Follow the links below to learn more about each specific filter:
</p>

<ul>
    <li><a href="../javascript-grid-filter-text/">Text</a></li>
    <li><a href="../javascript-grid-filter-number/">Number</a></li>
    <li><a href="../javascript-grid-filter-date/">Date</a></li>
    <li><a href="../javascript-grid-filter-set/">Set Filter</a><span class="enterprise-icon"></span></li>
</ul>

<p>
    The rest of this section will cover concepts that are common to every provided filter.
</p>

<h2>Structure of Provided Filters</h2>

<p>
    The diagram below outlines the structure of the filters. Each box represents a filter type
    with the functions listed in it. For example, all provided filters have button logic, but only the Date filter has
    a Date Comparator or a Date Picker.
</p>

<p>
    <img src="./providedFilters.png" style="width: 100%; margin-top: 10px; margin-bottom: 60px;"/>
</p>

<h2>Provided Filter UI</h2>

<p>
    Each provided filter is displayed in a UI with optional buttons at the bottom.
</p>

<p style="text-align: center;">
    <img src="./filterContent.png"/>
</p>

<h2 id="providedFilterParams">Provided Filter Params</h2>

<p>
    All of the provided filters have the following parameters:
</p>

<?php createDocumentationFromFile('providedFilters.json', 'filterParams') ?>

<h2 id="providedFilterApi">Provided Filter API</h2>

<p>
    Provided Filters provide the following methods:
</p>

<?php createDocumentationFromFiles(['../javascript-grid-filter-api/filterApi.json', 'providedFilters.json'], 'api') ?>

<h2>Apply, Clear, Reset and Cancel Buttons</h2>

<p>
    Each of the provided filters can optionally include Apply, Clear, Reset and Cancel buttons.
</p>

<p>
    When the Apply button is used, the filter is only applied once the Apply button is pressed.
    This is useful if the filtering operation will take a long time because the dataset is large,
    or if using server-side filtering (thus preventing unnecessary calls to the server).
</p>

<p>
    The Clear button clears just the filter UI, whereas the Reset button clears the filter UI and removes any active filters
    for that column.
</p>

<p>
    The Cancel button will discard any changes that have been made in the UI, restoring the state of the filter to match
    the applied model.
</p>

<p>
    The buttons will be displayed in the order they are specified in the <code>buttons</code> array.
</p>

<p>
    The example below demonstrates using the different buttons. It also demonstrates the relationship between
    the buttons and filter events. Note the following:
</p>

<ul class="content">
    <li>The <b>Athlete</b> and <b>Age</b> columns have filters with Apply and Reset buttons, but different orders.</li>
    <li>The <b>Country</b> column has a filter with Apply and Clear buttons.</li>
    <li>The <b>Year</b> column has a filter with Apply and Cancel buttons.</li>
    <li>
        The <b>Age</b> and <b>Year</b> columns have <code>closeOnApply</code> set to <code>true</code>, so the filter
        popup will be closed immediately when the filter is applied, reset or cancelled.
    </li>
    <li><code>onFilterModified</code> is called when the filter changes regardless of whether the Apply button is present.</li>
    <li><code>onFilterChanged</code> is called only after a new filter is applied.</li>
    <li>Looking at the console, it can be noted when a filter is changed, the result of <code>getModel()</code>
    and <code>getModelFromUi()</code> are different. The first reflects the active filter, while the second reflects
    what is in the UI (and not yet applied).</li>
</ul>

<?= grid_example('Buttons and Filter Events', 'buttons-and-filter-events', 'generated', ['enterprise' => true, 'exampleHeight' => 560, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel'], 'reactFunctional' => true]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
