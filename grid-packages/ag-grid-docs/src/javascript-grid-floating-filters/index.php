<?php
$pageTitle = "Floating Filters";
$pageDescription = "Floating filters are filters pinned to the top of the grid for easy access.";
$pageKeyboards = "ag-Grid Floating Filters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="first-h1">Floating Filters</h1>

<p class="lead">
    Floating Filters are an additional row under the column headers where the user will be able to
    see and optionally edit the filters associated to each column.
</p>

<p>
    Floating filters are activated by setting grid property <code>floatingFilter=true</code>:
</p>

<snippet>
gridOptions = {
    // turn on floating filters
    floatingFilter: true
    ...
}</snippet>

<p>
    Floating filters depend on and coordinate with the main column filters. They do not contain their own state,
    rather they display the state of the main filter and if editable they set state on the main filter.
    For this reason, there is no API for getting or setting state of the floating filters.
</p>

<p>
    Every floating filter takes a parameter to show/hide automatically a button that will open the main filter.
</p>

<p>
    To see how floating filters work see
    <a href="../javascript-grid-floating-filter-component/">Floating Filter Components</a>.
</p>

<p>
    The following example shows the following features of floating filters:
</p>
<ul class="content">
    <li>Text filter: Have out of the box read/write floating filters (Sport column)</li>
    <li>Set filter: Have out of the box read floating filters  (Country column)</li>
    <li>Date and number filter: Have out of the box read/write floating filters for all filter except when switching
        to in range filtering, then the floating filter is read only (Age and date columns)</li>
    <li>Columns with the applyButton require the user to press enter on the floating filter for the filter to take
        effect (Gold column)</li>
    <li>Changes made directly to the main filter are reflected automatically in the floating filters
        (change any main filter)</li>
    <li>Columns with custom filter have automatic read only filter if the custom filter implements the method
        getModelAsString. (Athlete column)</li>
    <li>The user can configure when to show/hide the button that shows the rich filter (Silver and Bronze columns)</li>
    <li>Columns with <code>filter=false</code> don't have floating filters (Total column)</li>
    <li>
        Combining <code>suppressMenu=true</code> and <code>filter=false</code> lets you control where the user
        access to the rich filter. In this example <code>suppressMenu=true</code> for all the columns except
        Silver and Bronze
    </li>
</ul>

<?= example('Floating Filter', 'floating-filter', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<h2>Provided Floating Filters</h2>

<p>
    All the default filters provided by the grid provide their own implementation of a floating filter.
    All you need to do to enable these floating filters is set the <code>floatingFilter=true</code> grid property.
    The features of the provided floating filters are as follows:
</p>

<style>
    .parameter-key {
        font-weight: bold;
    }
</style>

<table class="properties">
    <tr>
        <th>Filter</th>
        <th>Editable</th>
        <th>Description</th>
    </tr>
    <tr>
        <td class="parameter-key">Text</td>
        <td>Sometimes</td>
        <td>
            Provides a text input field to display the filter value, or a read only label if read only.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">Number</td>
        <td>Sometimes</td>
        <td>
            Provides a text input field to display the filter value, or a read only label if read only.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">Date</td>
        <td>Sometimes</td>
        <td>
            Provides a Date input field to display the filter value, or a read only label if read only.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">Set</td>
        <td>No</td>
        <td>Provides a read only label by concatenating all selected values.</td>
    </tr>
</table>

<p>
    The Text, Number and Date (the simple filters) have their floating filters editable sometimes.
    The floating filter is editable if the filter has one condition and one value. If the floating
    filter has a) two conditions or b) zero (custom option) or two ('In Range') values, then the
    floating filter is read only.
</p>

<p>
    The screen shots below show example scenarios where the provided number floating filter
    is editable and read only.
</p>

<style>
    .floating-filter-image {
        padding-bottom: 20px;
    }
</style>

<ul>
    <li>
        <b>One Value and One Condition - Editable</b><br/>
        <img class="floating-filter-image" src="./oneValueOneCondition.png"/>
    </li>
    <li>
        <b>One Value and Two Conditions - Read Only</b><br/>
        <img class="floating-filter-image" src="./oneValueTwoConditions.png"/>
    </li>
    <li>
        <b>Two Values and One Condition - Read Only</b><br/>
        <img class="floating-filter-image" src="./twoValuesOneCondition.png"/>
    </li>
</ul>


<?php include '../documentation-main/documentation_footer.php';?>
