---
title: "Shared Simple Filter Configuration"
---

This section describes the configuration shared by the three Simple Filters provided by the grid - [Text Filter](/filter-text/), [Number Filter](/filter-number/) and [Date Filter](/filter-date/).

## Simple Filter Parts

Each Simple Filter follows the same layout. The only layout difference is the type of input field presented to the user: for Text and Number Filters a text field is displayed, whereas for Date Filters a date picker field is displayed.

<image-caption src="filter-simple-configuration/resources/filter-panel-components.png" alt="Filter Panel Component" width="40rem" centered="true"></image-caption>

### Filter Options

Each filter provides a dropdown list of filter options to select from. Each filter option represents a filtering strategy, e.g. 'equals', 'not equals', etc.

Each filter's default filter options can be found on their respective pages:
- [Text Filter Options](/filter-text/#text-filter-options)
- [Number Filter Options](/filter-number/#number-filter-options)
- [Date Filter Options](/filter-date/#date-filter-options)

Information on defining [Custom Filter Options](#custom-filter-options) can be found below.

### Filter Value

Each filter option takes zero (a possibility with custom options), one (for most) or two (for 'in range') values. The value type depends on the filter type, e.g. the Date Filter takes Date values.

### Condition 1 and Condition 2

Each filter initially only displays Condition 1. When the user completes the Condition 1 section of the filter, Condition 2 becomes visible.

### Join Operator

The Join Operator decides how Condition 1 and Condition 2 are joined, using either `AND` or `OR`.

### Example: Simple Filter Options

The following example demonstrates those configuration options that can be applied to any Simple Filter.

- The **Athlete** column shows a Text Filter with default behavior for all options.

- The **Country** column shows a Text Filter with `filterOptions` set to show a different list of available options, and `defaultOption` set to change the default option selected.

- The **Age** column has a Number Filter with `alwaysShowBothConditions` set to `true` so that both condition are always shown. The `defaultJoinOperator` is also set to `'OR'` rather than the default (`'AND'`).

- The **Date** column has a Date Filter with `suppressAndOrCondition` set to `true`, so that only the first condition is shown.

<grid-example title='Simple Filter Options' name='simple-filter-options' type='generated' options='{ "exampleHeight": 560 }'></grid-example>

### Custom Filter Options

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
  - The `suppressAndOrCondition=true` option is used to suppress the join operator panel and condition 2.
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

## Simple Filter Models

All Simple Filters follow a similar [Filter Model](/filter-column/#filter-model) structure.

When a single condition is set in the filter, then the model will consist of that Filter Model type:
- [Text Filter Model](/filter-text/#text-filter-model)
- [Number Filter Model](/filter-number/#number-filter-model)
- [Date Filter Model](/filter-date/#date-filter-model)

If the filter has both Condition 1 and Condition 2 set, then two instances of the model are created and wrapped inside a Combined Model. A combined model looks as follows:

```ts
// A filter combining two conditions
// M is either TextFilterModel, NumberFilterModel or DateFilterModel
interface ICombinedSimpleModel<M> {
    // the filter type: date, number or text
    filterType: string;

    operator: JoinOperator;

    // two instances of the Filter Model
    condition1: M;
    condition2: M;
}

type JoinOperator = 'AND' | 'OR';
```

An example of a Filter Model with two conditions is as follows:

```js
// Number Filter with two conditions, both are equals type
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

<grid-example title='Filter Placeholder Text' name='filter-placeholder-text' type='generated' options='{ "exampleHeight": 560 }'></grid-example>

## Next Up

Continue to the next section to learn about the [Set Filter](/filter-set/).
