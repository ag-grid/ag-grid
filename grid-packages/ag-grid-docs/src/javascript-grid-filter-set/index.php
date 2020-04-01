<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter</h1>

<p class="lead">
    Set filters allow you to filter on set data, influenced by how filters work in Microsoft Excel.
    The page <a href="../javascript-grid-filter-provided/">Provided Filters</a> explains the common
    parts of all provided filters. This page builds on that and explains some details that are specific
    to the set filter.
</p>

<? enterprise_feature("Set Filter"); ?>

<h2>Set Filter Parameters</h2>

<p>
    The set filter params are as follows:
</p>

<?php createDocumentationFromFile('setFilter.json', 'filterParams') ?>

<h2>Complex Objects - <code>keyCreator</code></h2>

<p>
    If you are providing complex objects as values, then you need to provide a <code>colDef.keyCreator</code> function
    to convert the objects to strings. This string is used to compare objects when filtering, and to render a label in
    the filter UI, so it should return a human-readable value. The example below demonstrates <code>keyCreator</code> with the country
    column by replacing the country name in the data with a complex object of country name and code. If the <code>keyCreator</code>
    was not provided on the <code>colDef</code>, the set filter would not work.
</p>

<h2>Set Filter - Search Field</h2>

<p>
    The text box in the set filter is to allow filtering of displayed filter items, but doesn't actually change the
    applied filter.
</p>
<p>
    The expected flow when using the search box would be uncheck "Select All", type what you're after
    in the search box and then finally select the filter entries you want to actually filter on.
</p>

<h2>Example: Set Filters</h2>

<p>
    The example below demonstrates the set filter.
    Notice that the Athlete column is given the set of filters, providing some filter options for which
    no corresponding rows exist, which can be useful if you are missing items in what would otherwise be
    a complete list; for example, if listing days of the week, and no row data for Wednesday exists, then presenting
    the filter to the user could give the impression that the filter is broken because it is missing
    Wednesday as an option.
</p>

<p>
    The example also demonstrates using the <code>ag-header-cell-filtered</code> class, which is applied to the header
    cell when the header is filtered. By default, no style is applied to this class, but the example shows
    applying a different background colour to this style.
</p>

<p>
    The Sport column also has the property <code>suppressMiniFilter</code> set to <code>true</code>, hiding the text input box for the
    set filter in this column (compare this set filter with Athlete where <code>suppressMiniFilter = false</code>, the default).
</p>

<p>
    The Athlete column has a debounce of 1000ms before the selected options are filtered out.
</p>

<?= grid_example('Set Filter', 'set-filter', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter']]) ?>

<h2>Asynchronous Values</h2>

<p>
    In addition to being able to specify a hard-coded list of values for your set filter, you can provide a callback
    to load the values asynchronously. The callback receives a parameter object. The interface for this parameter object
    is as follows:
</p>

<?= createSnippet(<<<SNIPPET
export interface SetFilterValuesFuncParams {
    // The function to call with the values to load into the filter once they are ready
    success: (values: string[]) => void;
    // The column definition object from which the set filter is invoked
    colDef: ColDef;
}
SNIPPET
, 'ts') ?>

<p>
    <code>success</code> is callback function that you can call as soon as the values for the <code>setFilter</code> are ready.
</p>

<p>
    This can be observed in the next example. Note that:
</p>

<ul class="content">
    <li><code>colDef.filterParams.values</code> specifies the values for the set filter in a callback and introduces a 5 second delay
    <?= createSnippet(<<<SNIPPET
    filterParams: {
        values: function(params) {
            setTimeout(function() { params.success(['value 1', 'value 2']); }, 5000);
        }
    }
    SNIPPET
    ) ?>
    </li>
    <li>While the data is obtained (during the simulated 5s delay shown above), the <code>setFilter</code> will show a loading message</li>
    <li>
        The loading message can be configured: check our
        <a href="../javascript-grid-localisation/">localisation docs</a>. The key for this string is
        <code>loadingOoo</code>.</li>
    <li>The callback is only invoked the first time the filter is opened. The next time the filter is opened
    the values are not loaded again.</li>
</ul>

<?= grid_example('Callback/Async', 'callback-async', 'generated', ['enterprise' => true, 'exampleHeight' => 510]) ?>

<h2>Sorting And Formatting Set Filter Values List</h2>

<p>
    Values inside a set filter will be sorted by their string value by default. If you want a different sort
    order than the natural string sort order, you need to provide a comparator.
</p>

<p>
    The example below shows sorting on the Age columns. The Age column is repeated with one difference: the
    first instance has a comparator, the second does not. The second version has the numbers ordered by the
    default string ordering which is not correct (i.e. the sequence is <code>0,1,10,11,2</code> instead of <code>0,1,2,3...</code>).
</p>

<p>
    It also shows the Athlete column using a text formatter so that <code>'o'</code> will match <code>'Bj&oslash;rn'</code> in the mini filter. You
    can check this by searching for <code>'bjo'</code> in the mini-filter box.
</p>

<?= grid_example('Set Filter Comparator', 'set-filter-comparator', 'generated', ['enterprise' => true]) ?>

<h2>Set Filter Values with Live Data</h2>

<p>
    The set filter will refresh its values after any of the following:

    <ol>
        <li>
            <a href="../javascript-grid-cell-editing">Editing the data</a> (e.g. through the grid UI)
        </li>
        <li>
            Updating the data using <a href="../javascript-grid-data-update/#transactions">Transaction Updates</a>
        </li>
        <li>
            Updating the data using <a href="../javascript-grid-data-update/#delta-row-data">Delta Row Mode</a>
        </li>
    </ol>
</p>

<p>
    The strategy for updating filter values after the data updates mimics how similar filters in spreadsheets work.
    The rules for the update are as follows:
</p>

<ul>
    <li>
        When no filter is active, everything in the filter is selected. Adding and removing values
        will keep the list updated with everything selected.
    </li>
    <li>
        When a filter is active, new items (either new data into the grid, or edits to current data
        with new values not previously seen) will be added to the filter but will not be selected.
    </li>
</ul>

<p>
    This will be somewhat strange when editing data as filtering does not re-execute when editing,
    so the row will not be filtered out even if the value in the cell is not selected in the filter.
</p>

<p>
    If you do not want the set filter to update its list of values when the data changes,
    set <code>suppressSyncValuesAfterDataChange = true</code>. This will mean the filter
    will be out of date (i.e. a new value created after edit will be missing from the filter)
    and it is up to the application how it wishes for the filter to update. This is to handle
    some users having different requirements to the default handling, some of which are
    presented below.
</p>

<p>
    The example below shows different approaches on handling data changes for set filters.
    The first columns has no special handling, so values in the set filter stay in sync
    automatically with the grid's rows. All other rows have <code>suppressSyncValuesAfterDataChange = true</code>
    and demonstrate different application strategies for keeping the filter in sync.
    To understand the example it's best to test one column at a time, and once finished with one column,
    refresh the example and try another column to notice the difference.
    From the example, the following can be noted:
</p>

<ul class="content">
    <li>
        All columns have set filter with different responses to data changing.
    </li>
    <li>
        All columns have their filters initialised when the grid is loaded
        by calling <code>getFilterInstance()</code> when the <code>gridReady</code> event
        is received. This means when you edit, the filter is already created and loaded with
        values for the grid's row data.
    </li>
    <li>
        Column 1 has no special handling of new values. Updates to column 1 will
        be reflected in the filter keeping the filter automatically in sync.
    </li>
    <li>
        Column 2 has <code>suppressSyncValuesAfterDataChange = true</code> and no special handling,
        so updates to column 2 will have no effect on the filter. The filter list will become stale.
    </li>
    <li>
        Column 3 has <code>suppressSyncValuesAfterDataChange = true</code> and after an update:
        a) updates the filter.
    </li>
    <li>
        Column 4 has <code>suppressSyncValuesAfterDataChange = true</code> and after an update:
        a) updates the filter, and b) makes sure the new value is selected.
    </li>
    <li>
        Column 5 has <code>suppressSyncValuesAfterDataChange = true</code> and after an update:
        a) updates the filter, b) makes sure the new value is selected,
        and c) refreshes the rows based on the new filter value. For example, if you first set the filter
        on Column 5 to 'A' (notice that 'B' rows are removed), then change a value from 'A' to 'B', then
        the other rows that were previously removed are added back in again.
    </li>
    <li>
        Click 'Add C Row' to add a new row. Columns 2 and 3 will not have their filters updated.
        Column 1 will have its filter updated by the grid.
        Columns 4 and 5 will have their filters updated by the application.
    </li>
</ul>

<?= grid_example('Refresh After Edit', 'refresh-after-edit', 'generated', ['enterprise' => true]) ?>

<h2>Example: New Rows Action and Values</h2>

<p>
    Below demonstrates using the <a href="../javascript-grid-filter-provided/#providedFilterParams">New Rows Action</a> and Values.
    The example is not meant to make business sense, it just demonstrates the filters with random unrelated data.
    The example has the columns configured as follows:
</p>

<ul class="content">
    <li>Fruit - Normal</li>
    <li>Animal - Using <code>newRowsAction = 'keep'</code></li>
    <li>Color - Using <code>values</code></li>
    <li>Location - Using <code>values</code> and <code>newRowsAction = 'keep'</code></li>
</ul>
<p>
    The 'Set New Data' button updates the grid with new data. It is suggested you set the filters and then
    observe what happens when you hit 'Set New Data'.
</p>

<note>
    Although the example works, it demonstrates a dangerous situation, which is mixing <code>newRowsAction = 'keep'</code> without
    providing values. If you do not provide values, the grid will create the values for
    you based on the data inside the grid (which is normally great). The problem is that when new values enter the
    grid, if the set of values is different, this makes it impossible for the grid to keep the same filter
    selection, so <code>newRowsAction = 'keep'</code> breaks down. In this situation, the grid
    will keep the same selected values, but it will lose information about previously selected values that
    no longer exist in the new set.
</note>

<?= grid_example('Set Filter New Rows', 'set-filter-new-rows', 'generated', ['enterprise' => true]) ?>

<h2>Set Filter Model</h2>

<p>
    Get and set the state of the set filter by getting and setting the model on the filter instance.
</p>

<?= createSnippet(<<<SNIPPET
// get filter instance (Note - React users must use the async version
// of this method by passing a callback parameter)
var countryFilterComponent = gridOptions.api.getFilterInstance('country');

// get filter model
var model = countryFilterComponent.getModel();

// set filter model and update
countryFilterComponent.setModel({
    type: 'set',
    values: ['Spain', 'Ireland', 'South Africa', 'Australia', 'England']
});

gridApi.onFilterChanged();
SNIPPET
) ?>

<p>
    The filter model contains an array of string values where each item in the array corresponds to an
    element to be selected from the set.
</p>

<h2>Set Filter API</h2>

<p>
    The set filter has the following API (in addition to the <a href="../javascript-grid-filter-provided/#providedFilterApi">API</a> common to all provided filters):
</p>

<?php createDocumentationFromFile('setFilter.json', 'api') ?>

<p>
    It is important to note that when updating the set filter through the API, it is up to the developer to call
    <code>filterInstance.applyModel()</code> to apply the changes that have been made to the model and then
    <code>gridOptions.api.onFilterChanged()</code> at the end of the interaction with the filter.
</p>
<p>
    If no call is made to <code>filterInstance.applyModel()</code> then the filter UI will show the changes, but
    it won't be reflected in the filter model. This will appear as if the user never hit the Apply button (regardless
    of whether the Apply button is active or not).
</p>
<p>
    If no call to <code>gridOptions.api.onFilterChanged()</code> is provided the grid will still show the data relevant to the filter
    before it was updated through the API.
</p>

<p>This code demonstrates a correct update:</p>

<?= createSnippet(<<<SNIPPET
// Get filter instance
var instance = gridOptions.api.getFilterInstance('athlete');

// Set filter properties
instance.selectNothing();
instance.selectValue('John Joe Nevin');
instance.selectValue('Kenny Egan');

// Apply the model
instance.applyModel();

// Get the grid to refresh the rows based on new filter
gridOptions.api.onFilterChanged();
SNIPPET
) ?>

<p>
    In the example below, you can see how the filter for the Athlete column is modified through the API and how at the
    end of the interaction a call to <code>gridOptions.api.onFilterChanged()</code> is performed.
</p>

<?= grid_example('Set Filter API', 'set-filter-api', 'generated', ['enterprise' => true, 'exampleHeight' => 570]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
