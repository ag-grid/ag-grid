<?php
$key = "Column Filter";
$pageTitle = "ag-Grid Filtering";
$pageDescription = "ag-Grid Filtering";
$pageKeyboards = "ag-Grid Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<p>

    <h2 id="filtering">Column Filter</h2>

    <p>
        You have two options for filtering, one is use one of the default built-in filters (easy but restricted to
        what's provided), or bake your own custom filters (no restrictions, build what you want, but takes more time).
    </p>

    <note>
        This page discusses filtering outside of the context of paging. To see how to implement server
        side filtering, see the sections
        <a href="/javascript-grid-pagination/">pagination</a>
        and
        <a href="/javascript-grid-virtual-paging/">virtual paging</a>
    </note>

    <h3 id="enable-filtering">Enable Filtering</h3>

    <p>
        Enable filtering by setting grid property <i>enableFilter=true</i>. This turns on filtering on all columns.
        To turn off filtering for particular columns, set <i>suppressFilter=true</i> on the individual column definition.
    </p>

    <p>
        When a filter is active on a column, the filter icon appears before the column name in the header.
    </p>

    <h3 id="default-built-in-filters">Default Built-In Filters</h3>

    <p>
        The following filter options can be set for a column definition:
    </p>

    <table class="table">
        <tr>
            <th>Filter</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>number</th>
            <td>A number comparison filter. Functionality for matching on {equals, less than, greater than}.</td>
        </tr>
        <tr>
            <th>text</th>
            <td>A string comparison filter. Functionality for matching on {contains, starts with, ends with, equals}.</td>
        </tr>
        <tr>
            <th>date</th>
            <td>A date comparison filter. Functionality for matching on {equals, not equals, less than, greater than, in range}.</td>
        </tr>
        <tr>
            <th>set</th>
            <td>A set filter, influenced by how filters work in Microsoft Excel. This is an ag-Grid-Enterprise
                feature and explained further <a href="../javascript-grid-set-filtering/">here</a></td>
        </tr>
    </table>

    <p>
        If no filter type is specified, the default 'text' filter is used (unless you are using ag-Grid-Enterprise,
        in which case the 'set' filter is the default).
    </p>

    <h3 id="filter-parameters">Filter Parameters</h3>

    <p>
        As well as specifying the filter type, you can also provide setup parameters for the filters by setting
        <code>colDef.filterParams</code>. The available parameters are specific to the filter type. What follows
        is an example of setting 'apply=true' and 'newRowsAction=keep' on a text filter:
    </p>

    <pre>
columnDefinition = {
    headerName: "Athlete",
    field: "athlete",
    filter: 'text',
    filterParams: {apply: true, newRowsAction: 'keep'}
}</pre>

    <h4 id="text-number-and-date-filter-parameters">Text, Number and Date Filter Parameters</h4>
    <p>
        The filter parameters for text, date and number filter have the following meaning:
        <ul>
            <li><b>newRowsAction:</b> What to do when new rows are loaded. The default is to reset the filter.
                If you want to keep the filter status between row loads, then set this value to 'keep'.</li>
            <li><b>apply:</b> Set to true to include an 'Apply' button with the filter and not filter
                automatically as the selection changes.</li>
        </ul>

    </p>
    <p>
        The date filter has an additional property to specify how the filter date should be compared with the data
        in your cell:
        <ul>
            <li><b>comparator:</b> A callback to specify how the current row's value compares to the filter.
            This is explained below in the section <a href="./#dateFilterComparator">Date Filter Comparator</a>.</li>
        </ul>
    </p>

    <h3 id="built-in-filters-example">Built In Filters Example</h3>

    <p>
        The example below demonstrates:
        <ul>
        <li>Three filter types text filter, number filter and date filter.</li>
        <li>Quick filter</li>
        <li>using the <i>ag-header-cell-filtered</i> class, which is applied to the header
            cell when the header is filtered. By default, no style is applied to this class, the example shows
            applying a different color background to this style.</li>
        <li>'suppressFilter' is set on Total to hide the filter on this column</li>
    </ul>
    </p>

    <show-complex-example example="example1.html"
                          sources="{
                                [
                                    { root: './', files: 'example1.html,example1.js' }
                                ]
                              }"
                          plunker="https://embed.plnkr.co/PZ1kJCiQOerXr36cbTZ4/"
                          exampleheight="500px">
    </show-complex-example>


    <h3 id="apply-function">Apply Function</h3>

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

    <show-complex-example example="exampleFilterApply.html"
                          sources="{
                                [
                                    { root: './', files: 'exampleFilterApply.html,exampleFilterApply.js' }
                                ]
                              }"
                          plunker="https://embed.plnkr.co/eIdTwdmysRxmhyOZJFbP/"
                          exampleheight="500px">
    </show-complex-example>

    <h3 id="filtering-animation">Filtering Animation</h3>

    <p>
        To enable animation of the rows after filtering, set grid property <i>animateRows=true</i>.
    </p>

    <h3 id="accessing-filter-component-instances">Accessing Filter Component Instances</h3>

    <p>
        It is possible to access the filter components directly if you want to interact with the specific
        filter. This also works for your own custom filters, where you can
        get a reference to the underlying filtering instance (ie what was created after ag-Grid called 'new'
        on your filter). You get a reference to the filter instance by calling <code>api.getFilterInstance(colKey)</code>.
    </p>
    <pre><span class="codeComment">// Get a reference to the name filter instance</span>
var nameFilterInstance = api.getFilterInstance('name');</pre>
    <p>
        All of the methods in the IFilter interface (described above) are present, assuming the underlying
        filter implements the method. Your custom filters can add their own methods here that ag-Grid will
        not use but your application can use. What these extra methods do is up to you and between your
        customer filter and your application.
    </p>



    <h3>Example Filter API</h3>

    <p>
        The example below shows controlling the country and age filters via the API.
    </p>

    <p>
        The example also shows 'gridApi.destroyFilter(col)' which completely destroys a filter. Use this is if you want
        a filter to be created again with new initialisation values.
    </p>

    <p>
        (Note: the example uses the <a href="../javascript-grid-set-filtering/">enterprise set filter</a>).
    </p>

    <show-complex-example example="exampleFilterApi.html"
                          sources="{
                                [
                                    { root: './', files: 'exampleFilterApi.html,exampleFilterApi.js' }
                                ]
                              }"
                          plunker="https://embed.plnkr.co/5EyeTra5sahkg43TnL5L/"
                          exampleheight="500px">
    </show-complex-example>

    <h4 id="reset_filters">Reset Individual Filters</h4>

    <p>You can reset a filter to it's original state by getting the filter instance and then performing the action that makes sense for the filter type.</p>

    <p>For all the filter types the sequence would be:</p>
    <ul>
        <li><code>var filterComponent = gridOptions.api.getFilterInstance('filter_name');</code></li>
        <li>perform reset action for filter type</li>
        <li><code>gridOptions.api.onFilterChanged();</code></li>
    </ul>

    <p>The following are the appropriate methods for the corresponding filter types:</p>
    <table class="table">
        <tr>
            <th>Filter Type</th>
            <th>Action</th>
        </tr>
        <tr>
            <th>number</th>
            <th><code>filterComponent.setFilter(null);</code></th>
        </tr>
        <tr>
            <th>text</th>
            <th><code>filterComponent.setFilter(null);</code></th>
        </tr>
        <tr>
            <th>set</th>
            <th><code>filterComponent.selectEverything();</code></th>
        </tr>
    </table>

    <h4>Reset All Filters</h4>
    <p>You can reset all filters by doing the following:</p>
    <pre>
gridOptions.api.setFilterModel(null);
</pre>

    <h3 id="get_set_filter_model">Get / Set All Filter Models</h3>

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

    <show-complex-example example="exampleFilterModel.html"
                          sources="{
                                [
                                    { root: './', files: 'exampleFilterModel.html,exampleFilterModel.js' }
                                ]
                              }"
                          plunker="https://embed.plnkr.co/KDZENKpqCaPZWq8lNQU5/"
                          exampleheight="500px">
    </show-complex-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
