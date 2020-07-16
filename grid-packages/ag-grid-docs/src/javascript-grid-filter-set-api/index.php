<?php
$pageTitle = "Set Filter - API";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter - API</h1>

<p class="lead">
    This section describes how the Set Filter can be controlled programmatically using API calls.
</p>

<h2>Set Filter Model</h2>

<p>
    Get and set the state of the Set Filter by getting and setting the model on the filter instance.
</p>

<?= createSnippet(<<<SNIPPET
// get filter instance (Note - React users must use the async version
// of this method by passing a callback parameter)
var countryFilterComponent = gridOptions.api.getFilterInstance('country');

// get filter model
var model = countryFilterComponent.getModel();

// set filter model and update
countryFilterComponent.setModel({ values: ['Spain', 'Ireland', 'South Africa'] });

gridApi.onFilterChanged();
SNIPPET
) ?>

<p>
    The filter model contains an array of string values where each item in the array corresponds to an
    element to be selected from the set.
</p>

<h2>Set Filter API</h2>

<p>
    The Set Filter has the following API:
</p>

<?php createDocumentationFromFiles(['../javascript-grid-filter-api/filterApi.json', '../javascript-grid-filter-provided/providedFilters.json', 'setFilterApi.json'], 'api') ?>

<p>
    It is important to note that when updating the Set Filter through the API, it is up to the developer to call
    <code>filterInstance.applyModel()</code> to apply the changes that have been made to the model and then
    <code>gridOptions.api.onFilterChanged()</code> at the end of the interaction with the filter.
</p>

<p>
    If no call is made to <code>filterInstance.applyModel()</code> then the filter UI will show any changes, but
    they won't be reflected in the filter model. This will appear as if the user never hit the Apply Button (regardless
    of whether the Apply Button is active or not).
</p>

<p>
    If no call to <code>gridOptions.api.onFilterChanged()</code> is provided the grid will still show the data relevant
    to the filter before it was updated through the API.
</p>

<p>
    In the example below, you can see how the filter for the Athlete column is modified through the API and how at the
    end of the interaction a call to <code>gridOptions.api.onFilterChanged()</code> is performed.
</p>

<?= grid_example('Set Filter API', 'set-filter-api', 'generated', ['enterprise' => true, 'exampleHeight' => 570]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
