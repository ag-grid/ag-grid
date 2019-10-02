<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Set Filter</h1>

    <p class="lead">
        Set filters allow you to filter on set data, influenced by how filters work in Microsoft Excel.
        The page <a href="../javascript-grid-filter-provided/">Provided Filters</a> explains the common
        parts of all provided filters. This page builds on that and explains some  details that are specific
        to the set filter.
    </p>

    <? enterprise_feature("Set Filter"); ?>

    <h2>Set Filter Parameters</h2>


<p>
    The set filter params are as follows:
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
        <td class="parameter-key">applyButton<br/>clearButton<br/>debounceMs<br/>newRowsAction</td>
        <td>See <a href="../javascript-grid-filter-provided/#providedFilterParams">Provided Filter Params</a>.</td>
    </tr>
    <tr>
        <td class="parameter-key">cellHeight</td>
        <td>
            The height of the cell.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">cellRenderer</td>
        <td>
            Similar to the cell renderer for the grid (you can use the same one in both locations).
            Setting it separately here allows for the value to be rendered differently in the filter. Note that
            the cell renderer for the set filter only receives the value as a parameter, as opposed to the cell renderer
            in the colDef that receives more information.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">values</td>
        <td>
            The values to display in the filter. If this is not set, then the filter will
            takes its values from what is loaded in the table. Setting it allows you to set values where a) the
            value may not be present in the list (for example, if you want to show all states in America so
            that the user is not confused by missing states, even though states are missing from the data set
            in the grid) and b) the list is not available (happens when doing server side filtering in pagination
            and infinite scrolling).
        </td>
    </tr>
    <tr>
        <td class="parameter-key">suppressSyncValuesAfterDataChange</td>
        <td>
            Set to true to have the values inside the set filter NOT refresh after values are changed inside
            the grid.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">suppressRemoveEntries</td>
        <td>
            Set to true to stop the filter from removing values that are no
            longer available (like what Excel does).
        </td>
    </tr>
    <tr>
        <td class="parameter-key">comparator(a,b)</td>
        <td>
            <p>
                Comparator for sorting. If not provided, the colDef comparator is used. If colDef
                also not provided, the default (agGrid provided) comparator is used.
            </p>
            <p>
                The comparator for a set filter is only provided the values as the first two parameters, whereas the comparator for the colDef
                is also provided the row data as additional parameters. This is because when sorting rows, row data exists. For example,
                take 100 rows split across the color values [white, black]. The colDef comparator will be sorting 100 rows, however the
                filter will be only sorting two values.
            </p>
            <p>
                If you are providing a comparator that depends on the row data, and you are using set filter, be sure to provide
                the set filter with an alternative comparator that doesn't depend on the row data.
            </p>
        </td>
    </tr>
    <tr>
        <td class="parameter-key">suppressSorting</td>
        <td>
            If true, sorting will not be done on the set filter values. Use this if providing
            your own values and don't want them sorted as you are providing in the order you want.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">suppressMiniFilter</td>
        <td>
            Set to true to hide the mini filter.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">suppressSelectAll</td>
        <td>
            Set to true to remove the "select all" checkbox.
        </td>
    </tr>
    <tr>
        <td class="parameter-key">textFormatter</td>
        <td>
            If specified, formats the text before applying the mini filter compare logic, useful for
            instance if substituting accentuated characters or if you want to do case sensitive mini filtering. This
            matches the <a href="../javascript-grid-filter-text/index.php#textFormatter">text formatter used for text filters</a>.
        </td>
    </tr>
</table>

    <h2>Complex Objects - keyCreator</h2>

    <p>
        If you are providing complex objects as values, then you need to provide a <code>colDef.keyCreator</code> function
        to convert the objects to strings. This string is used to compare objects when filtering, and to render a label in
        the filter UI, so it should return a human-readable value. The example below demonstrates keyCreator with the country
        column by replacing the country name in the data with a complex object of country name and code. If the keyCreator
        was not provided on the colDef, the set filter would not work.
    </p>

    <h2>Set Filter - Search Field</h2>

    <p>
        The text box in the set filter is to allow filtering of displayed filter items, but doesn't actually change the
        applied filter.</p><p>The expected flow when using the search box would be uncheck "Select All", type what you're after
        in the search box and then finally select the filter entries you want to actually filter on.
    </p>

    <h2>Set Filters Example</h2>

    <p>
        The example below demonstrates the set filter.
        Notice that the athlete column is given the set of filters, providing some filter options for which
        no corresponding rows exist - this can be used if you are missing items in what would otherwise be
        a complete list, if listing days of the week, and no data for Wednesday exists, then presenting
        the filter to the user could give the impression that the filter is broken because it is missing
        Wednesday as an option.
    </p>

    <p>
        The example also demonstrates using the <code>ag-header-cell-filtered</code> class, which is applied to the header
        cell when the header is filtered. By default, no style is applied to this class, the example shows
        applying a different color background to this style.
    </p>

    <p>
        The column sport has also the property <code>suppressMiniFilter</code> set to true, hiding the text input box for the
        set filter in this column (compare this set filter with athlete which suppressMiniFilter is the default = false).
    </p>

    <p>
        The column athlete has a debounce of 1000ms before the selected options are filtered out
    </p>

    <?= example('Set Filter', 'set-filter', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Asynchronous Values</h2>

    <p>
        In addition to being able to specify a hardcoded list of values for your setFilter, you can provide a callback
        to load the values asynchronously. The callback receives a parameter object. The interface for this parameter object
        is like this:
    <p>
<snippet>
export interface SetFilterValuesFuncParams {
    // The function to call with the values to load for the filter once that they are ready
    success: (values: string[])=>void;
    // The column definition object from which the set filter is invoked
    colDef: ColDef,
}</snippet>
        a <code>success</code> callback function that you can callback as soon as the values for the setFilter are ready.
    </p>

    <p>
        This can be observed in the next example. Note that:

    </p>

        <ul class="content">
            <li><code>colDef.filterParams.values</code> specifies the values for the set filter in a callback and introduces a 5 second delay
<snippet>
filterParams: {
    values: (params)=>{
        setTimeout(()=>{
            params.success(['value 1', 'value 2'])
        }, 5000)
    }
}</snippet>
</li>

            <li>While the data is obtained, (the 5s delay), the setFilter is showing a loading message</li>
            <li>The loading message can be configured, check our <a href="../javascript-grid-internationalisation/">
                    internationalisation docs</a>. The key for this string is <code>loadingOoo</code></li>
            <li>The callback is only invoked the first time the filter is opened. The next time the filter is opened
            the values are not loaded again.</li>
        </ul>

    <?= example('Callback/Async', 'callback-async', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Sorting And Formatting Set Filter Values List</h2>

    <p>
        Values inside a set filter will be sorted by their string value by default. If you want a different sort
        order than the natural string sort order, you need to provide a comparator.
    </p>

    <p>
        The example below shows sorting on the age columns. The age column is repeated with one difference, the
        first instance has a comparator, the second has not. The second iteration has the numbers ordered by the
        default string ordering which is not correct (ie the sequence is 0,1,10,11,2 instead of 0,1,2,3...).
    </p>

    <p>
        It also shows the athlete column using a text formatter so that 'o' will match 'Bj&oslash;rk' in the mini filter. You
        can check this by searching for 'bjo'in the mini-filter box.
    </p>

    <?= example('Set Filter Comparator', 'set-filter-comparator', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Refresh After Edit or Transcation Update</h2>

    <p>
        The set filter will refresh it's values after you
        a) <a href="../javascript-grid-cell-editing">edit the data</a> (eg through the grid UI) or 2) update
        the data using <a href="../javascript-grid-data-update/#transactions">Transaction Updates</a>.
    </p>

    <p>
        The strategy for updating values after update mimics how similar filters in spreadsheets work.
        The rules for the update are as follows:
    </p>

    <ul>
        <li>
            When no filter is active, everything in the filter is selected. Adding and removing values
            will keep the list updated with everything selected.
        </li>
        <li>
            When a filter is active, new items (either new data into the grid, or edits to current data
            with new values not previously seen) will get added to the filter but will not be selected.
            This will be somewhat strange as the row will not be filtered out even though the value in the
            cell is not selected in the filter.
        </li>
    </ul>

    <p>
        If you do not want the set filter to update it's list of values after the data changes,
        then set <code>suppressSyncValuesAfterDataChange=true</code>. This will mean the filter
        will be out of date (ie a new value created after edit will be missing from the filter)
        and it is up to the application how it wishes for the filter to update. This is to handle
        some users having different requirements to the default handling, some of which are
        presented in the example below.
    </p>

    <p>
        The example below shows different approaches on handling data changes for set filters.

        The first columns has no special handling, thus values in the set filter stay in sync
        automatically with the grids rows. All other rows have <code>suppressSyncValuesAfterDataChange=true</code>
        and demonstrate different application strategies for keeping the filter in sync.
        To understand the example it's best test one column at a time - once finished with that column,
        refresh the example and try another column and notice the difference.
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
                get reflected in the filter keeping the filter automatically in sync.
            </li>
            <li>
                Column 2 has <code>suppressSyncValuesAfterDataChange=true</code> and no special handling,
                so updates to column 2 will have no effect on the filter. The filter list will become stale.
            </li>
            <li>
                Column 3 has <code>suppressSyncValuesAfterDataChange=true</code> and after an update:
                a) gets the filter to update.
            </li>
            <li>
                Column 4 has <code>suppressSyncValuesAfterDataChange=true</code> and after an update:
                a) gets the filter to update and b) makes sure the new value is selected.
            </li>
            <li>
                Column 5 has <code>suppressSyncValuesAfterDataChange=true</code> and after an update:
                a) gets the filter to update and b) makes sure the new value is selected
                and c) refreshes the rows based on the new filter value. So for example if you first set the filter
                on Col 4 to 'A' (notice that 'B' rows are removed), then change a value from 'A' to 'B', then
                the other rows that were previously removed are added back in again.
            </li>
            <li>
                Click 'Add C Row' to add a new row. Columns 2 and 3 will not have their filters updated.
                Column 1 will have it's filter updated by the grid.
                Columns 4 and 5 will have their filters updated by the application.
            </li>
        </ul>

    <?= example('Refresh After Edit', 'refresh-after-edit', 'generated', array("enterprise" => 1, "processVue" => true)) ?>


    <h2>New Rows Action and Values Example</h2>

    <p>
        Below demonstrates using New Rows Action and Values. The example is not meant to make business sense,
        it just demonstrates the filters with random unrelated data. The example has the columns configured
        as follows:
    </p>

    <ul class="content">
        <li>Column Fruit - Normal</li>
        <li>Column Animal - Using newRowsAction = Keep</li>
        <li>Column Color - Using values</li>
        <li>Column Location - Using values and using newRowsAction = Keep</li>
    </ul>
    <p>
        The 'Set New Data' button sets new data into the grid. It is suggested you set the filters and then
        observe what happens when you hit 'Set New Data'.
    </p>

    <note>
        Although the example works, it demonstrates one dangerous situation, which is mixing newRowsAction=keep without
        providing values. This is dangerous and if you do not provide values, then the grid will create the values for
        you based on the data inside the grid (which is normally great). The problem is that when new values enter the
        grid, if the set of values is different, then this makes it impossible for the grid to keep the same filter
        selection. If the set of values is different, then newRowsAction=keep breaks down. In this situation, the grid
        will keep the same selected values, however it will loose information about previously selected values that
        no longer exist in the new set.
    </note>

    <?= example('Set Filter New Rows', 'set-filter-new-rows', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Set Filter Model</h2>

    <p>
        Get and set the state of the set filter by getting and setting the model on the filter instance.
    </p>


<snippet>
// get filter instance
var countryFilterComponent = gridOptions.api.getFilterInstance('country');

// get filter model
var model = countryFilterComponent.getModel();

// OR set filter model and update
countryFilterComponent.setModel({
    type: 'set',
    values: ['Spain','Ireland','South Africa','Australia','England']
});
gridApi.onFilterChanged()</snippet>


    <p>
        The filter model contains an array of string values where each item in the array corresponds to an
        element to be selected from the set:
    </p>

    <h2>Set Filter API</h2>
    <p>
        The set filter has on top of the getModel and setModel methods common to all the filters the following API:
    </p>
    <ul class="content">
        <li><b>setMiniFilter(newMiniFilter)</b>: Sets the filter at the top of the filter (the 'quick search' in the popup)</li>
        <li><b>getMiniFilter()</b>: Gets the mini filter text.</li>
        <li><b>selectEverything()</b>: Selects everything</li>
        <li><b>selectNothing()</b>: Clears the selection</li>
        <li><b>isFilterActive()</b>: Returns true if anything except 'everything selected'</li>
        <li><b>unselectValue(value)</b>: Unselects a value</li>
        <li><b>selectValue(value)</b>: Selects a value</li>
        <li><b>isValueSelected(value)</b>: Returns true if a value is selected</li>
        <li><b>isEverythingSelected()</b>: Returns true if everything selected (inverse of isFilterActive())</li>
        <li><b>isNothingSelected()</b>: Returns true if nothing is selected</li>
        <li><b>getUniqueValueCount()</b>: Returns number of unique values. Useful for iterating with getUniqueValue(index)</li>
        <li><b>getUniqueValue(index)</b>: Returns the unique value at the given index</li>
        <li><b>setFilterValues(arrayOfStringOptions)</b>: Useful if you want to change on the fly the available options
        <li><b>resetFilterValues()</b>: Useful if you want to rebuild the filter options based on the underlying data</li>
        <li><b>setLoading(loading)</b>: Useful if you want to show/hide the loading overlay in the set filter.</li>
        <li><b>applyModel()</b>: Applies the model from the UI.</li>
    </ul>

    <p>
        Is important to note that when updating the set filter through the API is up to the developer to call
        <code>filterInstance.applyModel()</code> and then
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

    <snippet>
// Example - Interacting with Set Filter

// Get filter instance
var instance = gridOptions.api.getFilterInstance('athlete');

// Set filter properties
instance.selectNothing();
instance.selectValue('John Joe Nevin');
instance.selectValue('Kenny Egan');

// Apply the model.
instance.applyModel();

// Get the grid to refresh the rows based on new filter
gridOptions.api.onFilterChanged();
    </snippet>

    <p>
        In the example below, you can see how the filter for the Athlete column is modified through the API and how at the
        end of the interaction a call to <code>gridOptions.api.onFilterChanged()</code> is performed.
    </p>

    <?= example('Set Filter API', 'set-filter-api', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

<?php include '../documentation-main/documentation_footer.php';?>
