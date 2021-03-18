---
title: "Set Filter - API"
enterprise: true
---

This section describes how the Set Filter can be controlled programmatically using API calls.

## Set Filter Model

Get and set the state of the Set Filter by getting and setting the model on the filter instance.

<snippet>
|// get filter instance
|const countryFilterComponent = gridOptions.api.getFilterInstance('country');
|
|// get filter model
|const model = countryFilterComponent.getModel();
|
|// set filter model and update
|countryFilterComponent.setModel({ values: ['Spain', 'Ireland', 'South Africa'] });
|
|// refresh rows based on the filter (not automatic to allow for batching multiple filters)
|gridOptions.api.onFilterChanged();
</snippet>

The filter model contains an array of string values where each item in the array corresponds to an element to be selected from the set.

## Set Filter API

The Set Filter has the following API:

<api-documentation sources='["filter-api/resources/filter-api.json", "filter-set-api/resources/set-filter-api.json"]' section='api'></api-documentation>

It is important to note that when updating the Set Filter through the API, it is up to the developer to call `filterInstance.applyModel()` to apply the changes that have been made to the model and then `gridOptions.api.onFilterChanged()` at the end of the interaction with the filter.


If no call is made to `filterInstance.applyModel()` then the filter UI will show any changes, but they won't be reflected in the filter model. This will appear as if the user never hit the Apply Button (regardless of whether the Apply Button is active or not).


If no call to `gridOptions.api.onFilterChanged()` is provided the grid will still show the data relevant to the filter before it was updated through the API.

In the example below, you can see how the filter for the Athlete column is modified through the API and how at the end of the interaction a call to `gridOptions.api.onFilterChanged()` is performed.

<grid-example title='Set Filter API' name='set-filter-api' type='generated' options='{ "enterprise": true, "exampleHeight": 570, "modules": ["clientside", "setfilter", "menu", "filterpanel"] }'></grid-example>

