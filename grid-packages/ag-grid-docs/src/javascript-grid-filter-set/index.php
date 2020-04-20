<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter</h1>

<p style="color: red; text-align: center; font-size: x-large">--- This page is a work in progress ---</p>

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
    The Set Filter is composed of the following sections:
</p>

<p>
    <ul class="content">
        <li><b>Mini Filter</b>: used to narrow the filter list and perform filtering in the grid (by hitting the 'Enter' key).</li>
        <li><b>Select All</b>: used to perform grid filtering on all selected / deselected values shown in the filter list.</li>
        <li><b>Filter List</b>: a list of set filter values which can be selected / deselected to perform grid filtering.</li>
        <li><b>Filter Buttons</b>: filter buttons can be optionally added to the bottom of the Set Filter.</li>
    </ul>
</p>


<h2>Enabling Set Filters</h2>

<p>
    The Set Filter is the default filter used in the Enterprise version of the grid, however it can also be explicitly
    configured as shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    columnDefs: [
        {
            field: 'country',
            filter: true // Set Filter used by default in Enterprise version
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
    The following example demonstrates how Set Filters can be enabled. Note the following:
</p>

<ul class="content">
    <li>The <b>Athlete</b> column has <code>filter=true</code> which defaults to the Set Filter as this example is using the
        Enterprise version of the grid.</li>
    <li>The <b>Country</b> column is explicitly configured to use the Set Filter using <code>filter='agSetColumnFilter'</code>.</li>
    <li>All other columns are configured to use the number filter using <code>filter='agNumberColumnFilter'</code>.</li>
    <li>Filters can be accessed from the <a href="../javascript-grid-column-menu/">Column Menu</a> or by clicking
        on the filter icon in the <a href="../javascript-grid-floating-filters/">Floating Filters</a>.</li>
</ul>

<?= grid_example('Enabling Set Filters', 'enabling-set-filters', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter']]) ?>

<h2>Sorting Filter Values</h2>

<p>
    Values inside a set filter will be sorted by default, where the values are converted to a string value and sorted in
    ascending order according to their UTF-16 codes.
</p>

<p>
    When a different sort order is required, a comparator can be supplied to the <code>filterParams</code>, as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{     
    field: 'age',
    filter: 'agSetColumnFilter',
    filterParams: {
        comparator: function(a, b) {
            var valA = parseInt(a);
            var valB = parseInt(b);
            if (valA === valB) return 0;
            return valA > valB ? 1 : -1;
        }
    }
}
SNIPPET
    , 'ts') ?>

<p>
    The following example demonstrates sorting set filter values using a comparator. Note the following:
</p>

<ul class="content">
    <li>The <b>Age (No Comparator)</b> set filter values are sorted using the default string order; <code>1,10,100,...</code></li>
    <li>The <b>Age (With Comparator)</b> set filter has a custom comparator supplied in the <code>filterParams</code>
        that sorts the ages by value; <code>1,2,3,...</code></li>
</ul>

<?= grid_example('Sorting Set Filter Values', 'sorting-set-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720, 'modules' => ['clientside', 'setfilter']]) ?>

<h2>Providing Filter Values</h2>

<p>The Set Filter will obtain the filter values from the row data by default. However it is also possible to provide
    values, either synchronously or asynchronously, to the filter list.
</p>

<h3>Synchronous Values</h3>

<p>The simplest approach is to supply a list of values to <code>filterParams.values</code> as shown below:</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{      
    field: 'days',
    filter: 'agSetColumnFilter',
      filterParams: {
        // provide weekdays only!
        values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    }
}
SNIPPET
    , 'ts') ?>

<p>
    Note that if there are missing values in the row data, the filter list will display all provided values. This could
    give users the impression that filtering is broken.
</p>

<p>
    The following example demonstrates providing filter values using <code>filterParams.values</code>. Note the following:
</p>

<ul class="content">
    <li>
        The <b>Days (Values Not Provided)</b> set filter obtains values from the row data to populate the filter list and as
        <code>'Saturday'</code> and <code>'Sunday'</code> are not present in the data they don't appear in the filter list.
    </li>
    <li>
        The <b>Days (Values Provided)</b> set filter is supplied it's filter list values <code>filterParams.values</code>.
        As all days are supplied the filter list also contains <code>'Saturday'</code> and <code>'Sunday'</code>.
    </li>
    <li>
        Both filter lists are sorted using a <a href="../javascript-grid-filter-set/#sorting-filter-values">Custom Sort Comparator</a>.
    </li>
</ul>

<?= grid_example('Providing Filter Values', 'providing-filter-values', 'generated', ['enterprise' => true, 'exampleHeight' => 720, 'modules' => ['clientside', 'setfilter']]) ?>

<h3>Asynchronous Values</h3>

<p style="color: red; text-align: center; font-size: x-large">--- This section should be improved ---</p>

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
    <li><code>colDef.filterParams.values</code> specifies the values for the set filter in a callback and introduces a 3 second delay
<?= createSnippet(<<<SNIPPET
filterParams: {
    values: function(params) {
        setTimeout(function() { params.success(['value 1', 'value 2']); }, 3000);
    }
}
SNIPPET
        ) ?>
    </li>
    <li>While the data is obtained (during the simulated 3s delay shown above), the <code>setFilter</code> will show a loading message</li>
    <li>
        The loading message can be configured: check our
        <a href="../javascript-grid-localisation/">localisation docs</a>. The key for this string is
        <code>loadingOoo</code>.</li>
    <li>The callback is only invoked the first time the filter is opened. The next time the filter is opened
        the values are not loaded again.</li>
</ul>

<?= grid_example('Callback/Async', 'callback-async', 'generated', ['enterprise' => true, 'exampleHeight' => 510]) ?>

<h2>Data Updates</h2>

<p>
    The following sections cover how data updates affect the Set Filter's filter values.
</p>

<h3>Cell Editing</h3>

<p>
    Filter values will be refreshed when data is updated through <a href="../javascript-grid-cell-editing">Cell Editing</a>.
</p>

<p>
    Here are the rules that determine how filter values are selected:
</p>

<ul class="content">
    <li><b>No Active Filters</b>: all filter values, including new values, will be selected.</li>
    <li><b>Active Filters</b>: previous selections will remain intact but new values will not be selected.</li>
</ul>

<p>
    Cell Editing does not re-execute filtering by default, so the row will not be filtered out even though the value in
    the cell is not selected in the filter. This default behaviour mimics how Excel works.
</p>

<p>
    To execute filtering on cell edits, listen to <code>CellValueChanged</code> events and trigger filtering as shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    onCellValueChanged: function(params) {
        // trigger filtering on cell edits
        params.api.onFilterChanged();
    }
    // other options
}
SNIPPET
    , 'ts') ?>

<p>
    The following example demonstrates cell editing with the Set Filter. Try the following:
</p>

<p><b>Without selecting any filter values:</b></p>
<ul class="content">
    <li>
        Change (Cell Edit) a <code>'B'</code> cell value to <code>'X'</code> and note it gets added to the filter list and is
        <b>selected</b>.
    </li>
</ul>

<p><b>Click 'Reset' and deselect 'C' in the Filter List:</b></p>
<ul class="content">
    <li>
        Change (Cell Edit) a <code>'B'</code> cell value to <code>'X'</code> and notice it gets added to the filter list
        but it is <b>not selected</b>.
    </li>
    <li>
        Note that although <code>'X'</code> is not selected in the filter the row still appears in the grid. This is
        because grid filtering is not triggered for cell edits.
    </li>
</ul>


<?= grid_example('Cell Editing Updates', 'cell-editing-updates', 'generated', ['enterprise' => true, 'exampleHeight' => 480, 'modules' => ['clientside', 'setfilter']]) ?>


<h3>Transaction Updates</h3>

<p>
    Filter values are refreshed when data is updated using <a href="../javascript-grid-data-update/#transactions">Transaction Updates</a>
    and <a href="../javascript-grid-data-update/#delta-row-data">Delta Row Mode</a>.
</p>

<p>
    Here are the rules that determine how filter values are selected:
</p>

<ul class="content">
    <li><b>No Active Filters</b>: all filter values, including new values, will be selected.</li>
    <li><b>Active Filters</b>: previous selections will remain intact but new values will not be selected.</li>
</ul>

<p>
    Unlike <a href="../javascript-grid-cell-editing">Cell Editing</a>, transaction updates will execute filtering in the grid.
</p>

<p>
    The following example demonstrates these rules. Try the following:
</p>

<p><b>Without selecting any filter values:</b></p>
<ul class="content">
    <li>
        Click <b>Update First Displayed Row</b>: this calls <code>api.updateRowData()</code> and updates the value in the
        first row. Note <code>'AX'</code> now appears in the filter list and is <b>selected</b>.
    </li>
    <li>
        Click <b>Add New 'D' Row</b>: this calls <code>api.updateRowData()</code> and adds a new row to the grid. Note
        <code>'D'</code> has been added to the filter list and is <b>selected</b>.
    </li>
</ul>

<p><b>Click 'Reset' and deselect 'C' in the Filter List:</b></p>
<ul class="content">
    <li>
        Click <b>Update First Displayed Row</b>: this calls <code>api.updateRowData()</code> and updates the value in the
        first row. Note <code>'AX'</code> now appears in the filter list and is <b>not selected</b>.
    </li>
    <li>
        Note that as <code>'AX'</code> is unselected in the filter list it has also been filtered out of the grid. This is
        because transaction updates also triggers grid filtering.
    </li>
    <li>
        Click <b>Add New 'D' Row</b>: this calls <code>api.updateRowData()</code> and adds a new row to the grid. Note
        <code>'D'</code> has been added to the filter list and is <b>not selected</b>.
    </li>
</ul>


<?= grid_example('Cell Edits & Transaction Updates', 'cell-edits-and-tx-updates', 'generated', ['enterprise' => true, 'exampleHeight' => 480, 'modules' => ['clientside', 'setfilter']]) ?>

<h3>Set Row Data</h3>

<p style="color: red; text-align: center; font-size: x-large">--- This section should be improved ---</p>

<p>
    By default, when <code>api.setRowData()</code> is called the selection state will be reset. If the selected filter
    items need to be kept use <code>filterParams.newRowsAction = 'keep'</code>.
</p>

<?= grid_example('Set Row Data', 'set-row-data', 'generated', ['enterprise' => true, 'exampleHeight' => 500, 'modules' => ['clientside', 'setfilter']]) ?>


<h2>Filter List Formatting</h2>

<p>
    This section covers the various ways to format filter list items.
</p>

<h3>Cell Renderer</h3>

<p>
    Similar to the cell renderer for the grid (you can use the same one in both locations). Setting it separately here
    allows for the value to be rendered differently in the filter. Note that the cell renderer for the set filter only
    receives the value as a parameter, as opposed to the cell renderer in the colDef that receives more information.
</p>


<?= createSnippet(<<<SNIPPET
{
    field: 'year',         
    filter: 'agSetColumnFilter',
    filterParams: {
        cellRenderer: function (params) {
            //get flags from here: http://www.freeflagicons.com/
            if (params.value === "" || params.value === undefined || params.value === null) {
                return '';
            } else {
                var flag = '<img class="flag" border="0" width="15" height="10" 
                src="https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png">';
                return flag + ' ' + params.value;
            }
        }
    }
}
SNIPPET
    , 'ts') ?>


<?= grid_example('Filter List Cell Renderers', 'filter-list-cell-renderers', 'generated', ['enterprise' => true, 'exampleHeight' => 520, 'modules' => ['clientside', 'setfilter']]) ?>


<p style="color: red; text-align: center; font-size: x-large">--- Ignore sections below ---</p>


<h3>Complex Objects</h3>

<p>
    If you are providing complex objects as values, then you need to provide a <code>colDef.keyCreator</code> function
    to convert the objects to strings. This string is used to compare objects when filtering, and to render a label in
    the filter UI, so it should return a human-readable value.
</p>

<p>
    The example below demonstrates <code>keyCreator</code> with the country column by replacing the country name in the
    data with a complex object of country name and code. If the <code>keyCreator</code> was not provided on the
    <code>colDef</code>, the set filter would not work.
</p>

<h3>Text Formatter</h3>

<p>
    If specified, this formats the text before applying the mini filter compare logic, useful for instance if substituting
    accented characters or if you want to perform case-sensitive mini filtering. This matches the
    <a href='../javascript-grid-filter-text/#text-formatter'>text formatter used for text filters</a>.
</p>

<h3>Value Formatter</h3>



<h2>Suppressing Mini Filter</h2>



<h2>Displaying Long Values</h2>

<p>
    Sometimes the values being shown in the set filter may overflow the width of the popup. In this case they will be
    truncated automatically. If you want users to be able to see the full values, you can enable tooltips in the set
    filter by setting <code>showTooltips = true</code>. By default they will use the grid's tooltip component, and
    show the value that was truncated. If you wish, you can use a custom tooltip component as with other areas in
    the grid; see the <a href="../javascript-grid-tooltip-component/">tooltip component</a> section for more information.
</p>


<h3>Example: Displaying Long Values</h3>

<p>
    The following example demonstrates tooltips in the set filter. Note the following:
</p>

<ul>
    <li>All columns show how long values are truncated automatically.</li>
    <li>In the first column, tooltips in the set filter are disabled, so hovering over the truncated values has no effect.</li>
    <li>In the second column, tooltips in the set filter are enabled using the default grid tooltip component.</li>
    <li>In the third column, tooltips in the set filter are enabled using a custom tooltip component.</li>
</ul>

<?= grid_example('Displaying Long Values', 'displaying-long-values', 'generated', ['enterprise' => true]) ?>

<h2>Filter Value Updates</h2>

<p>
    The Set Filter will refresh its values when data is updated using any of following methods:

    <ul class="content">
        <li>
            <a href="../javascript-grid-cell-editing">Editing the data</a> (e.g. through the grid UI)
        </li>
        <li>
            Updating the data using <a href="../javascript-grid-data-update/#transactions">Transaction Updates</a>
        </li>
        <li>
            Updating the data using <a href="../javascript-grid-data-update/#delta-row-data">Delta Row Mode</a>
        </li>
    </ul>
</p>

<p>
    The rules for selecting filter values mimic Excel as data changes depend on the following:
</p>

<ul class="content">
    <li><b>No Active Filters</b>: all filter values are kept selected  adding and removing values will keep the list updated
        with everything selected.</li>
    <li>
        <b>Active Filters</b>: new items (either new data into the grid, or edits to current data
        with new values not previously seen) will be added to the filter but will not be selected.
    </li>
</ul>

<p>
    .
</p>


<p>

</p>

<p>
    This will be somewhat strange when editing data as filtering does not re-execute when editing,
    so the row will not be filtered out even if the value in the cell is not selected in the filter.
</p>


<h3>Example: Default Set Filter Value Behaviour</h3>

<p>
    The example has the columns configured as follows:
</p>

<ul class="content">
    <li>Fred</li>
</ul>

<?= grid_example('Default Set Filter Value Behaviour', 'set-filter-values-default', 'generated', ['enterprise' => true]) ?>


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

<ul class="content">
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


<h2>Set Filter - Search Field</h2>

<p>
    The text box in the set filter is to allow filtering of displayed filter items, but doesn't actually change the
    applied filter.
</p>
<p>
    The expected flow when using the search box would be uncheck "Select All", type what you're after
    in the search box and then finally select the filter entries you want to actually filter on.
</p>


<h2>Set Filter Parameters</h2>

<?php createDocumentationFromFile('setFilter.json', 'filterParams') ?>

<?php include '../documentation-main/documentation_footer.php';?>
