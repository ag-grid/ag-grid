---
title: "Floating Filter Component"
---

[[only-javascript-or-angular-or-vue]]
|Floating Filter Components allow you to add your own floating filter types to AG Grid. You can create a Custom Floating Filter Component to work alongside one of the grid's Provided Filters, or alongside a Custom Filter.

[[only-react]]
|<video-section id="CxwfX4KodaM" title="React Floating Filters" header="true">
|Floating Filter Components allow you to add your own floating filter types to AG Grid. You can create a Custom Floating Filter Component to work alongside one of the grid's Provided Filters, or alongside a Custom Filter.
|</video-section>


This page focuses on writing your own floating filter components. To see general information about floating filters in AG Grid see [floating filters](/floating-filters/).

## Simple Floating Filter 
 
md-include:simple-floating-filter-javascript.md
md-include:simple-floating-filter-angular.md
md-include:simple-floating-filter-react.md
md-include:simple-floating-filter-vue.md

## Example: Custom Floating Filter

In the following example you can see how the Gold, Silver, Bronze and Total columns have a custom floating filter `NumberFloatingFilter`. This filter substitutes the standard floating filter for a input box that the user can change to adjust how many medals of each column to filter by based on a greater than filter.

Since this example is using standard filters, the object that needs to be passed to the method `onParentFilterChanged()` needs to provide two properties:

- **apply**: If `true` the filter is changed AND applied, otherwise if it is `false`, the filter is only changed. However, this is ignored unless `buttons` contains `'apply'` (i.e. it is ignored unless the Apply button is being used).
- **model**: The model object that represents the new filter state.

If the user removes the content of the input box, the filter is removed.

Note that in this example:

1. The columns with the floating filter are using the standard Number filter as the base filter

1. Since the parent filter is the Number filter, the floating filter methods `onFloatingFilterChanged(parentModel)`, and `currentParentModel()` take and receive model objects that correspond to [the model for the Number filter](/filter-number/#number-filter-model)

1. Since these floating filters are providing a subset of the functionality of their parent filter, which can filter for other conditions which are not `'greaterThan'`, the user is prevented from seeing the parent filter by adding `suppressFilterButton: true` in the `floatingFilterComponentParams` and `suppressMenu: true` in the `colDef`

1. `floatingFilterComponentParams` for all the medal columns have an additional param that is used to customise the font colour of the floating filter input text box.

<grid-example title='Custom Floating Filter' name='custom-floating-filter' type='generated' options='{ "includeNgFormsModule" : true}'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<interface-documentation interfaceName='IFloatingFilterParams' ></interface-documentation>

## Floating Filter Lifecycle

Floating filters do not contain filter state themselves, but show the state of the actual underlying filter. Floating filters are just another view for the main filter. For this reason, the floating filters lifecycle is bound to the visibility of the column; if you hide a column (either set not visible, or horizontally scroll the column out of view) then the floating filter UI component is destroyed. If the column comes back into view, it is created again. This is different to column filters, where the column filter will exist as long as the column exists, regardless of the column's visibility.

For details on how the floating filter interacts with its associated column filter, see the methods `getModelAsString()` and `onFloatingFilterChanged(change)` in the [filter component interface](/component-filter/).

To see examples of the different ways to implement floating filters please refer to the examples below.


## Floating Filter Methods on Provided Filters

When the user interacts with a floating filter, the floating filter must set the state of the main parent filter in order for filter changes to take effect. This is done by the floating filter getting a reference to the parent filter instance and calling a method on it.

If you create your own filter and floating filter, it is up to you which method you expose on the filter for the floating filter to call. This contract is between the filter and the floating filter and doesn't go through the grid.

The Simple Filters (Text, Number, Date) provide methods that the corresponding provided floating filters can call. This information is useful if a) you want to create your own floating filter that is paired with a provided parent filter or b) you are just interested to know how the interaction works to help build your own filters and floating filters.

- **Date, Text and Number Filters:** all these filters provide a method `onFloatingFilterChanged(type: string, value: string)` where `type` is the type (`'lessThan'`, `'equals'`, etc.) and the value is the text value to use (the number and date filters will convert the text to the corresponding type).

- **Set Filter:** The floating set filter is not editable, so no method is exposed on the parent filter for the floating filter to call.

You could also call `setModel()` on the filters as an alternative. For example, you could build your own floating filter for the Set Filter that allows picking all European or Asian countries, or you could provide your own Number floating filter that allows selecting ranges (the provided Number floating filter does not allow editing ranges).

### Example: Custom Filter And Custom Floating Filter

This example extends the previous example by also providing its own custom filter `NumberFilter` in the Gold, Silver, Bronze and Total columns.

In this example it is important to note that:

1. `NumberFilter.getModel()` returns a `number` representing the current greater than filter.
1. `NumberFilter.setModel(model)` takes an object that can be of any type. If the value passed is numeric then the filter gets applied with a condition of greater than.
1. `NumberFloatingFilter.onParentModelChanged(parentModel)` receives the result of `NumberFilter.getModel()` every time the `NumberFilter` model changes
1. `NumberFloatingFilter` calls `params.onFloatingFilterChanged(modelToAccept)` every time the user changes the floating filter value. This will cause an automatic call into `NumberFilter.setModel(modelToAccept)`
1. Since `NumberFilter.onFloatingFilterChanged(change)` is **not** implemented, every time the user changes the input value the filter gets updated automatically. If this method was implemented it would get called every time the floating filter would change, and would be responsible for performing the filtering.

<grid-example title='Custom Filter and Floating Filter' name='custom-filter-and-floating-filter' type='generated' options='{"includeNgFormsModule" : true}'></grid-example>

### Example: Custom Filter And Read-Only Floating Filter

If you want to provide a custom filter but don't want to provide an equivalent custom floating filter, you can implement the method `filter.getModelAsString()` and you will get a read-only floating filter for free.


This example uses the previous custom filter but implementing the `getModelAsString()` method. Note how there are no custom floating filters and yet each column using `NumberFilter` (Gold, Silver, Bronze and Total) has a read-only floating filter that gets updated as you change the values from the main filter.

<grid-example title='Custom Filter Only' name='custom-filter' type='generated'></grid-example>

[[only-angular]]
| ## Sliding Floating Filters
|
| The below example shows how to create a custom floating filter re-using the out-of-the-box Number filter with Angular.
|
| <grid-example title='Angular Floating Filter Component' name='floating-filter-component' type='generated' options='{ "exampleHeight": 370, "extras": ["bootstrap"], "includeNgFormsModule" : true }'></grid-example>

[[only-react]]
| ## Sliding Floating Filters
|
| The below example shows how to create a custom floating filter re-using the out-of-the-box Number filter with React.
|
| <grid-example title='React Floating Filter Component' name='floating-filter-component' type='generated' options='{ "exampleHeight": 370, "onlyShow": "react", "extras": ["bootstrap"] }'></grid-example>
|
| Note that in this example we make use of `useImperativeHandle` for lifecycle methods - please
| see [here](/react-hooks/) for more information.

[[only-vue]]
| ## Sliding  Floating Filters
|
| The below example shows how to create a custom floating filter re-using the out-of-the-box Number filter with Vue.
|
| <grid-example title='Vue Floating Filter Component' name='floating-filter-component' type='generated' options='{ "exampleHeight": 370, "extras": ["bootstrap"] }'></grid-example>

## Complex example with jQuery

The following example illustrates a complex scenario. All the columns have floating filters. The first 6 columns (Athlete to Sport) have the standard provided floating filters. The last 4 (Gold to Total) have custom filters and custom floating filters that use jQuery sliders.

Note that:

- Athlete has a debounce of 2 seconds (`debounceMs: 2000`)
- Age has no debounce (`debounceMs: 0`)
- All the other columns have the standard 500ms debounce

<grid-example title='Custom Complex Filter and Floating Filter' name='custom-complex-filter-and-floating-filter' type='typescript' options='{ "extras": ["jquery", "jqueryui"] }'></grid-example>

