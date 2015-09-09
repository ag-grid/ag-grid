<?php
$key = "Filtering";
$pageTitle = "AngularJS Angular Grid Filtering";
$pageDescription = "AngularJS Angular Grid Filtering";
$pageKeyboards = "AngularJS Angular Grid Filtering";
include '../documentation_header.php';
?>

<div>

    <h2>Filtering</h2>

    <p>
        You have two options for filtering, one is use on of the default built-in filters (easy but restricted to
        what's provided), or bake your own custom filters (no restrictions, build what you want, but takes more time).
    </p>

    <note>
        This page discusses filtering outside of the context of paging. To see how to implement server
        side filtering, see the sections
        <a href="/angular-grid-pagination/index.php">pagination</a>
        and
        <a href="/angular-grid-virtual-paging/index.php">virtual paging</a>
    </note>

    <h3>Enable Filtering</h3>

    <p>
        Turn filtering on for the grid by enabling filtering in the grid options. When on, each column header will have
        the filter menu icon appear when the mouse hovers over it. When clicked, a filter menu will appear. The menu
        will either contain a default provided filter, or your own custom built filter.
    </p>

    <p>
        When a filter is active on a column, the filter icon appears before the column name in the header.
    </p>

    <h3>Default Built-In Filters</h3>

    <p>
        The following filter options can be set for a column definition:
    </p>

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

    <p>
        If no filter type is specified, the default 'set' filter is used.
    </p>

    <h3>Filter Parameters</h3>

    <p>
        An additional attribute on the column definition, filterParams, can be used to provide extra information to
        the filter. Set the filterParams on the columnDefinition as follows:
    </p>

    <pre>
columnDefinition = {
    headerName: "Athlete",
    field: "athlete",
    filter: 'set',
    filterParams: {cellRenderer: countryFilterCellRenderer, cellHeight: 20, values: ['A','B','C'], newRowsAction: 'keep'}
}</pre>

    <p>
        The filter params are specific to each filter and have the following meanings:
    </p>

    <h4>Set Filter Parameters</h4>
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
            <li><b>newRowsAction:</b> What to do when new rows are loaded. The default is to reset the filter,
                as the set of values to select from can have changed. If you want to keep the selection, then
                set this value to 'keep'. This can be useful if you are using values (above) or otherwise know that the
                list to select from will not change. If the list does change, then it can be confusing what
                to do with new values into the set (should they be selected or not??).</li>
            <li><b>apply:</b> Set to true to include an 'Apply' button with the filter and not filter
                automatically as the selection changes.</li>
            <li><b>suppressRemoveEntries:</b> Set to true to stop the filter from removing values that are no
                longer available (like what Excel does).</li>
        </ul>

    </p>

    <h4>Text and Number Filter Parameters</h4>
    <p>
        The filter parameters for set filter have the following meaning:
        <ul>
            <li><b>newRowsAction:</b> What to do when new rows are loaded. The default is to reset the filter,
                to keep it in line with 'set' filters. If you want to keep the selection, then set this value
                to 'keep'.</li>
            <li><b>apply:</b> Set to true to include an 'Apply' button with the filter and not filter
                automatically as the selection changes.</li>
        </ul>
    </p>

    <h3>Quick Filter</h3>

    <p>
        In addition to the column specific filtering, a 'quick filter' (influenced by how filtering is done in Google
        GMail) can also be applied. Set the quick filter text into the grid options and tell the grid, via the API,
        to filter the data (which will include the new quick filter).
    </p>

    <h3>Built In Filters Example</h3>

    <p>
        The example below shows the three types of built in filters, as well as the quick filter, in action.
        Notice that the athlete column is given the set of filters, providing some filter options for which
        no corresponding rows exist - this can be used if you are missing items in what would otherwise be
        a complete list, if listing days of the week, and no data for Wednesday exists, then presenting
        the filter to the user could give the impression that the filter is broken because it is missing
        Wednesday as an option.
    </p>

    <show-example example="example1"></show-example>

    <h2>Apply Function</h2>

    <p>
        If you want the user to hit an 'Apply' button before the filter is actioned, add <i>apply=true</i>
        to the filter parameters. The example below shows this in action for the first three columns.
    </p>

    <p>
        This is handy if the filtering operation is taking a long time (usually it doesn't), or if doing
        server side filtering (thus preventing unnecessary calls to the server).
    </p>

    <p>
        The example below also demonstrates the filter hook callbacks (see your browser dev console).
        <li>filterModified gets called when the filter changes regardless of the apply button.</li>
        <li>beforeFilterChanged gets called before a new filter is applied.</li>
        <li>afterFilterChanged gets called after a new filter is applied.</li>
    </p>

    <show-example example="exampleFilterApply"></show-example>

    <h2 id="externalFiltering">External Filtering</h2>

    <p>
        It is common for you to want to have widgets on the top of your grid that influence the grids filtering.
        External filtering allows you to mix your own 'outside of the grid' filtering with the grids filtering.
    </p>

    <p>
        The example below shows external filters in action. There are two methods on gridOptions you
        need to implement: <i>isExternalFilterPresent()</i> and <i>doesExternalFilterPass?(node)</i>.
    </p>
    <ul>

    <li>
        <b>isExternalFilterPresent</b> is called exactly once every time the grid senses a filter change.
        It should return true if external filtering is active, otherwise false. If you return true, then
        doesExternalFilterPass() will be called while filtering, otherwise doesExternalFilterPass() will
        not be called.
    </li>
    <li>
        <b>doesExternalFilterPass</b> is called once for each row node in the grid. If you return false,
        the node will be excluded from the final set.
    </li>
    </ul>
    <p>
        If the external filter changes, then you need to call api.onFilterChanged() to tell the grid
    </p>
    <p>
        The example below shows the external filters in action.
    </p>

    <show-example example="exampleFilterExternal"></show-example>

    <h2>Custom Column Filtering</h2>

    <p>
        If the filters provided don't provide what you want, then it's time to build your own filter class.
    </p>

    <p>
        To provide a custom filter, instead of providing a string (eg set, text or number) for the filter in
        the column definition, provide a function. Angular Grid will call 'new' on this function and use
        the generated class as a filter. Angular Grid expects the filter class to have the following interface:
    </p>

    <pre>

    // Class function.
    function MyCustomFilter() {}

    // mandatory methods
    MyCustomFilter.prototype.init = function (params) {}
    MyCustomFilter.prototype.getGui = function () {}
    MyCustomFilter.prototype.isFilterActive = function() {}
    MyCustomFilter.prototype.doesFilterPass = function (params) {}

    // optional methods
    MyCustomFilter.prototype.afterGuiAttached = function(params) {}
    MyCustomFilter.prototype.onNewRowsLoaded = function () {}
    MyCustomFilter.prototype.onAnyFilterChanged = function () {}

    </pre>

    <table class="table">
        <tr>
            <th>Method</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>init(params)</th>
            <td>Init method called on the filter once after 'new' is called on the function. Takes one parameter
                with the following attributes:
                <ul>
                    <li>colDef: The col def this filter is for.</li>
                    <li>rowModel: The internal row model inside Angular Grid. This should be treated as
                        read only. If the filter needs to know which rows are a) in the table b) currently
                        visible (ie not already filtered), c) what groups d) what order - all of this
                        can be read from the rowModel.
                    </li>
                    <li>filterChangedCallback(): A function callback, to be called, when the filter changes,
                        to inform the grid to filter the data. The grid will respond by filtering the data.
                    </li>
                    <li>filterModifiedCallback(): A function callback, to be <i>optionally</i> called, when the filter changes,
                        but before 'Apply' is pressed. The grid does nothing except call
                        gridOptions.filterModified().
                    </li>
                    <li>valueGetter(node): A function callback, call with a node to be given the value for that
                        filters column for that node. The callback takes care of selecting the right colDef
                        and deciding whether to use valueGetter or field etc.
                    </li>
                    <li>doesRowPassOtherFilter(node): A function callback, call with a node to be told whether
                        the node passes all filters except the current filter. This is useful if you want
                        to only present to the user values that this filter can filter given the status
                        of the other filters. The set filter uses this to remove from the list, items that
                        are no longer available due to the state of other filters (like Excel type filtering).
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
            <th>afterGuiAttached(params)</th>
            <td>Gets called every time the popup is shown, after the gui returned in getGui is attached to the DOM.
                If the filter popup is closed and reopened, this method is called each time the filter is shown.
                This is useful for any
                logic that requires attachment before executing, such as putting focus on a particular DOM
                element. The params has one callback method 'hidePopup', which you can call at any later
                point to hide the popup - good if you have an 'Apply' button and you want to hide the popup
                after it is pressed.</td>
        </tr>
        <tr>
            <th>onNewRowsLoaded</th>
            <td>Gets called when new rows are inserted into the grid. If the filter needs to change it's state
                after rows are loaded, it can do it here.
            </td>
        </tr>
        <tr>
            <th>getApi</th>
            <td>Returns the API for the filter. Useful if you want your filter manipulated via an API.</td>
        </tr>
    </table>

    <h3>Custom Filter Example</h3>

    <p>
        The example below shows a custom filter on the Athlete column.
    </p>

    <show-example example="example2"></show-example>

    <h2>Filter API</h2>

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
        to set filters. If it's a custom filter, it's up to you to provide the API. The below
        details the filter API for each of the built in filter types.
    </p>

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
        <li><b>getModel() / setModel()</b>: Gets the filter as a model, good for saving and restoring.</li>
    </ul>
    </p>

    <h4>Number Filter API</h4>
    <p>
        The number filter API is as follows:
    <ul>
        <li><b>getType() / setType(type)</b>: Gets / Sets the type. Select from the provided constants on the API of EQUALS, LESS_THAN and GREATER_THAN</li>
        <li><b>getFilter() / setFilter(filter)</b>: Gets / Sets the filter text (which should be a number).</li>
        <li><b>getModel() / setModel()</b>: Gets / Sets the filter as a model, good for saving and restoring.</li>
    </ul>
    </p>

    <h4>Text Filter API</h4>
    <p>
        The text filter API is as follows:
    <ul>
        <li><b>getType() / setType(type)</b>: Gets / Sets the type. Select from the provided constants on the API of EQUALS, CONTAINS, STARTS_WITH and ENDS_WITH</li>
        <li><b>getFilter() / setFilter(filter)</b>: Gets / Sets the filter text (a string).</li>
        <li><b>getModel() / setModel()</b>: Gets / Sets the filter as a model, good for saving and restoring.</li>
    </ul>

    <h4>Custom Filter API</h4>
    <p>
        You can provide any API methods you wish on your custom filters. There is only one resriction, you must
        implement the following if you want your filter to work with the gridOptions.api.setModel and gridOptions.api.getModel
        methods:
    <ul>
        <li><b>getModel() / setModel()</b>: Gets / Sets the filter as a model, good for saving and restoring.</li>
    </ul>

    <h4>Example Filter API</h4>

    <p>
        The example below shows controlling the country and age filters via the API.
    </p>
    <show-example example="exampleFilterApi"></show-example>

    <h2>Get / Set All Filter Models</h2>

    <p>
        It is possible to get and set the state of <b>all</b> the filters via the api methods <i>gridOptions.api.getFilterModel</i>
        and <i>gridOptions.api.setFilterModel</i>. These methods manage the filters states via the <i>getModel</i> and <i>setModel</i>
        methods of the individual filters.
    </p>
    <p>
        This is useful if you want to save the filter state and apply it at a later
        state. It is also useful for server side filtering, where you want to pass the filter state to the
        server.
    </p>

    <h4>Example Get / Set All Filter Models</h4>

    <p>
        The example below shows getting and setting all the filter models in action. The 'save' and 'restore' buttons
        mimic what you would do to save and restore the state of the filters. The big button (Name = 'Mich%'... etc)
        shows how you can hand craft a model and then set that into the filters.
    </p>

    <show-example example="exampleFilterModel"></show-example>

</div>

<?php include '../documentation_footer.php';?>
