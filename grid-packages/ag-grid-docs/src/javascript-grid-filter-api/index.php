<?php
$pageTitle = "Filter API";
$pageDescription = "Using the filter API you can interact with filters, in particular getting and setting their values.";
$pageKeywords = "ag-Grid Filter API";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Filter API</h1>

<p class="lead">
    You can interact with filters either directly, by getting a reference to the filter instance,
    or indirectly, by getting and setting all filter models through the grid API. This page
    details how to do both.
</p>

<h2 id="filterComponentInstance">Accessing Filter Component Instances</h2>

<p>
    It is possible to access the filter components directly if you want to interact with the specific
    filter. This also works for your own custom filters, where you can get a reference to the underlying filtering
    instance (i.e. what was created after ag-Grid called <code>new</code> on your filter). You get a reference to a
    filter instance by calling <code>api.getFilterInstance(colKey)</code>.
</p>

<?= createSnippet(<<<SNIPPET
// Get a reference to the 'name' filter instance
var filterInstance = gridApi.getFilterInstance('name');
SNIPPET
) ?>

<p>
    All of the methods of the filter are present. If using a custom filter, any other methods you have
    added will also be present, allowing bespoke behaviour to be added to your filter.
</p>

<p>
    For filters that are created asynchronously including React 16+ components, <code>getFilterInstance</code> will
    return <code>null</code> if the filter has not already been created. If your app uses asynchronous components,
    use the optional <code>callback</code> function which will be invoked with the filter instance when it is available.
</p>

<?= createSnippet(<<<SNIPPET
// Get a reference to an asynchronously created filter instance
gridApi.getFilterInstance('name', function(filterInstance) {
    ... use filterInstance here
});
SNIPPET
) ?>

<h3>Re-running Grid Filtering</h3>

<p>
    When a filter has been changed via its API, the method <code>gridOptions.api.onFilterChanged()</code> is
    required to be called to tell the grid to filter the rows again. If <code>gridOptions.api.onFilterChanged()</code>
    is not called, the grid will still show the data relevant to the filter before it was updated through the API.
</p>

<?= createSnippet(<<<SNIPPET
// Get a reference to the 'name' filter instance
var filterInstance = gridApi.getFilterInstance('name');

// Set the model for the filter
filterInstance.setModel({
    type: 'endsWith',
    filter: 'g'
});

// Tell grid to run filter operation again
gridApi.onFilterChanged();
SNIPPET
) ?>

<h3>Applying the Model</h3>

<p>
    If you call <code>filterInstance.setModel()</code> this will both set and apply the model. However if changes
    are made either in the UI when the Apply button is active, or via other API methods whether the Apply button is
    active or not, you must call <code>filterInstance.applyModel()</code> if you want to ensure the UI is applied.
</p>
<p>
    Applying the model is then typically followed by calling
    <code>gridOptions.api.onFilterChanged()</code> to have the grid re-run the filtering.
</p>

<?= createSnippet(<<<SNIPPET
// Get a reference to the 'name' filter instance
var filterInstance = gridApi.getFilterInstance('name');

// Apply the model to ensure any changes in the UI or via API methods are recognised
filterInstance.applyModel();

// Tell grid to run filter operation again
gridApi.onFilterChanged();
SNIPPET
) ?>

<p>
    If no call is made to <code>filterInstance.applyModel()</code> then the filter UI will show any changes, but
    they won't be reflected in the filter model. This will appear as if the user never hit the Apply button (regardless
    of whether the Apply button is active or not).
</p>

<h3>Example: Filter API</h2>

<p>
    The example below shows controlling the Country and Age filters via the API.
</p>

<p>
    The example also shows <code>gridApi.destroyFilter(col)</code> which completely destroys a filter. Use this if you want
    a filter to be created again with new initialisation values.
</p>

<p>
    (Note: the example uses the Enterprise-only <a href="../javascript-grid-filter-set/">set filter</a>).
</p>

<?= grid_example('Filter API', 'filter-api', 'generated', ['enterprise' => true, 'exampleHeight' => 620, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<h2>Reset Individual Filters</h2>

<p>
    You can reset a filter to its original state by getting the filter instance and setting the model to
    <code>null</code>.
</p>

<p>For all the filter types the sequence would be:</p>

<?= createSnippet(<<<SNIPPET
// Get a reference to the filter instance
var filterInstance = gridApi.getFilterInstance('filter_name');

// set the model to null
filterInstance.setModel(null);

// Tell grid to run filter operation again
gridApi.onFilterChanged();
SNIPPET
) ?>

<h2>Reset All Filters</h2>

<p>You can reset all filters by doing the following:</p>

<?= createSnippet('gridOptions.api.setFilterModel(null);') ?>

<h2>Get / Set All Filter Models</h2>

<p>
    It is possible to get and set the state of <b>all</b> the filters via the API methods <code>getFilterModel()</code>
    and <code>setFilterModel()</code>. These methods manage the filters states via the <code>getModel()</code> and <code>setModel()</code>
    methods of the individual filters.
</p>
<p>
    This is useful if you want to save the filter state and apply it at a later
    stage. It is also useful for server-side filtering, where you want to pass the filter state to the
    server.
</p>

<h3>Example: Get / Set All Filter Models</h3>

<p>
    The example below shows getting and setting all the filter models in action. The 'save' and 'restore' buttons
    mimic what you would do to save and restore the state of the filters. The big button (Name = 'Mich%'... etc.)
    shows how you can hand craft a model and set that into the filters.
</p>

<p>
    (Note: the example uses the Enterprise-only <a href="../javascript-grid-filter-set/">set filter</a>).
</p>

<?= grid_example('Filter Model', 'filter-model', 'generated', ['enterprise' => true, 'exampleHeight' => 590, 'modules' => ['clientside', 'menu', 'filterpanel', 'columnpanel', 'setfilter']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
