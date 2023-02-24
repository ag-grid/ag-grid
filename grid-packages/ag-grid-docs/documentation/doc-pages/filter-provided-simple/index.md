---
title: "Simple Filters"
---

The grid provides three Simple Filters for filtering strings, numbers and dates.

<div style="display: flex; justify-content: space-around;">
    <image-caption src="filter-provided-simple/resources/text-filter.png" alt="Text Filter" width="12.5rem" descriptionTop="true"><strong>Text Filter</strong></image-caption>
    <image-caption src="filter-provided-simple/resources/number-filter.png" alt="Number Filter" width="12.5rem" descriptionTop="true"><strong>Number Filter</strong></image-caption>
    <image-caption src="filter-provided-simple/resources/date-filter.png" alt="Date Filter" width="12.5rem" descriptionTop="true"><strong>Date Filter</strong></image-caption>
</div>

Each of the filters works in a similar way. This page describes the common parts of the Simple Filters.

### Example: Simple Filters

The example below demonstrates all three Simple Filters working. Note the following:

- The **Athlete** column has a Text Filter.
- The **Age** column has a Number Filter.
- The **Date** column has a Date Filter.
- `filter=false` is set on the **Total** column to disable the filter.

<grid-example title='Provided Simple' name='provided-simple' type='generated' options='{ "exampleHeight": 560 }'></grid-example>

## Simple Filter Conditions

Each Simple Filter follows the same layout. It consists of one or more Filter Conditions separated by zero or more Join Operators.

The only layout difference is the type of input field presented to the user: for Text and Number Filters a text field is displayed, whereas for Date Filters a date picker field is displayed.

<image-caption src="filter-provided-simple/resources/filter-panel-components.png" alt="Filter Panel Component" width="40rem" centered="true"></image-caption>

### Filter Options

Each filter provides a dropdown list of filter options to select from. Each filter option represents a filtering strategy, e.g. 'equals', 'not equals', etc.

Each filter's default [Filter Options](#simple-filter-options) are listed below, as well as information on [Defining Custom Filter Options](#custom-filter-options).

### Filter Value

Each filter option takes zero (a possibility with custom options), one (for most) or two (for 'in range') values. The value type depends on the filter type, e.g. the Date Filter takes Date values.

### Number of Conditions

By default each filter initially only displays one Filter Condition. When the user completes a Filter Condition, another Filter Condition becomes visible. Similarly, when a user clears a Filter Condition, the subsequent Filter Conditions are cleared and hidden.

The maximum number of Filter Conditions can be controlled by setting the Filter Parameter `maxNumConditions` (the default value is two).

It is also possible to always display a certain number of Filter Conditions by setting the Filter Parameter `numAlwaysVisibleConditions`. In this case, Filter Conditions will be disabled until the previous Filter Conditions have been entered.

<interface-documentation interfaceName='ISimpleFilterParams' config='{"description":""}' names='["maxNumConditions", "numAlwaysVisibleConditions"]'></interface-documentation>

### Join Operator

The Join Operator decides how the Filter Conditions are joined, using either `AND` or `OR`. All Join Operators have the same value, with only the first one being editable when there are multiple.

### Example: Simple Filter Conditions

The following example demonstrates Filter Condition configuration that can be applied to any Simple Filter.

- The **Athlete** column shows a Text Filter with default behaviour for all options.

- The **Country** column shows a Text Filter with `filterOptions` set to show a different list of available options, and `defaultOption` set to change the default option selected.

- The **Sport** column shows a Text Filter with `maxNumConditions` set to `5` so that up to five conditions can be entered.

- The **Age** column has a Number Filter with `numAlwaysVisibleConditions` set to `2` so that two conditions are always shown. The `defaultJoinOperator` is also set to `'OR'` rather than the default (`'AND'`).

- The **Date** column has a Date Filter with `maxNumConditions` set to `1`, so that only the first condition is shown.

<grid-example title='Simple Filter Options' name='simple-filter-options' type='generated' options='{ "exampleHeight": 560 }'></grid-example>

## Simple Filter Options

Each simple filter presents a list of options to the user. The list of options for each filter are as follows:

| Option Name             | Option Key            | Supported Filters   |
| ----------------------- | --------------------- | ------------------- |
| Equals                  | `equals`              | Text, Number, Date  |
| Not Equals              | `notEqual`            | Text, Number, Date  |
| Contains                | `contains`            | Text                |
| Not Contains            | `notContains`         | Text                |
| Starts With             | `startsWith`          | Text                |
| Ends With               | `endsWith`            | Text                |
| Less Than               | `lessThan`            | Number, Date        |
| Less Than or Equal      | `lessThanOrEqual`     | Number              |
| Greater Than            | `greaterThan`         | Number, Date        |
| Greater Than or Equal   | `greaterThanOrEqual`  | Number              |
| In Range                | `inRange`             | Number, Date        |
| Blank                   | `blank`               | Text, Number, Date  |
| Not blank               | `notBlank`            | Text, Number, Date  |
| Choose One              | `empty`               | Text, Number, Date  |

Note that the `empty` filter option is primarily used when creating [Custom Filter Options](/filter-provided-simple/#custom-filter-options). When 'Choose One' is displayed, the filter is not active.

### Default Filter Options

Each of the three filter types has the following default options and default selected option.

| Filter   | Default List of Options                                                                           | Default Selected Option   |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------- |
| Text     | Contains, Not Contains, Equals, Not Equals, Starts With, Ends With.                               | Contains                  |
| Number   | Equals, Not Equals, Less Than, Less Than or Equal, Greater Than, Greater Than or Equal, In Range. | Equals                    |
| Date     | Equals, Greater Than, Less Than, Not Equals, In Range.                                            | Equals                    |


## Simple Filters Parameters

Simple Filters are configured though the `filterParams` attribute of the column definition:

<interface-documentation interfaceName='ISimpleFilterParams' config='{"description":""}' overrideSrc="filter-provided-simple/resources/simple-filters.json"></interface-documentation>

Additional parameters are also available depending on the type of filter being used. See each type for the full list of parameters available: [Text](/filter-text/), [Number](/filter-number/), [Date](/filter-date/).

## Simple Filter Models

When saving or restoring state on a filter, the Filter Model is used. The Filter Model represents the state of the filter. For example, the code below first gets and then sets the Filter Model for the Athlete column:

<snippet>
|// get filter instance
|const filterInstance = gridOptions.api.getFilterInstance('athlete');
|
|// get filter model
|const model = filterInstance.getModel();
|
|// set filter model and update
|filterInstance.setModel({
|    type: 'endsWith',
|    filter: 'thing'
|});
|
|// refresh rows based on the filter (not automatic to allow for batching multiple filters)
|gridOptions.api.onFilterChanged();
</snippet>

This section explains what the Filter Model looks like for each of the simple filters. The interface used by each filter type is as follows:

[[note]]
| The best way to understand what the Filter Models look like is to set a filter via the
| UI and call `api.getFilterModel()` in your console. You can then see what the model looks like for different variations of the filters.

<interface-documentation interfaceName='TextFilterModel' config='{"hideHeader":false, "headerLevel": 3}'></interface-documentation>

<interface-documentation interfaceName='NumberFilterModel' config='{"hideHeader":false, "headerLevel": 3}'></interface-documentation>

<interface-documentation interfaceName='DateFilterModel' config='{"hideHeader":false, "headerLevel": 3}'></interface-documentation>

Examples of filter model instances are as follows:

```js
// number filter with one condition, with equals type
const numberLessThan35 = {
    filterType: 'number',
    type: 'lessThan',
    filter: 35
};
```

```js
// number filter with one condition, with inRange type
const numberBetween35And40 = {
    filterType: 'number',
    type: 'inRange',
    filter: 35,
    filterTo: 40
};
```

[[note]]
| The `filterType` is not used by the grid when you call `setFilterModel()`. It is provided for information purposes only when you get the filter model. This is useful if you are doing server-side filtering, where the filter type may be used in building back-end queries.

If the filter has both Condition 1 and Condition 2 set, then two instances of the model are created and wrapped inside a Combined Model. A combined model looks as follows:

```ts
// A filter combining two conditions
// M is either TextFilterModel, NumberFilterModel or DateFilterModel
interface ICombinedSimpleModel<M> {
    // the filter type: date, number or text
    filterType: string;

    operator: JoinOperator;

    // two instances of the filter model
    condition1: M;
    condition2: M;
}

type JoinOperator = 'AND' | 'OR';
```

An example of a filter model with two conditions is as follows:

```js
// number filter with two conditions, both are equals type
const numberEquals18OrEquals20 = {
    filterType: 'number',
    operator: 'OR',
    condition1: {
        filterType: 'number',
        type: 'equals',
        filter: 18
    },
    condition2: {
        filterType: 'number',
        type: 'equals',
        filter: 18
    }
};
```

## Custom Filter Options

For applications that have bespoke filtering requirements, it is also possible to add new custom filtering options to the number, text and date filters. For example, a 'Not Equal (with Nulls)' filter option could be included alongside the built in 'Not Equal' option.

Custom filter options are supplied to the grid via `filterParams.filterOptions` and must conform to the `IFilterOptionDef` interface:

<interface-documentation interfaceName='IFilterOptionDef' ></interface-documentation>

The `displayKey` should contain a unique key value that doesn't clash with the built-in filter keys. A default `displayName` should also be provided but can be replaced by a locale-specific value using a [getLocaleText](/localisation/#locale-callback).

The custom filter logic is implemented through the `predicate` function, which receives the `filterValues` typed by the user along with the `cellValue` from the grid, and returns `true` or `false`.

The number of `filterValues` and corresponding inputs is controlled by the optional property `numberOfInputs`:
- If set to `0`  all inputs are hidden, and an empty array of `filterValues` is provided to the `predicate` function.
- If unspecified or set to `1` a single input is displayed, and one-element array of `filterValues` are provided to the `predicate` function.
- If set to `2` two inputs are displayed, and a two-element array of `filterValues` is provided to the `predicate` function.

Custom `FilterOptionDef`s can be supplied alongside the built-in filter option `string` keys as shown below:

<snippet>
|const gridOptions = {
|    columnDefs: [
|        {
|            field: 'age',
|            filter: 'agNumberColumnFilter',
|            filterParams: {
|                filterOptions: [
|                    'lessThan',
|                    {
|                        displayKey: 'lessThanWithNulls',
|                        displayName: 'Less Than with Nulls',
|                        predicate: ([filterValue], cellValue) => cellValue == null || cellValue < filterValue,
|                    },
|                    'greaterThan',
|                    {
|                        displayKey: 'greaterThanWithNulls',
|                        displayName: 'Greater Than with Nulls',
|                        predicate: ([filterValue], cellValue) => cellValue == null || cellValue > filterValue,
|                    },
|                    {
|                        displayKey: 'betweenExclusive',
|                        displayName: 'Between (Exclusive)',
|                        predicate: ([fv1, fv2], cellValue) => cellValue == null || fv1 < cellValue && fv2 > cellValue,
|                        numberOfInputs: 2,
|                    }
|                ]
|            }
|        }
|    ]
|}
</snippet>

The following example demonstrates several custom filter options:

- The **Athlete** column contains four custom filter options managed by a [Text Filter](/filter-text/):
  - `Starts with "A"` and `Starts with "N"` have no inputs; their predicate function is provided zero values.
  - `Regular Expression` has one input; its predicate function is provided one value.
  - `Between (Exclusive)` has two inputs; its predicate function is provided two values.
- The **Age** column contains five custom filter options managed by a [Number Filter](/filter-number/):
  - `Even Numbers`, `Odd Numbers` and `Blanks` have no inputs; their predicate function is provided zero values.
  - `Age 5 Years Ago` has one input; its predicate function is provided one value.
  - `Between (Exclusive)` has two inputs; its predicate function is provided two values.
  - `Choose One` is a built-in option and acts as an inactive filter option.
  - The `maxNumConditions=§` option is used to only display one Filter Condition.
- The **Date** column contains three custom filter options managed by a [Date Filter](/filter-date/):
  - `Equals (with Nulls)` has one inputs; its predicate function is provided one value.
  - `Leap Year` has no inputs; its predicate function is provided zero values.
  - `Between (Exclusive)` has two inputs; its predicate function is provided two values.
  - NOTE: a custom `comparator` is still required for the built-in date filter options, i.e. `equals`.
- The **Country** column includes:
    - a custom `* Not Equals (No Nulls) *` filter which also removes null values.
    - it also demonstrates how localisation can be achieved via the `gridOptions.getLocaleText(params)` callback function, where the default value is replaced for the filter option `'notEqualNoNulls'`.
- Saving and restoring custom filter options via `api.getFilterModel()` and `api.setFilterModel()` can be tested using the provided buttons.

<grid-example title='Custom Filter Options' name='custom-filter-options' type='generated'></grid-example>

## Blank Cells (Date and Number Filters)

If the row data contains blanks (i.e. `null` or `undefined`), by default the row won't be included in filter results. To change this, use the filter params `includeBlanksInEquals`, `includeBlanksInLessThan`, `includeBlanksInGreaterThan` and `includeBlanksInRange`. For example, the code snippet below configures a filter to include `null` for equals, but not for less than, greater than or in range:

```js
const filterParams = {
    includeBlanksInEquals: true,
    includeBlanksInLessThan: false,
    includeBlanksInGreaterThan: false,
    includeBlanksInRange: false,
};
```

In the following example you can filter by age or date and see how blank values are included. Note the following:

- Columns **Age** and **Date** have both `null` and `undefined` values resulting in blank cells.
- Toggle the controls on the top to see how `includeBlanksInEquals`, `includeBlanksInLessThan`, `includeBlanksInGreaterThan` and `includeBlanksInRange` impact the search result.

<grid-example title='Null Filtering' name='null-filtering' type='typescript' options='{ "exampleHeight": 310 }'></grid-example>

## Data Updates

Grid data can be updated in a number of ways, including:
- [Cell Editing](/cell-editing/).
- [Updating Data](/data-update/).
- [Clipboard Operations](/clipboard/).

Simple filters are not affected by data changes, as is demonstrated by the following example:
- Perform some filtering using the configured simple filters, such as filtering by **Age** equals
  `24`.
- Click the **Jumble Ages** button to update the grid data by jumbling values in the **Age** column
  between rows.
- Observe that filters remain unchanged, but the displayed rows change to those now assigned an age
  of `24`.

<grid-example title='Date Updates' name='simple-data-update' type='generated' options='{ "enterprise": false, "modules": ["clientside"] }'></grid-example>

## Style Header on Filter

Each time a filter is applied to a column the CSS class `ag-header-cell-filtered` is added to the header. This can be used for adding style to headers that are filtered.

In the example below, we've added some styling to `ag-header-cell-filtered`, so when you filter a column you will notice the column header change.

<grid-example title='Style Header' name='style-header-on-filter' type='generated' options='{ "exampleHeight": 520 }'></grid-example>

## Customising Filter Placeholder Text

Filter placeholder text can be customised on a per column basis using `filterParams.filterPlaceholder` within the grid option `columnDefs`. The placeholder can be either a string or a function as shown in the snippet below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'age',
            filter: 'agNumberColumnFilter',
            filterParams: {
                filterPlaceholder: 'Age...'
            }
        },
        {
            field: 'total',
            filter: 'agNumberColumnFilter',
            filterParams: {
                filterPlaceholder: (params) => {
                    const { filterOption, placeholder } = params;
                    return `${filterOption} ${placeholder}`;
                }
            }
        }
    ]
}
</snippet>

When `filterPlaceholder` is a function, the parameters are made up of the following:

<interface-documentation interfaceName='IFilterPlaceholderFunctionParams' config='{"description":""}'></interface-documentation>

The following example shows the various ways of specifying filter placeholders. Click on the filter menu for the different columns in the header row to see the following:

* `Athlete` column shows the default placeholder of `Filter...` with no configuration
* `Country` column shows the string `Country...` for all filter options
* `Sport` column shows the filter option key with the default placeholder eg, for the `Contains` filter option, it shows `contains - Filter...`. The [filter option keys](#simple-filter-options) are listed in the table above.
* `Total` column shows the filter option name with the suffix `total` eg, for the `Equals` filter option, it shows `Equals total`. The [filter option names](#simple-filter-options) are listed in the table above.

<grid-example title='Filter placeholder text' name='filter-placeholder-text' type='generated' options='{ "exampleHeight": 560 }'></grid-example>
