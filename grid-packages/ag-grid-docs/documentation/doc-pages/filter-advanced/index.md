---
title: "Advanced Filter"
enterprise: true
---

The Advanced Filter allows for complex filter conditions to be entered across columns in a single type-ahead input, as well as within a hierarchical visual builder.

## Enabling Advanced Filter

The Advanced Filter is enabled by setting the property `enableAdvancedFilter = true`. By default, the Advanced Filter is displayed between the column headers and the grid rows, where the [Floating Filters](/floating-filters/) would be displayed if they were enabled.

<snippet>
const gridOptions = {
    enableAdvancedFilter: true,
}
</snippet>

The following example demonstrates the Advanced Filter:
- Start typing `athlete` into the Advanced Filter input. As you type, the list of suggested column names will be filtered down.
- Select the `Athlete` entry by pressing <kbd>↵ Enter</kbd> or <kbd>⇥ Tab</kbd>, or using the mouse to click on the entry.
- Select the `contains` entry in a similar way.
- After the quote, type `michael` followed by an end quote (`"`).
- Press <kbd>↵ Enter</kbd> or click the `Apply` button to execute the filter.
- The rows are now filtered to contain only **Athlete**s with names containing `michael`.
- Try out each of the columns to see how the different [Cell Data Types](/cell-data-types/) are handled.
- Complex filter expressions can be built up by using `AND` and `OR` along with brackets - `(` and `)`.

<grid-example title='Advanced Filter' name='advanced-filter' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "advancedfilter"] }'></grid-example>

<note>Advanced Filter and Column Filters cannot be active at the same time. Enabling Advanced Filter will disable Column Filters.</note>

## Advanced Filter Builder

As well as typing into the Advanced Filter input, Advanced Filters can also be set by using the Advanced Filter Builder. This displays a hierarchical view of the filter, and allows the different filter parts to be set using dropdowns and inputs. It also allows for filter conditions to be added, deleted and reordered.

The Advanced Filter Builder can be launched by clicking the `Builder` button next to the Advanced Filter input.

The following example demonstrates the Advanced Filter Builder:
- Click on any of the dropdown pills to change the join operators, columns and filter options.
- Click on the value pills to change the filter values.
- Use the drag handles to move the filter conditions or groups around.
- Use the add and remove buttons to create new conditions or delete existing ones.
- If the filter is valid (and does not match the already applied filter), click the `Apply` button to apply the filter.

<grid-example title='Advanced Filter Builder' name='advanced-filter-builder' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "advancedfilter"] }'></grid-example>

## Configuring Columns

For a column to appear in the Advanced Filter, it needs to have `filter: true` (or set to a non-null and non-false value).

The type of the filter options displayed is based on the [Cell Data Type](/cell-data-types/) of the column.

The different properties that can be set for each column are explained in the sections below, and demonstrated in the following example:
- The **Age** column is not available in the filter as `filter = false`.
- The **Sport** column is not available in the filter by default as hidden columns are excluded.
- After clicking **Include Hidden Columns**, the **Sport** column is available in the filter.
- The **Group** column does not appear in the filter, but its underlying column - **Country** - always appears.
- The **Athlete** column has Filter Params defined, so that it only shows the `contains` option and is case sensitive.
- The **Gold**, **Silver** and **Bronze** columns in the **Medals (-)** column group have a `headerValueGetter` defined and use the `location` property to have a different name in the filter (with a `(-)` suffix).

<grid-example title='Configuring Columns' name='configuring-columns' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "rowgrouping", "advancedfilter"] }'></grid-example>

### Including Hidden Columns

By default, hidden columns do not appear in the Advanced Filter. To make hidden columns appear, set `includeHiddenColumnsInAdvancedFilter = true`.

<api-documentation source='grid-options/properties.json' section='filter' names='["includeHiddenColumnsInAdvancedFilter"]'></api-documentation>

### Row Grouping

When [Row Grouping](/grouping/), group columns will not appear in the Advanced Filter. The underlying columns will always appear, even if hidden.

### Column Names

The name by which columns appear in the Advanced Filter can be configured by using a [Header Value Getter](/value-getters/#header-value-getters) and checking for `location = 'advancedFilter'`.

### Filter Parameters

Certain properties can be set by using `colDef.filterParams`.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filterParams: {
                // perform case sensitive search
                caseSensitive: true,
                // limit options to `contains` only
                filterOptions: ['contains'],
            }
        }
    ]
}
</snippet>

For all [Cell Data Types](/cell-data-types/), the available filter options can be set via `filterOptions`.

The available options are as follows:

| Option Name             | Option Key            | Cell Data Type                                              |
| ----------------------- | --------------------- | ----------------------------------------------------------- |
| contains                | `contains`            | `text`, `object`                                            |
| does not contain        | `notContains`         | `text`, `object`                                            |
| equals                  | `equals`              | `text`, `object`                                            |
| =                       | `equals`              | `number`, `date`, `dateString`                              |
| not equal               | `notEqual`            | `text`, `object`                                            |
| !=                      | `notEqual`            | `number`, `date`, `dateString`                              |
| begins with             | `startsWith`          | `text`, `object`                                            |
| ends with               | `endsWith`            | `text`, `object`                                            |
| is blank                | `blank`               | `text`, `number`, `boolean`, `date`, `dateString`, `object` |
| is not blank            | `notBlank`            | `text`, `number`, `boolean`, `date`, `dateString`, `object` |
| >                       | `greaterThan`         | `number`, `date`, `dateString`                              |
| >=                      | `greaterThanOrEqual`  | `number`, `date`, `dateString`                              |
| <                       | `lessThan`            | `number`, `date`, `dateString`                              |
| \<=                      | `lessThanOrEqual`     | `number`, `date`, `dateString`                              |
| is true                 | `true`                | `boolean`                                                   |
| is false                | `false`               | `boolean`                                                   |

For `text` and `object` Cell Data Types, `caseSensitive = true` can be set to enable case sensitivity.

For `number`, `date` and `dateString` Cell Data Types, the following properties can be set to include blank values for the relevant options:
- `includeBlanksInEquals = true`
- `includeBlanksInLessThan = true`
- `includeBlanksInGreaterThan = true`

These settings only apply when using the Client-Side Row Model. You need to implement support for these in your server-side filtering logic when using the Server-Side Row Model.

## Filter Model / API

The Advanced Filter model describes the current state of the Advanced Filter. This is represented by an `AdvancedFilterModel`, which is either a `ColumnAdvancedFilterModel` for a single condition, or a `JoinAdvancedFilterModel` for multiple conditions:

<interface-documentation interfaceName='JoinAdvancedFilterModel' config='{"description":""}'></interface-documentation>

For example, the Advanced Filter `([Age] > 23 OR [Sport] ends with "ing") AND [Country] contains "united"` would be represented by the following model:

```js
const advancedFilterModel = {
    filterType: 'join',
    type: 'AND',
    conditions: [
      {
        filterType: 'join',
        type: 'OR',
        conditions: [
          {
            filterType: 'number',
            colId: 'age',
            type: 'greaterThan',
            filter: 23,
          },
          {
            filterType: 'text',
            colId: 'sport',
            type: 'endsWith',
            filter: 'ing',
          }
        ]
      },
      {
        filterType: 'text',
        colId: 'country',
        type: 'contains',
        filter: 'united',
      }
    ]
};
```

The Advanced Filter Model can be retrieved via the API method `getAdvancedFilterModel`, and set via the API method `setAdvancedFilterModel`.

<api-documentation source='grid-api/api.json' section='filter' names='["getAdvancedFilterModel", "setAdvancedFilterModel"]'></api-documentation>

The Advanced Filter Model and API methods are demonstrated in the following example:
- Clicking `Save Advanced Filter Model` will save the current Advanced Filter.
- Clicking `Restore Advanced Filter Model` will restore the previously saved Advanced Filter.
- Clicking `Set Custom Advanced Filter Model` will set `[Gold] >= 1`.
- Clicking `Clear Advanced Filter` will clear the current Advanced Filter.

<grid-example title='Advanced Filter Model / API' name='advanced-filter-model-api' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "advancedfilter"] }'></grid-example>

## Advanced Filter Parent

By default the Advanced Filter is displayed underneath the Column Headers, where the Floating Filters would normally appear.

It is possible to instead display the Advanced Filter outside of the grid (such as above it). This can be done by setting the grid option `advancedFilterParent` and providing it with a DOM element to contain the filter.

<api-documentation source='grid-options/properties.json' section='filter' names='["advancedFilterParent"]'></api-documentation>

The [Popup Parent](https://localhost:8000/javascript-data-grid/context-menu/#popup-parent) must also be set to an element that contains both the Advanced Filter parent and the grid.

The following example demonstrates displaying the Advanced Filter outside of the grid:
- The Advanced Filter parent is set using an element directly above the grid.
- Popup Parent is set to an element containing both the grid and the Advanced Filter parent.

<grid-example title='External Parent' name='external-parent' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "advancedfilter"] }'></grid-example>

## Configuring Advanced Filter Builder

The Advanced Filter Builder can be configured using the `IAdvancedFilterBuilderParams` interface:

<interface-documentation interfaceName='IAdvancedFilterBuilderParams' config='{"description":"", "sortAlphabetically":"true"}'></interface-documentation>

The params can be set via the grid option `advancedFilterBuilderParams`:

<api-documentation source='grid-options/properties.json' section='filter' names='["advancedFilterBuilderParams"]'></api-documentation>

As well as using the button in the Advanced Filter, it's possible to launch the Advanced Filter Builder via the `showAdvancedFilterBuilder` grid API method:

<api-documentation source='grid-api/api.json' section='filter' names='["showAdvancedFilterBuilder"]'></api-documentation>

When the Advanced Filter Builder is shown or hidden, the `advancedFilterBuilderVisibleChanged` event is fired:

<api-documentation source='grid-events/events.json' section='filter' names='["advancedFilterBuilderVisibleChanged"]'></api-documentation>

The following example demonstrates configuring the Advanced Filter Builder:
- The `Advanced Filter Builder` button displays the Advanced Filter Builder via the API method `showAdvancedFilterBuilder`.
- The `advancedFilterBuilderVisibleChanged` event is used to toggle the disabled status of the `Advanced Filter Builder` button.
- The `showMoveButtons` param is set in the `advancedFilterBuilderParams`, which displays buttons allowing the filter rows to be moved up and down (including via keyboard navigation).

<grid-example title='Configuring Advanced Filter Builder' name='configuring-advanced-filter-builder' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "advancedfilter"], "extras": ["fontawesome"] }'></grid-example>

## Cell Data Type Handling

All of the [Cell Data Types](/cell-data-types) are supported in the Advanced Filter. The behaviour of each is described below.

- **Text** - The value in the input is compared against the cell value before any [Value Formatters](/value-formatters/) are applied (similar to the [Text Filter](/filter-text/)). To change the value being compared against, a [Filter Value Getter](/value-getters/#filter-value-getters) can be used.
- **Number** - The value in the input is compared against the cell value (like in the [Number Filter](/filter-number/)).
- **Boolean** - No values are displayed for booleans as the filter option is used instead.
- **Date** - The value in the input is converted to a `Date` via the [Value Parser](/value-parsers/#value-parser).
- **Date String** - The value in the input is converted to a `Date` using the [Value Parser](/value-parsers/#value-parser) and the [Date Parser](/cell-data-types/#date-as-string-data-type-definition). This is compared against the cell values, which are also converted using the Date Parser.
- **Object** - The value in the input is compared against the values returned by the [Filter Value Getter](/value-getters/#filter-value-getters) if one is provided. Otherwise, the cell values are converted using the [Value Formatter](/value-formatters/).

## Aggregation / Pivoting

The Advanced Filter will only work on leaf-level rows when using [Aggregation](/aggregation/). The `groupAggFiltering` property will be ignored.

When [Pivoting](/pivoting/), Pivot Result Columns will not appear in the Advanced Filter. However, primary columns (including underlying group and pivot columns) will be shown in the Advanced Filter.

## Server-Side Row Model

In addition to the Client-Side Row Model, the Advanced Filter can be used with the [Server-Side Row Model](/row-models/). See the [SSRM Advanced Filter Example](/server-side-model-filtering/#advanced-filter) for more information.
