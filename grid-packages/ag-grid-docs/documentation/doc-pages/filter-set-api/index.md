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

The `ISetFilter` interface defines the public API for the Set Filter.

<interface-documentation interfaceName='ISetFilter' exclude='["getModelFromUi", "applyModel", "doesFilterPass", "onNewRowsLoaded", "onAnyFilterChanged", "getModelAsString"]' overrideSrc='filter-set-api/resources/iSetFilter.json'></interface-documentation>
 
It is important to note that when updating the Set Filter through the API, it is up to the developer to call `filterInstance.applyModel()` to apply the changes that have been made to the model and then `gridOptions.api.onFilterChanged()` at the end of the interaction with the filter.


If no call is made to `filterInstance.applyModel()` then the filter UI will show any changes, but they won't be reflected in the filter model. This will appear as if the user never hit the Apply Button (regardless of whether the Apply Button is active or not).


If no call to `gridOptions.api.onFilterChanged()` is provided the grid will still show the data relevant to the filter before it was updated through the API.

In the example below, you can see how the filter for the Athlete column is modified through the API and how at the end of the interaction a call to `gridOptions.api.onFilterChanged()` is performed.

<grid-example title='Set Filter API' name='set-filter-api' type='mixed' options='{ "enterprise": true, "exampleHeight": 570, "modules": ["clientside", "setfilter", "menu", "filterpanel"] }'></grid-example>

### Enabling Case-Sensitivity

By default the API is case-insensitive. You can enable case sensitivity by using the `caseSensitive: true` filter parameter:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: {
                caseSensitive: true
            }
        }
    ]
}
</snippet>

[[note]]
| The `caseSensitive` option also affects [Mini-Filter](/filter-set-mini-filter/#enabling-case-sensitive-searches) searches and the values presented in the [Filter List](/filter-set-filter-list/#enabling-value-case-sensitivity).


The following example demonstrates the difference in behaviour between `caseSensitive: false` (the default) and `caseSensitive: true`:
- With `caseSensitive: false` (the default):
  - `setModel()` will perform **case-insensitive** matching against available values to decide what is enabled in the Filter List.
  - `setFilterValues()` will override the available values and force the case of the presented values in the Filter List to those provided.
    - Selected values will be maintained based upon **case-insensitive** matching.
- With `caseSensitive: true`:
  - `setModel()` will perform **case-sensitive** matching against available values to decide what is enabled in the Filter List.
  - `setFilterValues()` will override the available values and force the case of the presented values in the Filter List to those provided.
    - Selected values will be maintained based upon **case-sensitive** matching.
- In both cases `getModel()` and `getFilterValues()` will return the values with casing that matches those displayed in the Filter List.

<grid-example title='Set Filter API - Case Sensitivity' name='set-filter-api-case-sensitive' type='mixed' options='{ "enterprise": true, "exampleHeight": 570, "modules": ["clientside", "setfilter", "menu", "filterpanel"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Applying Provided Filters](/filter-provided/).
