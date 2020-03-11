<?php
$pageTitle = "Filter API";
$pageDescription = "Using the filter API you can interact with filters, in particular getting and setting their values.";
$pageKeywords = "ag-Grid Filter API";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h1>Filter API</h1>

    <p class="lead">
        You can interact either with filters directly by getting a reference to the filter instance,
        or indirectly by getting and setting all filter models through the grid API. This page
        details how to do both.
    </p>

    <h2 id="filterComponentInstance">Accessing Filter Component Instances</h2>

    <p>
        It is possible to access the filter components directly if you want to interact with the specific
        filter. This also works for your own custom filters, where you can
        get a reference to the underlying filtering instance (ie what was created after ag-Grid called 'new'
        on your filter). You get a reference to the filter instance by calling <code>api.getFilterInstance(colKey)</code>.
    </p>

<snippet>
// Get a reference to the name filter instance
var filterInstance = gridApi.getFilterInstance('name');</snippet>

    <p>
        All of the methods of the filter are present. If using a custom filter then any other methods you have
        added will also be present, allowing bespoke behaviour to be added to your filter.
    </p>

    <h3>Re-running Grid Filtering</h3>

    <p>
        When a filter has been changed via it's API, the method <code>gridOptions.api.onFilterChanged()</code> is
        required to get the grid to filter the rows again. If <code>gridOptions.api.onFilterChanged()</code>
        is not called the grid will still show the data relevant to the filter before it was updated through the API.
    </p>

<snippet>// Get a reference to the name filter instance
var filterInstance = gridApi.getFilterInstance('name');

// Set the model for the filter
filterInstance.setModel({
    type: 'endsWith',
    filter: 'g'
});

// Get grid to run filter operation again
gridApi.onFilterChanged();</snippet>

    <h3>Applying the Model</h3>

    <p>
        If you call <code>filterInstance.setModel()</code> this will both set and apply the model. However if
        using other methods provided by the filter instance (eg most of the
        <a href="../javascript-grid-filter-set">Set Filter</a> API methods) then you must call
        <code>filterInstance.applyModel()</code> to have the model applied. This step is necessary regardless
        of the Apply Button active or not.
    </p>
    <p>
        Applying the model is then typically followed by calling
        <code>gridOptions.api.onFilterChanged()</code> to have the grid re-run the filtering.
    </p>

<snippet>// Get a reference to the name filter instance
var filterInstance = gridApi.getFilterInstance('name');

// Call some methods on Set Filter API that don't apply the filter
filterInstance.selectNothing();
filterInstance.selectValue('Ireland');

// APPLY THE MODEL!!!!
filterInstance.applyModel();

// Get grid to run filter operation again
gridApi.onFilterChanged();</snippet>

    <p>
        If no call is made to <code>filterInstance.applyModel()</code> then the filter UI will show the changes, but
        it won't be reflected in the filter model. This will appear as if the user never hit the Apply button (regardless
        of whether the Apply button is active or not).
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

    <?= grid_example('Filter API', 'filter-api', 'generated', ['enterprise' => true]) ?>

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

    <h3>Example: Get / Set All Filter Models</h3>

    <p>
        The example below shows getting and setting all the filter models in action. The 'save' and 'restore' buttons
        mimic what you would do to save and restore the state of the filters. The big button (Name = 'Mich%'... etc)
        shows how you can hand craft a model and then set that into the filters.
    </p>

    <p>
        (Note: the example uses the <a href="../javascript-grid-filter-set/">enterprise set filter</a>).
    </p>

    <?= grid_example('Filter Model', 'filter-model', 'generated', ['enterprise' => true]) ?>


<?php include '../documentation-main/documentation_footer.php';?>
