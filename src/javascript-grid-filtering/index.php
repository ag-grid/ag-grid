<?php
$key = "Filtering";
$pageTitle = "ag-Grid Filtering";
$pageDescription = "ag-Grid Filtering";
$pageKeyboards = "ag-Grid Filtering";
include '../documentation-main/documentation_header.php';
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
        <a href="/javascript-grid-pagination/index.php">pagination</a>
        and
        <a href="/javascript-grid-virtual-paging/index.php">virtual paging</a>
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
            <td>A set filter, influenced by how filters work in Microsoft Excel. This is an ag-Grid-Enterprise
            feature and explained further <a href="../javascript-grid-set-filtering/">here</a></td>
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
        If no filter type is specified, the default 'text' filter is used (unless you are using ag-Grid-Enterprise,
        in which case the 'set' filter is the default).
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
    filter: 'text',
    filterParams: {apply: true, newRowsAction: 'keep'}
}</pre>

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
        The example below demonstrates: text filter, number filter and quick filter.
        The example also demonstrates using the <i>ag-header-cell-filtered</i> class, which is applied to the header
        cell when the header is filtered. By default, no style is applied to this class, the example shows
        applying a different color background to this style.
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
        <li>onFilterModified gets called when the filter changes regardless of the apply button.</li>
        <li>onBeforeFilterChanged gets called before a new filter is applied.</li>
        <li>onAfterFilterChanged gets called after a new filter is applied.</li>
    </p>

    <show-example example="exampleFilterApply"></show-example>

    <h2 id="externalFiltering">External Filtering</h2>

    <p>
        It is common for you to want to have widgets on the top of your grid that influence the grids filtering.
        External filtering allows you to mix your own 'outside of the grid' filtering with the grids filtering.
    </p>

    <p>
        The example below shows external filters in action. There are two methods on gridOptions you
        need to implement: <i>cbIsExternalFilterPresent()</i> and <i>cbDoesExternalFilterPass(node)</i>.
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
        the column definition, provide a function. ag-Grid will call 'new' on this function and use
        the generated class as a filter. ag-Grid expects the filter class to have the following interface:
    </p>

    <pre>

    // Class function.
    function MyCustomFilter() {}

    // mandatory methods
    MyCustomFilter.prototype.init = function (params) {}
    MyCustomFilter.prototype.getGui = function () {}
    MyCustomFilter.prototype.isFilterActive = function() {}
    MyCustomFilter.prototype.doesFilterPass = function (params) {}
    MyCustomFilter.prototype.getApi = function () {}

    // optional methods
    MyCustomFilter.prototype.afterGuiAttached = function(params) {}
    MyCustomFilter.prototype.onNewRowsLoaded = function () {}
    MyCustomFilter.prototype.onAnyFilterChanged = function () {}
    MyCustomFilter.prototype.destroy = function () {}

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
                    <li>column: The column this filter is for.</li>
                    <li>colDef: The col def this filter is for.</li>
                    <li>rowModel: The internal row model inside ag-Grid. This should be treated as
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
                        context: The context for this grid. See section on <a href="../javascript-grid-context/">Context</a>
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
            <td>Returns the API for the filter. Useful if you want your filter manipulated via an API.
            <pre>MyCustomFilter.prototype.getApi = function () {
    return {
        // called by api.getFilterModel() - if not implemented, then api.getFilterModel() will fail
        getModel: function() {
            // return how you want your model to look when someone
            // either calls getModel() directly on this filter,
            // or someone calls 'getFilterModel' on the main api
            var model = {value: theFilter.value};
            return model;
        },
        // called by api.setFilterModel(model) - if not implemented, then api.getFilterModel() will fail
        setModel: function(model) {
            // this will be passed the model that was returned in
            // get model.
            theFilter.value = model.value;
        },
        // then add as many of your own methods that you want,
        // only you will be calling these.
        clearMyValues: function() {
        }
    }
}</pre>
            </td>
            <tr>
                <th>destroy</th>
                <td>Gets called when the grid is destroyed. If your custom filter needs to do
                    any resource cleaning up, do it here. A filter is NOT destroyed when it is
                    made 'not visible', as the gui is kept to be shown again if the user selects
                    that filter again. The filter is destroyed when the grid is destroyed.
                </td>
            </tr>
        </tr>
    </table>

    <h3>Custom Filter Example</h3>

    <p>
        The example below shows two custom filters. The first is on the Athlete column and is implemented
        using AngularJS. The second is on the Year column and is implemented using native Javascript.
    </p>

    <show-example example="example2"></show-example>

    <h2>Filter API</h2>

    <p>
        It is possible to set filters via the API. You do this by first getting an API to the filter
        in question (ie for a particular column) and then making calls on the filter API. Getting
        the API is done via the gridOptions api method getFilterApi(colDef).
    </p>
    <p>
        Each column has it's own private filter and associated API. So if you want to change filters
        on more than one column, you have to call getFilterApi(colDef) for each column.
    </p>
    <p>
        Each filter type has it's own API. So what's available depends on the filter type.
        If it's a custom filter, it's up to you to provide the API. The below
        details the filter API for each of the built in filter types.
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
        You can provide any API methods you wish on your custom filters. There is only one restriction, you must
        implement the following if you want your filter to work with the gridOptions.api.setModel and gridOptions.api.getModel
        methods:
    <ul>
        <li><b>getModel() / setModel()</b>: Gets / Sets the filter as a model, good for saving and restoring.</li>
    </ul>

    <h4>Example Filter API</h4>

    <p>
        The example below shows controlling the country and age filters via the API.
    </p>

    <p>
        The example also shows 'gridApi.destroyFilter(col)' which completly destroys a filter. Use this is if you want
        a filter to be created again with new initialisation values.
    </p>
    
    <p>
        (Note: the example uses the <a href="../javascript-grid-set-filtering/">enterprise set filter</a>).
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

    <p>
        (Note: the example uses the <a href="../javascript-grid-set-filtering/">enterprise set filter</a>).
    </p>

    <show-example example="exampleFilterModel"></show-example>


</div>

<?php include '../documentation-main/documentation_footer.php';?>
