<?php
$pageTitle = "Column Filter: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Column Filter. Column Filters appear in the column menu. The grid comes with filters out of the box: text, number, date and set filters. You can also create your own customer filter. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Column Filter</h1>

    <p> Data in ag-Grid can be filtered in the following ways: </p>
        <ol class="content">
            <li><b>Column Filter</b>: A column filter is associated with a column and filters data based
            on the value of that column only. The column filter is accessed via the column's menu and
            may also have a <code>floating filter</code> element if floating filters are turned on.</li>
            <li><a href="../javascript-grid-filter-quick/"><b>Quick Filter</b></a>: The quick filter is a simple text filter that filters across all columns.</li>
            <li><a href="../javascript-grid-filter-external/"><b>External Filter</b></a>: External filters is a way for your application to apply bespoke
            filtering with no restriction to the columns.</li>
        </ol>
    <p>
        Column filters are tied to a column. Quick filter and external filter
        are not tied to a column. This section of the documentation talks about column filters only.
        For quick filter and external filter, see the relevant sections of the documentation.
    </p>

    <p>
        You have two options for filtering, one is use one of the default built-in filters (easy but restricted to
        what's provided), or bake your own custom filters (no restrictions, build what you want, but takes more time).
    </p>

    <h2>Enable Filtering</h2>

    <p>
        Enable filtering by setting grid property <code>enableFilter=true</code>. This turns on filtering on all columns.
        To turn off filtering for particular columns, set <code>suppressFilter=true</code> on the individual column definition.
    </p>

    <p>
        When a filter is active on a column, the filter icon appears before the column name in the header.
    </p>

<snippet>
gridOptions = {
    // turn on filtering
    enableFilter: true,
    ...
    columnDefs: [
        {headerName: "Athlete", field: "athlete", filter: "agTextColumnFilter"}, // text filter
        {headerName: "Age",     field: "age",     filter: "agNumberColumnFilter"}, // number filter
        {headerName: "Sport",   field: "sport",   suppressFilter: true} // NO filter
    ]
}</snippet>

    <h2>Filter Types</h2>

    <p>
        The following filter options can be set for a column definition:
    </p>

    <table class="table reference">
        <tr>
            <th>Filter</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>agNumberColumnFilter</th>
            <td>A <a href="../javascript-grid-filter-number/">Number Filter</a> for number comparisons.</td>
        </tr>
        <tr>
            <th>agTextColumnFilter</th>
            <td>A <a href="../javascript-grid-filter-text/">Text Filter</a> for string comparisons.</td>
        </tr>
        <tr>
            <th>agDateColumnFilter</th>
            <td>A <a href="../javascript-grid-filter-date/">Date Filter</a> for date comparisons.</td>
        </tr>
        <tr>
            <th>agSetColumnFilter</th>
            <td>A <a href="../javascript-grid-filter-set/">Set Filter</a>, influenced by how filters work in
                Microsoft Excel. This is an ag-Grid-Enterprise
                feature.</td>
        </tr>
        <tr>
            <th>-custom-</th>
            <td>A <a href="../javascript-grid-filter-component/">Filter Component</a> where you can provide
            you own filter written in a framework of your choice.</td>
        </tr>
    </table>

    <p>
        If no filter type is specified, the default is 'text' for ag-Grid (free versions) and 'set'
        for ag-Grid Enterprise.
    </p>

    <h2>Filter Parameters</h2>

    <p>
        Each filter can take additional filter params by setting <code>colDef.filterParams</code>.
        What parameters each filter type takes is explained in the section on each filter.
        As an example, the following sets parameters for the text filter.
    </p>

    <snippet>
columnDefinition = {

    headerName: 'Athlete',
    field: 'athlete'

    // set the column to use text filter
    filter: 'agTextColumnFilter',

    // pass in additional parameters to the text filter
    filterParams: {apply: true, newRowsAction: 'keep'}
}</snippet>

    <h2>Built In Filters Example</h2>

    <p>
        The example below demonstrates:
    </p>
        <ul class="content">
        <li>Three filter types 1) text filter, 2) number filter and 3) date filter.</li>
        <li>Using the <code>ag-header-cell-filtered</code> class, which is applied to the header
            cell when the header is filtered. By default, no style is applied to this class, the example shows
            applying a different color background to this style.</li>
        <li>'suppressFilter' is set on Total to hide the filter on this column</li>
    </ul>

    <?= example('Built-In Filters', 'built-in-filters', 'generated') ?>

    <h2>Apply Function</h2>

    <p>
        If you want the user to hit an 'Apply' button before the filter is actioned, add <code>apply=true</code>
        to the filter parameters. The example below shows this in action for the first three columns.
    </p>

    <p>
        This is handy if the filtering operation is taking a long time (usually it doesn't), or if doing
        server side filtering (thus preventing unnecessary calls to the server).
    </p>

    <h2>Filter Events</h2>

    <p>
        Filtering results in the following events getting emitted:
        <table class="table">
            <tr>
                <th>filterChanged</th>
                <td>
                    Filter has changed.
                </td>
            </tr>
            <tr>
                <th>filterModified</th>
                <td>
                    Gets called when filter has been modified but <code>filterChanged</code>
                    not necessarily called. This is useful when
                    using an apply button inside the filter, as this event fires
                    when the filter is modified, and then <code>filterChanged</code>
                    is fired when the apply button is pressed.
                </td>
            </tr>
        </table>
    </p>

    <h2>Example: Apply Button and Filter Events</h2>

    <p>
        The example below also demonstrates using the apply button and filter events as follows:
    </p>
        <ul class="content">
            <li>onFilterModified gets called when the filter changes regardless of the apply button.</li>
            <li>onFilterChanged gets called after a new filter is applied.</li>
        </ul>

    <?= example('Apply Button and Filter Events', 'apply-and-filter-events', 'generated') ?>

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

    <?= example('Filter API', 'filter-api', 'generated', array("enterprise" => 1)) ?>

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

    <?= example('Filter Model', 'filter-model', 'generated', array("enterprise" => 1)) ?>

<h2>Floating filters</h2>

<p>
    Floating Filters are an additional row under the column headers where the user will be able to
    see and optionally edit the filters associated to each column.
</p>

<p>
    Floating filters are activated by setting grid property <code>floatingFilter=true</code>:
</p>

<snippet>
gridOptions = {
    // turn on floating filters
    floatingFilter: true
    ...
}</snippet>

<p>
    Floating filters are an accessory to the main column filters. They do not contain their own state,
    rather they display the state of the main filter, and if editable they set state on the main filter.
    Underneath the hood this is done by using the main filters <code>getModel()</code> and <code>setModel()</code>
    methods. For this reason, there is no api for getting or setting state of the floating filters.
</p>

<p>
    All the default filters provided by ag-Grid provide their own implementation of a floating filter.
    All you need to do to enable these floating filters is set the <code>floatingFilter=true</code> grid property.
</p>

<p>
    Every floating filter also takes a parameter to show/hide automatically a button that will open the main filter.
</p>

<p>
    To see the specifics on what are all the parameters and the interface for a floating filter check out
    <a href="../javascript-grid-floating-filter-component/">the docs for floating filter components</a>.
</p>

<p>
    The following example shows the following features of floating filters:
</p>
    <ul class="content">
        <li>Text filter: Have out of the box read/write floating filters (Sport column)</li>
        <li>Set filter: Have out of the box read floating filters  (Country column)</li>
        <li>Date and number filter: Have out of the box read/write floating filters for all filter except when switching
            to in range filtering, then the floating filter is read only (Age and date columns)</li>
        <li>Columns with the applyButton require the user to press enter on the floating filter for the filter to take
        effect (Gold column)</li>
        <li>Changes made from the outside are reflected automatically in the floating filters (Press any button)</li>
        <li>Columns with custom filter have automatic read only filter if the custom filter implements the method
        getModelAsString. (Athlete column)</li>
        <li>The user can configure when to show/hide the button that shows the rich filter (Silver and Bronze columns)</li>
        <li>Columns with suppressFilter=true don't have floating filters (Total column)</li>
        <li>Combining suppressMenu and suppressFilter lets you control where the user access to the rich filter. In
        this example suppressMenu = true for all the columns except Silver and Bronze</li>
    </ul>

<?= example('Floating Filter', 'floating-filter', 'generated', array("enterprise" => 1)) ?>

<h2>Server Side Filtering</h2>

<p>
    Some of the row models
    (<a href="../javascript-grid-pagination/">pagination</a> and
    <a href="../javascript-grid-virtual-paging/">infinite scrolling</a>)
    have further information on how to implement server side filtering.
    For details on this, see the the sections
    <a href="../javascript-grid-pagination/">pagination</a> and
    <a href="../javascript-grid-virtual-paging/">infinite scrolling</a>.
</p>

<h2>Filtering null values in Date and Number filters</h2>
<p>
    If your underlying data representation for a row contains <code>null</code> it won't be included in the filter results. If
    you want to change this behaviour, you can configure the property <code>columnDef.filterParams.nullComparator</code>

    The null comparator is an object used to tell if nulls should be included when filtering data, its interface it's like
    this:
<snippet>
export interface NullComparator{
    equals?:boolean
    lessThan?:boolean
    greaterThan?:boolean
}</snippet>
</p>


<p>
    If any of this properties is specified as true, the grid will include <code>null</code> values when doing the according filtering.
</p>
<p>
In the following example you can filter by age or date and see how <code>null</code> values are included in the filter based
on the combination of filter type and your <code>columnDef.filterParams.nullComparator</code>
</p>

<?= example('Null Filtering', 'null-filtering', 'vanilla') ?>

<p>
    Note that <code>inRange</code> will never include <code>null</code>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
