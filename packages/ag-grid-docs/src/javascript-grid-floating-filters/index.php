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
    All the default filters provided by ag-Grid provide their own implementation of a floating filter.
    All you need to do to enable these floating filters is set the <code>floatingFilter=true</code> grid property.
</p>

<p>
    Every floating filter also takes a parameter to show/hide automatically a button that will open the main filter.
</p>

<p>
    To see the specifics on what are all the parameters and the interface for a floating filter check out
    <a href="../javascript-grid-floating-filter-component/">the docs for floating filter components</a>.
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

<h2>Floating Text Filter</h2>

<p>
    If your grid has floatingFilter enabled, your columns with text filter will automatically show below the header a new
    column that will show two elements:
</p>

<ul class="content">
    <li>Filter input box: This input box serves two purposes:
        <ol>
            <li>
                Lets the user change directly the filtering text that will be used for filtering.
            </li>
            <li>It reflects any change made to the filtering text from anywhere within the application. This includes
                changes on the rich filter for this column made by the user directly or changes made to the filter through
                a call to setModel to this filter component</li>
        </ol>
    </li>
    <li>Filter button: This button is a shortcut to show the rich filter editor</li>
</ul>

<h2>Floating Number Filter</h2>
<p>
    If your grid has floatingFilter enabled, your columns with number filter will automatically show below the header a new
    column that will show two elements:
</p>

<ul class="content">
    <li>Filter input box: This input box serves two purposes:
        <ol>
            <li>
                Lets the user change directly the filtering number that will be used for filtering, if the filter type
                is inRange, the filterTo property will only be accessible from the filter rich menu or by setting the
                model htrough the code.
            </li>
            <li>It reflects any change made to the filtering text from anywhere within the application. This includes
                changes on the rich filter for this column made by the user directly or changes made to the filter through
                a call to setModel to this filter component</li>
        </ol>
    </li>
    <li>Filter button: This button is a shortcut to show the rich filter editor</li>
</ul>

<h2>Floating Date Filter</h2>
<p>
    If your grid has floatingFilter enabled, your columns with number filter will automatically show below the header a new
    column that will show two elements:
</p>

<ul class="content">
    <li>Filter input box: Dates represented here need to be entered in the following format: yyyy-mm-dd.
        This input box serves two purposes:
        <ol>
            <li>
                Lets the user change directly the filtering date that will be used for filtering, if the filter type
                is inRange, the dateTo property will only be accessible from the filter rich menu or by setting the
                model through the code.
            </li>
            <li>It reflects any change made to the filtering date from anywhere within the application. This includes
                changes on the rich filter for this column made by the user directly or changes made to the filter through
                a call to setModel to this filter component</li>
        </ol>
    </li>
    <li>Filter button: This button is a shortcut to show the rich filter editor</li>
</ul>


<?php include '../documentation-main/documentation_footer.php';?>
