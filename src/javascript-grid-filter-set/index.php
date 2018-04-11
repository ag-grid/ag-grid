<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h1 class="heading-enterprise">Set Filter</h1>

    <p class="lead">
        A set filter, influenced by how filters work in Microsoft Excel. Set filters can be provided with
        additional options through the filterParams attribute.
    </p>

    <h2>Set Filter Parameters</h2>

    <p>
        An additional attribute on the column definition, filterParams, can be used to provide extra information to
        the set filter. Set the filterParams on the columnDefinition as follows:
    </p>

    <snippet>
columnDefinition = {
    headerName: "Athlete",
    field: "athlete",
    filter: 'agSetColumnFilter',
    filterParams: {cellRenderer: countryFilterCellRenderer, cellHeight: 20, values: ['A','B','C'], newRowsAction: 'keep'}
}</snippet>

    <p>
        The set filter params are specific to each filter and have the following meanings:
    </p>

    <ul class="content">
        <li><code>cellRenderer:</code> Similar to the cell renderer for the grid (you can use the same one in both locations).
            Setting it separately here allows for the value to be rendered differently in the filter. Note that
            the cell renderer for the set filter only receives the value as a parameter, as opposed to the cell renderer
            in the colDef that receives more information.
        </li>
        <li><code>cellHeight:</code> The height of the cell.</li>
        <li><code>values:</code> The values to display in the filter. If this is not set, then the filter will
            takes its values from what is loaded in the table. Setting it allows you to set values where a) the
            value may not be present in the list (for example, if you want to show all states in America so
            that the user is not confused by missing states, even though states are missing from the data set
            in the grid) and b) the list is not available (happens when doing server side filtering in pagination
            and infinite scrolling).</li>
        <li><code>newRowsAction:</code> What to do when new rows are loaded. The default is to reset the filter,
            as the set of values to select from can have changed. If you want to keep the selection, then
            set this value to 'keep'. This can be useful if you are using values (above) or otherwise know that the
            list to select from will not change. If the list does change, then it can be confusing what
            to do with new values into the set (should they be selected or not??).</li>
        <li><code>apply:</code> Set to true to include an 'Apply' button with the filter and not filter
            automatically as the selection changes.</li>
        <li><code>suppressRemoveEntries:</code> Set to true to stop the filter from removing values that are no
            longer available (like what Excel does).</li>
        <li><code>comparator(a,b):</code> Comparator for sorting. If not provided, the colDef comparator is used. If colDef
            also not provided, the default (agGrid provided) comparator is used.</li>
        <li><code>suppressSorting:</code> If true, sorting will not be done on the set filter values. Use this is providing
            your own values and don't want them sorted as you are providing in the order you want.</li>
        <li><code>suppressMiniFilter:</code> Set to false(default)/true to show/hide the input text box to filter the set
            entries displayed in the filter .</li>
        <li><code>selectAllOnMiniFilter:</code> Set to false(default)/true so that the checkbox "select all" applies to:
            all the filters items/just the ones filtered by the mini filter . </li>
        <li><code>textFormatter:</code> If specified, formats the text before applying the mini filter compare logic, useful for
            instance if substituting accentuated characters or if you want to do case sensitive mini filtering. This
            matches the <a href="../javascript-grid-filter-text/index.php#textFormatter">text formatter used for text filters</a></li>
        <li><code>debounceMs:</code> If specified, the filter will wait this amount of ms after the user stops selecting optoins in the
            mini filter before is triggered. If not specified there won't be any debounce.</li>
    </ul>

    <note>
        The comparator for a set filter is only provided the values as the first two parameters, whereas the comparator for the colDef
        is also provided the row data as additional parameters. This is because when sorting rows, row data exists. For example,
        take 100 rows split across the colors {white,black}. The colDef comparator will be sorting 100 rows, however the
        filter will be only sorting two values.
        <br/>
        If you are providing a comparator that depends on the row data, and you are using set filter, be sure to provide
        the set filter with an alternative comparator that doesn't depend on the row data.
    </note>

    <h2>Complex Objects - keyCreator</h2>

    <p>
        If you are providing complex objects as values, then you need to provide <code>colDef.keyCreator</code> method in your
        object for the set filter to work, giving a unique value for the object. This is because the set filter needs
        a string key to identify the value. The example below demonstrates keyCreator with the country column by replacing
        the country name in the data with a complex object of country name and code. If the keyCreator was not provided
        on the colDef, the set filter would not work.
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
        The column country has the property <code>selectAllOnMiniFilter</code> set to true, you can see how the select all only
        applies to the items filtered by the mini filter search box.
    </p>

    <p>
        The column athlete has a debounce of 1000ms before the selected options are filtered out
    </p>

    <?= example('Set Filter', 'set-filter', 'generated', array("enterprise" => 1)) ?>

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

    <?= example('Callback/Async', 'callback-async', 'generated', array("enterprise" => 1)) ?>

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

    <?= example('Set Filter Comparator', 'set-filter-comparator', 'generated', array("enterprise" => 1)) ?>

    <h2>Refresh After Edit</h2>

    <p>
        The set filter does NOT refresh after you edit the data. If the data is changing and you want the
        set filter values to also change, it is up to your application to get the filter to change.
    </p>

    <p>
        The grid does not update the filters for you as the as there are two many use cases that
        are open to different interpretation. For example, different users will have different requirements
        on how to hand new values or how to handle row refresh (eg if a filter is active, should the data
        be filtered again after the value is added).
    </p>

    <p>
        The example below shows different approaches on handling data changes for set filters.
        From the example, the following can be noted:
    </p>
        <ul class="content">
            <li>
                All 4 columns have set filter with different responses to data changing.
            </li>
            <li>
                All four columns have their filters initialised when the grid is loaded
                by calling <code>getFilterInstance()</code> when the <code>gridReady</code> event
                is received. This means when you edit, the filter is already created.
            </li>
            <li>
                Column 1 has no special handling of new values.
            </li>
            <li>
                Column 2 after an update: a) gets the filter to update.
            </li>
            <li>
                Column 3 after an update: a) gets the filter to update and b) makes sure the new value is selected.
            </li>
            <li>
                Column 4 after an update: a) gets the filter to update and b) makes sure the new value is selected
                and c) refreshes the rows based on the new filter value. So for example if you first set the filter
                on Col 4 to 'A' (notice that 'B' rows are removed), then change a value from 'A' to 'B', then
                the other rows that were previously removed are added back in again.
            </li>
            <li>
                Click 'Add C Row' to add a new row. Columns 3 and 4 will have their filters updated. Columns
                1 and 2 will not have their filters updated.
            </li>
        </ul>

    <?= example('Refresh After Edit', 'refresh-after-edit', 'generated', array("enterprise" => 1)) ?>

    <p>
        Why do we do this? The reason is if the filters were changing as the editing was happening, then
        this would cause the following issues:
    </p>

    <ul class="content">
        <li>
            Rows could disappear while editing if there was a filter set and the edit make a row fail
            a filter that was previously passing the filter.
        </li>
        <li>
            Values could be split, eg if
        </li>
    </ul>

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

    <?= example('Set Filter New Rows', 'set-filter-new-rows', 'generated', array("enterprise" => 1)) ?>

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
countryFilterComponent.setModel(['Spain','Ireland','South Africa','Australia','England']);
countryFilterComponent.onFilterChanged()</snippet>


    <p>
        The number filter model its an straight string array where each item in the array corresponds to an element
        to be selected from the set:
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
    </ul>

    <p>
        Is important to note that when updating the set filter through the API is up to the developer to call
        gridOptions.api.onFilterChanged() at the end of the interaction with the filter.

        If no call to gridOptions.api.onFilterChanged() is provided the grid will still show the data relevant to the filter
        before it was updated through the API.

        In the example below, you can see how the filter for the Athlete column is modified through the API and how at the
        end of the interaction a call to gridOptions.api.onFilterChanged() is performed.
    </p>

    <?= example('Set Filter API', 'set-filter-api', 'generated', array("enterprise" => 1)) ?>

    <h2>Floating Set Filter</h2>
    <p>
        If your grid has floatingFilter enabled, your columns with set filter will automatically show below the header a new
        column that<!----> will show two elements:
    </p>

    <ul class="content">
        <li>Filter input box: It reflects any change made to the set filtering from anywhere within the application. This includes
                    changes on the rich filter for this column made by the user directly or changes made to the filter through
                    a call to setModel or the API to this filter component</li>
            </ol>
        </li>
        <li>Filter button: This button is a shortcut to show the rich filter editor</li>
    </ul>

    <h2>Common Column Filtering Functionality And Examples</h2>

    <p>The following can be found in the <a href="../javascript-grid-filtering/">column filtering documentation page</a></p>

    <ul class="content">
        <li>Common filtering params</li>
        <li>Enabling/Disabling filtering in a column</li>
        <li>Enabling/Disabling floating filter</li>
        <li>Adding apply and clear button to a column filter</li>
        <li>Filtering animation</li>
        <li>Examples</li>
    </ul>



<?php include '../documentation-main/documentation_footer.php';?>
