<?php
$pageTitle = "Filter API";
$pageDescription = "Using the filter API you can interact with filters, in particular getting and setting their values.";
$pageKeywords = "ag-Grid Filter API";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Filter API</h1>

<p class="lead">
    You can access and set the models for filters through the grid API, or access individual filter instances directly
    for more control. This page details how to do both.
</p>

<h2>Get / Set All Filter Models</h2>

<p>
    It is possible to get the state of all filters using the grid API method <code>getFilterModel()</code>, and to set
    the state using <code>setFilterModel()</code>. These methods manage the filters states via the
    <code>getModel()</code> and <code>setModel()</code> methods of the individual filters.
</p>

<?= createSnippet(<<<SNIPPET
var model = gridApi.getFilterModel();

// model represents the state of filters for all columns, e.g.
// {
//   athlete: {
//     filterType: 'text',
//     type: 'startsWith',
//     filter: 'mich'
//   },
//   age: {
//     filterType: 'number',
//     type: 'lessThan',
//     filter: 30
//   }
// }

gridApi.setFilterModel(model);
SNIPPET
) ?>

<p>
    This is useful if you want to save the global filter state and apply it at a later stage. It is also useful for
    server-side filtering, where you want to pass the filter state to the server.
</p>

<h3>Reset All Filters</h3>

<p>You can reset all filters by doing the following:</p>

<?= createSnippet('gridApi.setFilterModel(null);') ?>

<h3>Example: Get / Set All Filter Models</h3>

<p>
    The example below shows getting and setting all the filter models in action.
</p>

<ul>
    <li><code>Save Filter Model</code> saves the current filter state, which will then be displayed.</li>
    <li><code>Restore Saved Filter Model</code> restores the saved filter state back into the grid.</li>
    <li><code>Set Custom Filter Model</code> takes a custom hard-coded filter model and applies it to the grid.</li>
    <li><code>Reset Filters</code> will clear all active filters.</li>
    <li>
        <code>Destroy Filter</code> destroys the filter for the <strong>Athlete</strong> column by calling
        <code>gridApi.destroyFilter('athlete')</code>. This removes any active filter from that column, and will cause
        the filter to be created with new initialisation values the next time it is interacted with.
    </li>
</ul>

<p>
    (Note: the example uses the Enterprise-only <a href="../javascript-grid-filter-set/">Set Filter</a>).
</p>

<?= grid_example('Filter Model', 'filter-model', 'generated', ['enterprise' => true, 'exampleHeight' => 587, 'modules' => ['clientside', 'menu', 'filterpanel', 'columnpanel', 'setfilter']]) ?>

<h2 id="filterComponentInstance">Accessing Individual Filter Component Instances</h2>

<p>
    It is also possible to access the filter components directly if you want to interact with a specific
    filter. This also works for your own custom filters, where you can get a reference to the underlying filtering
    instance (i.e. what was created when ag-Grid called <code>new</code> on your filter). Calling
    <code>api.getFilterInstance(colKey)</code> will return a reference to the filter instance for the column with key
    <code>colKey</code>.
</p>

<?= createSnippet(<<<SNIPPET
// Get a reference to the 'name' filter instance
var filterInstance = gridApi.getFilterInstance('name');
SNIPPET
) ?>

<p>
    All of the methods of the filter are available on the instance. If using a custom filter, any other methods you have
    added will also be present, allowing bespoke behaviour to be added to your filter.
</p>

<p>
    For filters that are created asynchronously, including React 16+ components, <code>getFilterInstance</code> will
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
    After filters have been changed via their API, you must ensure the method <code>gridApi.onFilterChanged()</code> is
    called to tell the grid to filter the rows again. If <code>gridApi.onFilterChanged()</code>
    is not called, the grid will still show the data relevant to the filters before they were updated through the API.
</p>

<?= createSnippet(<<<SNIPPET
// Get a reference to the filter instance
var filterInstance = gridApi.getFilterInstance('name');

// Set the filter model
filterInstance.setModel({
    filterType: 'text',
    type: 'startsWith',
    filter: 'abc'
});

// Tell grid to run filter operation again
gridApi.onFilterChanged();
SNIPPET
) ?>

<h3>Reset Individual Filters</h3>

<p>
    You can reset a filter to its original state by getting the filter instance and setting the model to
    <code>null</code>.
</p>

<?= createSnippet(<<<SNIPPET
// Get a reference to the filter instance
var filterInstance = gridApi.getFilterInstance('name');

// Set the model to null
filterInstance.setModel(null);

// Tell grid to run filter operation again
gridApi.onFilterChanged();
SNIPPET
) ?>

<h3>Example: Accessing Individual Filters</h2>

<p>
   The example below shows how you can interact with an individual filter instance, using the Set Filter as an example.
</p>

<ul>
    <li><code>Get Mini Filter Text</code> will print the text from the Set Filter's Mini Filter to the console.</li>
    <li><code>Save Mini Filter Text</code> will save the Mini Filter text.</li>
    <li><code>Restore Mini Filter Text</code> will restore the Mini Filter text from the saved state.</li>
    <li><code>Reset Filter</code> will reset the filter.</li>
</ul>

<p>
    (Note: the example uses the Enterprise-only <a href="../javascript-grid-filter-set/">Set Filter</a>).
</p>

<?= grid_example('Accessing Individual Filters', 'filter-api', 'generated', ['enterprise' => true, 'exampleHeight' => 624, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
