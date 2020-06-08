<?php
$pageTitle = "Floating Filters";
$pageDescription = "Floating filters are filters pinned to the top of the grid for easy access.";
$pageKeywords = "ag-Grid Floating Filters";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Floating Filters</h1>

<p class="lead">
    Floating Filters are an additional row under the column headers where the user will be able to
    see and optionally edit the filters associated with each column.
</p>

<p>
    Floating filters are activated by setting the property <code>floatingFilter = true</code> on the <code>colDef</code>:
</p>

<?= createSnippet(<<<SNIPPET
colDef = {
    // turn on floating filter
    floatingFilter: true
    ...
}
SNIPPET
) ?>

<p>
    To have floating filters on for all columns by default, you should set <code>floatingFilter</code> on the
    <code>defaultColDef</code>. You can then disable floating filters on a per-column basis by setting
    <code>floatingFilter = false</code> on an individual <code>colDef</code>.
</p>

<p>
    Floating filters depend on and co-ordinate with the main column filters. They do not have their own state,
    but rather display the state of the main filter and set state on the main filter if they are editable.
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
    <li>Text filter: has out of the box read/write floating filter (Sport column)</li>
    <li>Set filter: has out of the box read-only floating filter (Country column)</li>
    <li>
        Date and Number filter: have out of the box read/write floating filters for all filters except when switching
        to in-range filtering, where the floating filter is read-only (Age and Date columns)
    </li>
    <li>
        Columns with <code>buttons</code> containing <code>'apply'</code> require the user to press <code>Enter</code>
        on the floating filter for the filter to take effect (Gold column)
    </li>
    <li>
        Changes made directly to the main filter are reflected automatically in the floating filters
        (change any main filter)
    </li>
    <li>
        Columns with a custom filter have an automatic read-only floating filter if the custom filter implements the
        method <code>getModelAsString()</code> (Athlete column)
    </li>
    <li>The user can configure when to show/hide the button that shows the full filter (Silver and Bronze columns)</li>
    <li>The Year column has a filter, but has the floating filter disabled</li>
    <li>The Total column has no filter and therefore no floating filter either</li>
    <li>
        Combining <code>suppressMenu = true</code> and <code>filter = false</code> lets you control where the user
        can access the full filter. In this example <code>suppressMenu = true</code> for all the columns except
        Year, Silver and Bronze
    </li>
</ul>

<?= grid_example('Floating Filter', 'floating-filter', 'generated', ['enterprise' => true, 'exampleHeight' => 615, 'modules' => ['clientside', 'setfilter', 'menu']]) ?>

<h2>Provided Floating Filters</h2>

<p>
    All the default filters provided by the grid provide their own implementation of a floating filter.
    All you need to do to enable these floating filters is set the <code>floatingFilter = true</code> column property.
    The features of the provided floating filters are as follows:
</p>

<table class="reference">
    <tr>
        <th>Filter</th>
        <th>Editable</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>Text</td>
        <td>Sometimes</td>
        <td>
            Provides a text input field to display the filter value, or a read-only label if read-only.
        </td>
    </tr>
    <tr>
        <td>Number</td>
        <td>Sometimes</td>
        <td>
            Provides a text input field to display the filter value, or a read-only label if read-only.
        </td>
    </tr>
    <tr>
        <td>Date</td>
        <td>Sometimes</td>
        <td>
            Provides a date input field to display the filter value, or a read-only label if read-only.
        </td>
    </tr>
    <tr>
        <td>Set</td>
        <td>No</td>
        <td>Provides a read-only label by concatenating all selected values.</td>
    </tr>
</table>

<p>
    The floating filters for Text, Number and Date (the simple filters) are editable when the filter has one
    condition and one value. If the floating filter has a) two conditions or b) zero (custom option) or two ('In Range')
    values, the floating filter is read-only.
</p>

<p>
    The screen shots below show example scenarios where the provided Number floating filter
    is editable and read-only.
</p>

<style>
    .floating-filter-image {
        padding: 20px 0;
    }
</style>

<ul>
    <li>
        <b>One Value and One Condition - Editable</b><br />
        <img class="floating-filter-image" src="./oneValueOneCondition.png" />
    </li>
    <li>
        <b>One Value and Two Conditions - Read-Only</b><br />
        <img class="floating-filter-image" src="./oneValueTwoConditions.png" />
    </li>
    <li>
        <b>Two Values and One Condition - Read-Only</b><br />
        <img class="floating-filter-image" src="./twoValuesOneCondition.png" />
    </li>
</ul>

<?php include '../documentation-main/documentation_footer.php';?>
