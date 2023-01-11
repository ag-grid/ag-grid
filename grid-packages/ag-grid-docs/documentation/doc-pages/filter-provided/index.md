---
title: "Provided Filters"
---

This section describes the functionality common to all filters that are provided by the grid.

The grid provides four filters out of the box: three [Simple Filters](/filter-provided-simple/) (Text, Number and Date), and an advanced [Set Filter](/filter-set/) which is available in the Enterprise version of the grid.

Follow the links below to learn more about each specific filter:

- [Text](/filter-text/)
- [Number](/filter-number/)
- [Date](/filter-date/)
- [Set Filter](/filter-set/)<enterprise-icon></enterprise-icon>

The rest of this section will cover concepts that are common to every provided filter.

## Structure of Provided Filters

The diagram below outlines the structure of the filters. Each box represents a filter type with the functions listed in it. For example, all provided filters have button logic, but only the Date filter has a Date Comparator or a Date Picker.

<image-caption src="filter-provided/resources/provided-filters.png" alt="Provided Filters" width="52rem" centered="true" constrained="true"></image-caption>

## Provided Filter UI

Each provided filter is displayed in a UI with optional buttons at the bottom.

<image-caption src="filter-provided/resources/filter-content.png" alt="Filter Content" width="18rem" centered="true"></image-caption>

## Provided Filter Params

All the provided filters have the following parameters:

<interface-documentation interfaceName='IProvidedFilterParams' config='{"description":""}' overrideSrc="filter-provided/resources/provided-filters.json"></interface-documentation>

## Provided Filter API

Provided Filters provide the following methods:

<interface-documentation interfaceName='IProvidedFilter' names='["isFilterActive","getModel","setModel","getModelFromUi","applyModel"]'  config='{"description":""}'></interface-documentation>

## Apply, Clear, Reset and Cancel Buttons

Each of the provided filters can optionally include Apply, Clear, Reset and Cancel buttons.

When the Apply button is used, the filter is only applied once the Apply button is pressed. This is useful if the filtering operation will take a long time because the dataset is large, or if using server-side filtering (thus preventing unnecessary calls to the server). Pressing <kbd>Enter</kbd> is equivalent to pressing the Apply button.

The Clear button clears just the filter UI, whereas the Reset button clears the filter UI and removes any active filters for that column.

The Cancel button will discard any changes that have been made in the UI, restoring the state of the filter to match the applied model.

The buttons will be displayed in the order they are specified in the `buttons` array.

The example below demonstrates using the different buttons. It also demonstrates the relationship between the buttons and filter events. Note the following:

- The **Athlete** and **Age** columns have filters with Apply and Reset buttons, but different orders.
- The **Country** column has a filter with Apply and Clear buttons.
- The **Year** column has a filter with Apply and Cancel buttons.
- The **Age** and **Year** columns have `closeOnApply` set to `true`, so the filter popup will be closed immediately when the filter is applied, reset or cancelled. Pressing <kbd>Enter</kbd> will also apply the filter and close the popup.
- `onFilterOpened` is called when the filter is opened.
- `onFilterModified` is called when the filter changes regardless of whether the Apply button is present.
- `onFilterChanged` is called only after a new filter is applied.
- Looking at the console, it can be noted when a filter is changed, the result of `getModel()` and `getModelFromUi()` are different. The first reflects the active filter, while the second reflects what is in the UI (and not yet applied).

<grid-example title='Buttons and Filter Events' name='buttons-and-filter-events' type='generated' options='{ "enterprise": false, "exampleHeight": 560, "modules": ["clientside"] }'></grid-example>

## Applying the UI Model

Provided filters maintain a separate model representing what is shown in the UI, which might change without having yet been applied, for example when an Apply button is present and the user has made changes in the UI but not yet clicked Apply. Calling `getModelFromUi()` will always return a model representing the current UI, whereas `getModel()` will return the applied model that is currently being used for filtering.

If any changes are made in the UI when the Apply button is active, or via other API methods whether the Apply button is active or not, you must call `filterInstance.applyModel()` if you want to ensure the UI is applied.

Applying the model is then typically followed by calling `gridApi.onFilterChanged()` to tell the grid to re-run the filtering.

<snippet>
|// Get a reference to the 'name' filter instance
|const filterInstance = gridOptions.api.getFilterInstance('name');
|
|// Apply the model to ensure any changes in the UI or via API methods are recognised
|filterInstance.applyModel();
|
|// Tell grid to run filter operation again
|gridOptions.api.onFilterChanged();
</snippet>

If no call is made to `filterInstance.applyModel()` then the filter UI will show any changes that have been made, but they won't be reflected in the filter model and therefore won't be reflected in the filtering. This will appear as if the user never hit the Apply button (regardless of whether the Apply button is active or not).
