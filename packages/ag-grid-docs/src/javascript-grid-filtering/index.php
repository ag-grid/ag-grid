<?php
$pageTitle = "Column Filter: Core Feature of our Datagrid";
$pageDescription = "Filtering: appears in the column menu. The grid comes with filters out of the box: text, number, date and set filters. You can also create your own custom filter. Core feature of ag-Grid supporting Angular, React, Javascript and many more.";
$pageKeyboards = "ag-Grid Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Column Filter</h1>

    <p class="lead">
        Column filters are filters that are applied to the data at the column level. Many column filters can
        be active (eg filters set on different columns) and the grid will display rows that pass each
        column's filter.
    </p>

    <p>
        Column filters are access in the grid UI either in the
        <a href="../javascript-grid-column-menu/">Column Menu</a> or the
        <a href="../javascript-grid-tool-panel/">Tool Panel</a>.
    </p>

    <p style="display: flex; text-align: center; margin-top: 20px; margin-bottom: 40px;">
        <span style="flex: 1">
            Access via Column Menu<br/>
            <img src="./ColumnMenu.png" style="width: 300px;"/>
        </span>
        <span style="flex: 1">
            Access via Tool Panel<br/>
            <img src="./ToolPanel.png" style="width: 220px;"/>
        </span>
    </p>

    <p>
        You can use the provided filters that come with the grid, or you can build your own filters if you want
        to customise the filter experience to your application.
    </p>

    <h2>Provided Filters</h2>

    <p>
        There are four provided filters that come with the grid. The provided filters are as follows:
    </p>

    <table class="table reference">
        <tr>
            <th>Filter</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>agNumberColumnFilter</th>
            <td>A Number Filter for number comparisons.</td>
        </tr>
        <tr>
            <th>agTextColumnFilter</th>
            <td>A Text Filter for string comparisons.</td>
        </tr>
        <tr>
            <th>agDateColumnFilter</th>
            <td>A Date Filter for date comparisons.</td>
        </tr>
        <tr>
            <th>agSetColumnFilter*</th>
            <td>A Set Filter, influenced by how filters work in
                Microsoft Excel. This is an ag-Grid-Enterprise
                feature.</td>
        </tr>
    </table>

    <p>
        The Number, Text and Date filters are <a href="../javascript-grid-filter-provided-simple/">Simple Filters</a>
        and are described in the section on <a href="../javascript-grid-filter-provided-simple/">Simple Filters</a>.
    </p>

    <p>
        The <a href="../javascript-grid-filter-set">Set Filter</a> is more advanced and explained in it's own section.
    </p>

    <h2>Configuring Filters to Columns</h2>

    <p>
        Set filtering on a column using the column definition property <code>filter</code>. The property can have
        one of the following values:
        <ul>
            <li>boolean: Set to 'true' to enable the default filter. the default is Text Filter for ag-Grid
                Community and Set Filter for ag-Grid Enterprise</li>
            <li>string / component: Provide a specific filter to use over the default filter.</li>
        </ul>
    </p>

    <p>
        Below shows some column definitions with filters set:
    </p>

<snippet>
columnDefs: [

    // sets the text filter
    {field: "athlete", filter: "agTextColumnFilter"},

    // sets the number filter
    {field: "age",     filter: "agNumberColumnFilter"},

    // use the default filter
    {field: "gold",    filter: true},

    // use no filter (leaving unspecified means use no filter)
    {field: "sport"}
]</snippet>

    <p>
        If you want to enable filters on all columns then set a filter on the
        <a href="../javascript-grid-column-definitions/#default-column-definitions">Default Column Definition</a>.
        The following code snippet shows setting <code>filter=true</code> for all columns via the
        <code>defaultColDef</code> and then setting <code>filter=false</code> for the Sport column, so all
        columns have a filter except Sport.
    </p>

<snippet>
gridOptions = {
    ...

    // anything specified in defaultColDef gets applied on all columns
    defaultColDef: {
        filter: true // set filtering on for all cols
    },

    // then define individual column definitions
    columnDefs: [
        // filter not specified, defaultColDef setting is used
        {field: "athlete"},
        {field: "age"},

        // filter specifically set to 'false'
        {field: "sport", filter: false} // use no filter
    ]
}</snippet>

    <h2>Filter Parameters</h2>

    <p>
        Each filter can take additional filter parameters by setting <code>colDef.filterParams</code>.
        What parameters each filter type takes is specific to each filter. The parameters for the provided
        filters are explained in their relevant sections.
    </p>

    <p>
        Below shows configuring the text filter on an Athlete column and providing extra filter parameters
        (what <code>clearButton</code> and <code>applyButton</code> do are explained later).
    </p>

    <snippet>
columnDefinition = {

    field: 'athlete'

    // set the column to use text filter
    filter: 'agTextColumnFilter',

    // pass in additional parameters to the text filter
    filterParams: {
        clearButton: true,
        applyButton: true,
        debounceMs: 200
    }
}</snippet>






    <h2>Filter Events</h2>

    <p>
        Filtering results in the following events getting emitted:
    </p>

    <ul>
        <li><b>Filter Changed:</b> Filter has changed and applied by the grid.</li>
        <li><b>Filter Modified:</b> Filter UI has changed but not necessarily applied.
            This is useful when using an apply button and you want to know if the filter
            changed but not applied.
        </li>
    </ul>

    <h2>Filtering Animation</h2>

    <p>
        To enable animation of the rows after filtering, set grid property <code>animateRows=true</code>.
    </p>

    <h2>Accessing Filter Component Instances</h2>

    <p>
        It is possible to access the filter components directly if you want to interact with the specific
        filter. This also works for your own custom filters, where you can
        get a reference to the underlying filtering instance (ie what was created after ag-Grid called 'new'
        on your filter). You get a reference to the filter instance by calling <code>api.getFilterInstance(colKey)</code>.
    </p>
    <snippet>
// Get a reference to the name filter instance
var nameFilterInstance = api.getFilterInstance('name');</snippet>
    <p>
        All of the methods of the IFilter interface are present, assuming the underlying
        filter implements the method. Your custom filters can add their own methods here that ag-Grid will
        not use but your application can use. What these extra methods do is up to you and between your
        customer filter and your application.
    </p>


    <h2>Example Filter API</h2>

    <p>
        The example below shows controlling the country and age filters via the API.
    </p>

    <p>
        The example also shows 'gridApi.destroyFilter(col)' which completely destroys a filter. Use this is if you want
        a filter to be created again with new initialisation values.
    </p>

    <p>
        (Note: the example uses the <a href="../javascript-grid-filter-set/">enterprise set filter</a>).
    </p>

    <?= example('Filter API', 'filter-api', 'generated', array("enterprise" => 1, "processVue" => true)) ?>

    <h2>Reset Individual Filters</h2>

    <p>You can reset a filter to its original state by getting the filter instance and then performing the action that makes sense for the filter type.</p>

    <p>For all the filter types the sequence would be:</p>

    <ul class="content">
        <li><code>var filterComponent = gridOptions.api.getFilterInstance('filter_name');</code></li>
        <li>perform reset action for filter type</li>
        <li><code>gridOptions.api.onFilterChanged();</code></li>
    </ul>

    <p>The following are the appropriate methods for the corresponding filter types:</p>

    <table class="table reference">
        <tr>
            <th>Filter Type</th>
            <th>Action</th>
        </tr>
        <tr>
            <th>number</th>
            <th><code>filterComponent.setModel(null);</code></th>
        </tr>
        <tr>
            <th>text</th>
            <th><code>filterComponent.setModel(null);</code></th>
        </tr>
        <tr>
            <th>set</th>
            <th><code>filterComponent.selectEverything();</code></th>
        </tr>
    </table>

    <h2>Reset All Filters</h2>

    <p>You can reset all filters by doing the following:</p>
    <snippet>
gridOptions.api.setFilterModel(null);</snippet>

    <h2>Get / Set All Filter Models</h2>

    <p>
        It is possible to get and set the state of <b>all</b> the filters via the api methods <code>api.getFilterModel()</code>
        and <code>api.setFilterModel()</code>. These methods manage the filters states via the <code>getModel()</code> and <code>setModel()</code>
        methods of the individual filters.
    </p>
    <p>
        This is useful if you want to save the filter state and apply it at a later
        state. It is also useful for server side filtering, where you want to pass the filter state to the
        server.
    </p>

    <h3>Example - Get / Set All Filter Models</h3>

    <p>
        The example below shows getting and setting all the filter models in action. The 'save' and 'restore' buttons
        mimic what you would do to save and restore the state of the filters. The big button (Name = 'Mich%'... etc)
        shows how you can hand craft a model and then set that into the filters.
    </p>

    <p>
        (Note: the example uses the <a href="../javascript-grid-filter-set/">enterprise set filter</a>).
    </p>

    <?= example('Filter Model', 'filter-model', 'generated', array("enterprise" => 1, "processVue" => true)) ?>



<h2>Relation to Quick Filter and External Filter</h2>

<p>
    Column filters work independent to <a href="../javascript-grid-filter-quick/">Quick Filter</a>
    and <a href="../javascript-grid-filter-external/">External Filter</a>. If a quick filter and
    / or external filter are applied along with a column filter, then each filter type is considered
    and the row will only pass if it passes all three types.
</p>

<p>
    Column filters are tied to a column. Quick filter and external filter
    are not tied to a column. This section of the documentation talks about column filters only.
    For quick filter and external filter, see the relevant sections of the documentation.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
