<?php
$key = "Filtering";
$pageTitle = "AngularJS Angular Grid Filtering";
$pageDescription = "AngularJS Angular Grid Filtering";
$pageKeyboards = "AngularJS Angular Grid Filtering";
include '../documentation_header.php';
?>

<div>

    <h2>Filtering</h2>


    You have two options for filtering, one is use on of the default built-in filters (easy but limited),
    or bake your own custom filters (powerful but more difficult).

    <h3>Enable Filtering</h3>

    Turn filtering on for the grid by enabling filtering in the grid options. When on, each column header will have
    the filter menu icon appear when the mouse hovers over it. When clicked, a filter menu will appear. The menu
    will either contain a default provided filter, or your own custom built filter.

    <p/>

    When a filter is active on a column, the filter icon appears before the column name in the header.

    <h3>Default Built-In Filters</h3>

    The following filter options can be set for a column definition:

    <table class="table">
        <tr>
            <th>Filter</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>set</th>
            <td>A set filter, influenced by how filters work in Microsoft Excel. Set filters can be provided with
                additional options through the filterParams attribute.</td>
        </tr>
        <tr>
            <th>number</th>
            <td>A number comparison filter. Functionality for matching on {equals, less than, greater than}.</td>
        </tr>
        <tr>
            <th>text</th>
            <td>A string comparison filter. Functionality for mating on {contains, starts with, ends with, equals}.</td>
        </tr>
    </table>

    If no filter type is specified, the default 'set' filter is used.

    <h3>Filter Parameters</h3>

    An additional attribute on the column definition, filterParams, can be used to provide extra information to
    the filter. Currently only set filter makes use of this nad takes a cellRenderer and rowHeight as follows:

    <pre>
columnDefinition = {
    displayName: "Athlete",
    field: "athlete",
    filter: 'set',
    filterParams: {cellRenderer: countryFilterCellRenderer, cellHeight: 20, values: ['A','B','C']}
}</pre>

    <p>
        The filter parameters for set filter have the following meaning:
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
    </ul>

    </p>

    <h3>Quick Filter</h3>

    In addition to the column specific filtering, a 'quick filter' (influenced by how filtering is done in Google
    GMail) can also be applied. Set the quick filter text into the grid options and tell the grid, via the API,
    to filter the data (which will include the new quick filter).

    <h3>Built In Filters Example</h3>

    The example below shows the three types of built in filters, as well as the quick filter, in action.
    Notice that the athlete column is given the set of filters, providing some filter options for which
    no corresponding rows exist - this can be used if you are missing items in what would otherwise be
    a complete list, if listing days of the week, and no data for Wednesday exists, then presenting
    the filter to the user could give the impression that the filter is broken because it is missing
    Wednesday as an option.

    <show-example example="example1"></show-example>

    <h3>Custom Filtering</h3>

    If the filters provided don't provide what you want, then it's time to build your own filter class.

    <p/>

    To provide a custom filter, instead of providing a string (eg set, text or number) for the filter in
    the column definition, provide a function. Angular Grid will call 'new' on this function and use
    the generated class as a filter. Angular Grid expects the filter class to have the following interface:

    <pre>

    // Class function.
    function MyCustomFilter(colDef, rowModel, filterChangedCallback, filterParams, $scope) {}

    // mandatory methods
    MyCustomFilter.prototype.getGui = function () {}
    MyCustomFilter.prototype.isFilterActive = function() {}
    MyCustomFilter.prototype.doesFilterPass = function (value, model) {}

    // optional methods
    MyCustomFilter.prototype.afterGuiAttached = function() {}
    MyCustomFilter.prototype.onNewRowsLoaded = function () {}
    MyCustomFilter.prototype.getModel = function () {}

    </pre>

    <table class="table">
        <tr>
            <th>Method</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>MyCustomFilter</th>
            <td>Constructor function for the class. Takes one parameter with the following attributes:
                <ul>
                    <li>colDef: The col def this filter is for.</li>
                    <li>rowModel: The internal row model inside Angular Grid. This should be treated as
                        read only. If the filter needs to know which rows are a) in the table b) currently
                        visible (ie not already filtered), c) what groups d) what order - all of this
                        can be read from the rowModel.
                    </li>
                    <li>filterChangedCallback: A function callback, to be called, when the filter changes,
                        to inform the grid to filter the data.
                    </li>
                    <li>
                        filterParams: The filter parameters, as provided in the column definition.
                    </li>
                    <li>
                        $scope: If the grid options angularCompileFilters is set to true, then a new child
                        scope is created for each column filter and provided here.
                    </li>
                </ul>
            </td>
        </tr>
        <tr>
            <th>getGui</th>
            <td>Returns the GUI for this filter. The GUI can be a) a string of html or b) a DOM element or node.
            </td>
        </tr>
        <tr>
            <th>isFilterActive</th>
            <td>This is used to show the filter icon in the header. If true, the filter icon will be shown.</td>
        </tr>
        <tr>
            <th>doesFilterPass</th>
            <td>The grid will ask each active filter, in turn, whether each row in the grid passes. If any
                filter fails, then the row will be excluded from the final set. The method is provided the value (the
                value to be checked), the row node, the row data and the filter model (for the filter, as provided by the 'get model' below -
                for now, the model can be ignored).</td>
        </tr>
        <tr>
            <th>afterGuiAttached</th>
            <td>Gets called after the gui returned in getGui is attached to the DOM. This is useful for any
                logic that requires attachment before executing, such as putting focus on a particular DOM
                element.</td>
        </tr>
        <tr>
            <th>onNewRowsLoaded</th>
            <td>Gets called when new rows are inserted into the grid. If the filter needs to change it's state
                after rows are loaded, it can do it here.
            </td>
        </tr>
        <tr>
            <th>getApi</th>
            <td>Returns the API for the filter. Useful if you want your filter manipulated vai an API.</td>
        </tr>
        <tr>
            <th>getModel</th>
            <td>Returns the model for the filter. At the moment, the only purpose of this is to have it passed
                into the 'doesFilterPass' method. In the future, the grid will be enhanced to have separate classes
                create the filter and check the filter passing. However for now this isn't implemented so you can
                ignore the 'getModel' method and the corresponding 'model' passed to 'does filter pass'.</td>
        </tr>
    </table>

    <h3>Custom Filter Example</h3>
    The example below shows a custom filter on the Athlete column.

    <show-example example="example2"></show-example>

    <h3>Filter API</h3>

    <p>
        It is possible to set filters via the API. You do this by first getting an API to the filter
        in question (ie for a particular column) and then making calls on the filter API. Getting
        the API is done via the gridOptions api method getFilterApiForColDef(colDef).
    </p>
    <p>
        Each column has it's own private filter and associated API. So if you want to change filters
        on more than one column, you have to call getFilterApiForColDef(colDef) for each column.
    </p>
    <p>
        Each filter type has it's own API. So if it's a set filter, the filter API is specific
        to set filters. If it's a custom filter, it's up to you to provide the API.
    </p>

    <p>
        The example below shows controlling the contry filter via the API.
    </p>
    <show-example example="example3"></show-example>

    <h4>Set Filter API</h4>
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
    </ul>
    </p>

    <h4>Number Filter API</h4>
    <p>
        The number filter API is as follows:
    <ul>
        <li><b>setType(type)</b>: Sets the type. Select from the provided constants on the API of EQUALS, LESS_THAN and GREATER_THAN</li>
        <li><b>setFilter(filter)</b>: Sets the filter text (which should be a number).</li>
    </ul>
    </p>

    <h4>Text Filter API</h4>
    <p>
        The text filter API is as follows:
    <ul>
        <li><b>setType(type)</b>: Sets the type. Select from the provided constants on the API of EQUALS, CONTAINS, STARTS_WITH and ENDS_WITH</li>
        <li><b>setFilter(filter)</b>: Sets the filter text (which should be a number).</li>
    </ul>
    </p>

</div>

<?php include '../documentation_footer.php';?>
