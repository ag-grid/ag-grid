<?php
$pageTitle = "Provided Filters";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. Out of the box many filters are provided. This page introduced the provided filters.";
$pageKeyboards = "ag-Grid Provided Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1" id="pagination">Provided Filters</h1>

<p class="lead">
    Provided filters are the filters that come as part of the grid. In total there are four
    provided filters, three simple filters (Text, Number and Date Filters) and one advanced
    filter (Set Filter). The simple filters are available in the community version of ag-Grid.
    The advanced Set filter is only available in ag-Grid Enterprise.
</p>

<p>
    The diagram below outlines the structure of the filters. Each box represents a filter type
    with the functions listed in it. For example all provided filters have Apply and Clear button
    logic. Only the Date filter has a Date Comparator or a Date Picker.
</p>

<p style="text-align: center; padding-top: 20px; font-size: 20px;">
    <b>Provided Filter Functions</b>
</p>

<p>
    <img src="./providedFilters.png" style="width: 100%; margin-top: 10px; margin-bottom: 60px;"/>
</p>

<p>
    This page describes the functionality common to all provided filters.
    See <a href="../javascript-grid-filter-provided-simple/">Simple Filters</a> for additional information
    relative to simple filters. See <a href="../javascript-grid-filter-set/">Set Filter</a> for additional information
    on the Set filter.
</p>

<h2>Provided Filter UI</h2>

<p>
    Each provided filter is displayed in a UI with optional Clear and Apply buttons at the bottom.
</p>

<p style="text-align: center;">
    <img src="./filterContent.png"/>
</p>

<h2 id="providedFilterParams">Provided Filter Params</h2>

<p>
    All of the provided filters have the following parameters:
</p>

<style>
    .parameter-key {
        font-weight: bold;
    }
</style>

<table class="properties">
    <tr>
        <th>Parameter</th>
        <th>Description</th>
    </tr>
    <tr>
        <td class="parameter-key">applyButton</td>
        <td>Set to <code>true</code> to have the filter us an Apply button. If the Apply button is present,
            then the filter is only applied after the user hits the Apply button.</td>
    </tr>
    <tr>
        <td class="parameter-key">clearButton</td>
        <td>Set to <code>true</code> to have the filter us a Clear button. The Clear button will clear the
            details of the filter thus resetting it.</td>
    </tr>
    <tr>
        <td class="parameter-key">debounceMs</td>
        <td>By default the
            <a href="../javascript-grid-filter-text">Text</a> and
            <a href="../javascript-grid-filter-number">Number</a> will debounce by 500ms.
            This is because these filters have text field inputs, so time is given to the user to type items in.
            The
            <a href="../javascript-grid-filter-set">Set</a> and
            <a href="../javascript-grid-filter-date">Date</a> will execute immediately (no debounce).
            To override these defaults, set <code>debounceMs</code> to the number of milliseconds to debounce by.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">newRowsAction</td>
        <td>This property is for when using the <a href="../javascript-grid-client-side-model/">Client Side Row Model</a>
            only. If set to 'clear', then setting data into the grid by calling api.setRowData() (or updating the rowData
            property if bound by a framework) will clear (reset) the filter. If set to 'keep' then the grid
            will keep it's currently set filter. The default is 'clear', so set to 'keep' if you want to keep filter state
            before loading new data into the grid.
        </td>
    </tr>
</table>



<h2>Apply & Clear Buttons</h2>

<p>
    Each of the provided filters can have an Apply and / or Clear button.
</p>
<p>
    When the Apply button is active, the filter is only applied after the Apply button is pressed.
    This is useful if the filtering operation will take a long time because the dataset is large,
    or if doing server side filtering (thus preventing unnecessary calls to the server).
</p>

<p>
    The Clear button clears the filters UI.
</p>

<p>
    The example below also demonstrates using the apply button. It also demonstrates the relationship between
    the Apply button and filter events. Note the following:
</p>
<ul class="content">
    <li>The Athlete, Age and Country columns have filters with Apply and Clear buttons.</li>
    <li>onFilterModified gets called when the filter changes regardless of the apply button.</li>
    <li>onFilterChanged gets called after a new filter is applied.</li>
</ul>

<?= example('Apply Button and Filter Events', 'apply-and-filter-events', 'generated', array("processVue" => true)) ?>



<?php include '../documentation-main/documentation_footer.php';?>
