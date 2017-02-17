<?php
$key = "Set Filtering";
$pageTitle = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageDescription = "ag-Grid can filter like Excel, by providing you with a set that you can select from.";
$pageKeyboards = "ag-Grid JavaScript Data Grid Excel Set Filtering";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Set Filtering</h2>

    <p>
        <?php include '../enterprise.php';?>
        &nbsp;
        Set filtering is available in ag-Grid Enterprise.
    </p>

    <p>
        A set filter, influenced by how filters work in Microsoft Excel. Set filters can be provided with
        additional options through the filterParams attribute.
    </p>

    <h3>Filter Parameters</h3>

    <p>
        An additional attribute on the column definition, filterParams, can be used to provide extra information to
        the set filter. Set the filterParams on the columnDefinition as follows:
    </p>

    <pre>
columnDefinition = {
    headerName: "Athlete",
    field: "athlete",
    filter: 'set',
    filterParams: {cellRenderer: countryFilterCellRenderer, cellHeight: 20, values: ['A','B','C'], newRowsAction: 'keep'}
}</pre>

    <p>
        The set filter params are specific to each filter and have the following meanings:
    </p>

    <ul>
        <li><b>cellRenderer:</b> Same as cell renderer for grid (you can use the same one in both locations).
            Setting it separatly here allows for the value to be rendered differently in the filter.</li>
        <li><b>cellHeight:</b> The height of the cell.</li>
        <li><b>values:</b> The values to display in the filter. If this is not set, then the filter will
            takes it's values from what is loaded in the table. Setting it allows you to set values where a) the
            value may not be present in the list (for example, if you want to show all states in America so
            that the user is not confused by missing states, even though states are missing from the dataset
            in the grid) and b) the list is not available (happens when doing server side filtering in pagination
            and infinite scrolling).</li>
        <li><b>newRowsAction:</b> What to do when new rows are loaded. The default is to reset the filter,
            as the set of values to select from can have changed. If you want to keep the selection, then
            set this value to 'keep'. This can be useful if you are using values (above) or otherwise know that the
            list to select from will not change. If the list does change, then it can be confusing what
            to do with new values into the set (should they be selected or not??).</li>
        <li><b>apply:</b> Set to true to include an 'Apply' button with the filter and not filter
            automatically as the selection changes.</li>
        <li><b>suppressRemoveEntries:</b> Set to true to stop the filter from removing values that are no
            longer available (like what Excel does).</li>
        <li><b>comparator(a,b):</b> Comparator for sorting. If not provided, the colDef comparator is used. If colDef
            also not provided, the default (agGrid provided) comparator is used.</li>
        <li><b>suppressSorting:</b> If true, sorting will not be done on the set filter values. Use this is providing
            your own values and don't want them sorted as you are providing in the order you want.</li>
        <li><b>suppressMiniFilter:</b> Set to false(default)/true to show/hide the input text box to filter the set
            entries displayed in the filter .</li>
    </ul>
    </p>

    <note>
        The comparator for a set filter is only provided the values as the first two parameters, whereas the comparator for the colDef
        is also provided the row data as additional parameters. This is because when sorting rows, row data exists. For example,
        take 100 rows split across the colors {white,black}. The colDef comparator will be sorting 100 rows, however the
        filter will be only sorting two values.
        <br/>
        If you are providing a comparator that depends on the row data, and you are using set filter, be sure to provide
        the set filter with an alternative comparator that doesn't depend on the row data.
    </note>

    <h3>Complex Objects - keyCreator</h3>

    <p>
        If you are providing complex objects as values, then you need to provide <i>colDef.keyCreator</i> method in your
        object for the set filter to work, giving a unique value for the object. This is because the set filter needs
        a string key to identify the value. The example below demonstrates keyCreator with the country column by replacing
        the country name in the data with a complex object of country name and code. If the keyCreator was not provided
        on the colDef, the set filter would not work.
    </p>

    <h3>Set Filter - Search Field</h3>

    <p>
        The text box in the set filter is to allow filtering of displayed filter items, but doesn't actually change the
        applied filter.</p><p>The expected flow when using the search box would be uncheck "Select All", type what you're after
        in the search box and then finally select the filter entries you want to actually filter on.
    </p>

    <h3>Set Filters Example</h3>

    <p>
        The example below demonstrates the set filter.
        Notice that the athlete column is given the set of filters, providing some filter options for which
        no corresponding rows exist - this can be used if you are missing items in what would otherwise be
        a complete list, if listing days of the week, and no data for Wednesday exists, then presenting
        the filter to the user could give the impression that the filter is broken because it is missing
        Wednesday as an option.
    </p>

    <p>
        The example also demonstrates using the <i>ag-header-cell-filtered</i> class, which is applied to the header
        cell when the header is filtered. By default, no style is applied to this class, the example shows
        applying a different color background to this style.
    </p>

    <p>
        The column sport has also the property <i>suppressMiniFilter</i> set to true, hiding the text input box for the
        set filter in this column (compare this set filter with athlete which suppressMiniFilter is the default = false).
    </p>

    <show-example example="exampleSetFilter"></show-example>

    <h3 id="sortingSetFilter">Sorting Set Filter Values List</h3>

    <p>
        Values inside a set filter will be sorted by their string value by default. If you want a different sort
        order than the natural string sort order, you need to provide a comparator.
    </p>

    <p>
        The example below shows sorting on the age columns. The age column is repeated with one difference, the
        first instance has a comparator, the second has not. The second iteration has the numbers ordered by the
        default string ordering which is not correct (ie the sequence is 0,1,10,11,2 instead of 0,1,2,3...).
    </p>

    <show-example example="exampleSetFilterComparator"></show-example>

    <h3 id="newRowsSetFilter">New Rows Action and Values Example</h3>

    <p>
        Below demonstrates using New Rows Action and Values. The example is not meant to make business sense,
        it just demonstrates the filters with random unrelated data. The example has the columns configured
        as follows:
        <ul>
        <li>Column Fruit - Normal</li>
        <li>Column Animal - Using newRowsAction = Keep</li>
        <li>Column Color - Using values</li>
        <li>Column Location - Using values and using newRowsAction = Keep</li>
    </ul>
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

    <show-example example="exampleSetFilterNewRows"></show-example>

    <h3>Set Filter API</h3>
    <p>
        The set filter API is as follows:
    <ul>
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
        <li><b>getModel() / setModel()</b>: Gets the filter as a model, good for saving and restoring.</li>
    </ul>
    </p>

    <p>
        Is important to note that when updating the set filter through the API is up to the developer to call
        gridOptions.api.onFilterChanged() at the end of the interaction with the filter.

        If no call to gridOptions.api.onFilterChanged() is provided the grid will still show the data relevant to the filter
        before it was updated through the API.

        In the example below, you can see how the filter for the Athlete column is modified through the API and how at the
        end of the interaction a call to gridOptions.api.onFilterChanged() is performed.
    </p>

    <show-example example="exampleSetFilterApi"></show-example>

<!--    <p>
        To use the
    </p>
-->

<!--    <h3>Another Example</h3>

    <show-example example="exampleSetFilter2"></show-example>-->


</div>

<?php include '../documentation-main/documentation_footer.php';?>
