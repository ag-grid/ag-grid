---
title: "Number Filter"
---

Number Filters allow you to filter number data.

<image-caption src="filter-number/resources/number-filter.png" alt="Number Filter" width="12.5rem" centered="true"></image-caption>

## Enabling Number Filters

The Number Filter can be configured as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'age',
            // configure column to use the Number Filter
            filter: 'agNumberColumnFilter',
            filterParams: {
                // pass in additional parameters to the Number Filter
            },
        },
    ],
}
</snippet>

## Example: Number Filter

The example below shows the Number Filter in action:

- The first column shows the default Number Filter behaviour.
- The second column demonstrates [Custom Number Support](#custom-number-support) and uses commas for decimals and allows a dollar sign ($) to be included.
- Floating filters are enabled and also react to the configuration of `allowedCharPattern`.

<grid-example title='Number Filter' name='number-filter' type='generated'></grid-example>

## Number Filter Parameters

Number Filters are configured though the `filterParams` attribute of the column definition (`INumberFilterParams` interface):

<interface-documentation interfaceName='INumberFilterParams' config='{"description":"", "sortAlphabetically":"true"}' overrideSrc="filter-number/resources/number-filter-params.json"></interface-documentation>

## Custom Number Support

HTML5 `number` inputs have mixed browser support and behaviour, particularly around locale-specific nuances, e.g. using commas rather than periods for decimal values. Due to this, the default behaviour of the Number Filter is to use a `number` input in Chrome and Microsoft Edge, and to use a `text` input in all other browsers whilst preventing non-numeric characters.

If you want to override the default behaviour, or allow users to type other characters (e.g. currency symbols, commas for thousands, etc.), the Number Filter allows you to control what characters the user is allowed to type. In this case, a `text` input is used with JavaScript controlling what characters the user is allowed (rather than the browser). You can also provide custom logic to parse the provided value into a number to be used in the filtering.

Custom number support is enabled by specifying configuration similar to the following:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'age',
            filter: 'agNumberColumnFilter',
            filterParams: {
                allowedCharPattern: '\\d\\-\\,', // note: ensure you escape as if you were creating a RegExp from a string
                numberParser: text => {
                    return text == null ? null : parseFloat(text.replace(',', '.'));
                }
            }
        }
    ]
}
</snippet>

The `allowedCharPattern` is a regex of all the characters that are allowed to be typed. This is surrounded by square brackets `[]` and used as a character class to be compared against each typed character individually and prevent the character from appearing in the input if it does not match, in supported browsers (all except Safari).

The `numberParser` should take the user-entered text and return either a number if one can be interpreted, or `null` if not.

Custom number support can be seen in the [Number Filter Example](#example-number-filter) above.

## Number Filter Model

The Filter Model describes the current state of the applied Number Filter. If only one [Filter Condition](/filter-conditions/) is set, this will be a `NumberFilterModel`:

<interface-documentation interfaceName='NumberFilterModel' config='{"description":""}'></interface-documentation>

If more than one Filter Condition is set, then multiple instances of the model are created and wrapped inside a Combined Model (`ICombinedSimpleModel<NumberFilterModel>`). A Combined Model looks as follows:

```ts
// A filter combining multiple conditions
interface ICombinedSimpleModel<NumberFilterModel> {
    filterType: string;

    operator: JoinOperator;

    // multiple instances of the Filter Model
    conditions: NumberFilterModel[];
}

type JoinOperator = 'AND' | 'OR';
```

Note that in AG Grid versions prior to 29.2, only two Filter Conditions were supported. These appeared in the Combined Model as properties `condition1` and `condition2`. The grid will still accept and supply models using these properties, but this behaviour is deprecated. The `conditions` property should be used instead.

An example of a Filter Model with two conditions is as follows:

```js
// Number Filter with two conditions, both are equals type
const numberEquals18OrEquals20 = {
    filterType: 'number',
    operator: 'OR',
    conditions: [
        {
            filterType: 'number',
            type: 'equals',
            filter: 18
        },
        {
            filterType: 'number',
            type: 'equals',
            filter: 20
        }
    ]
};
```

## Number Filter Options

The Number Filter presents a list of [Filter Options](/filter-conditions/#filter-options) to the user.

The list of options are as follows:

| Option Name             | Option Key            | Included by Default |
| ----------------------- | --------------------- | ------------------- |
| Equals                  | `equals`              | Yes                 |
| Not equal               | `notEqual`            | Yes                 |
| Less than               | `lessThan`            | Yes                 |
| Less than or equals     | `lessThanOrEqual`     | Yes                 |
| Greater than            | `greaterThan`         | Yes                 |
| Greater than or equals  | `greaterThanOrEqual`  | Yes                 |
| In range                | `inRange`             | Yes                 |
| Blank                   | `blank`               | Yes                 |
| Not blank               | `notBlank`            | Yes                 |
| Choose One              | `empty`               | No                  |

Note that the `empty` filter option is primarily used when creating [Custom Filter Options](/filter-conditions/#custom-filter-options). When 'Choose One' is displayed, the filter is not active.

The default option for the Number Filter is `equals`.

## Number Filter Values

By default, the values supplied to the Number Filter are retrieved from the data based on the `field` attribute. This can be overridden by providing a `filterValueGetter` in the Column Definition. This is similar to using a [Value Getter](/value-getters), but is specific to the filter.

<api-documentation source='column-properties/properties.json' section='filtering' names='["filterValueGetter"]'></api-documentation>

## Applying the Number Filter

Applying the Number Filter is described in more detail in the following sections:

- [Apply, Clear, Reset and Cancel Buttons](/filter-applying/#apply-clear-reset-and-cancel-buttons)
- [Applying the UI Model](/filter-applying/#applying-the-ui-model)

## Blank Cells

If the row data contains blanks (i.e. `null` or `undefined`), by default the row won't be included in filter results. To change this, use the filter params `includeBlanksInEquals`, `includeBlanksInLessThan`, `includeBlanksInGreaterThan` and `includeBlanksInRange`. For example, the code snippet below configures a filter to include `null` for equals, but not for less than, greater than or in range:

```js
const filterParams = {
    includeBlanksInEquals: true,
    includeBlanksInLessThan: false,
    includeBlanksInGreaterThan: false,
    includeBlanksInRange: false,
};
```

In the following example you can filter by age and see how blank values are included. Note the following:

- Column **Age** has both `null` and `undefined` values resulting in blank cells.
- Toggle the controls on the top to see how `includeBlanksInEquals`, `includeBlanksInLessThan`, `includeBlanksInGreaterThan` and `includeBlanksInRange` impact the search result.

<grid-example title='Number Null Filtering' name='number-null-filtering' type='typescript' options='{ "exampleHeight": 310 }'></grid-example>

## Data Updates

The Number Filter is not affected by data changes. When the grid data is updated, the filter value will remain unchanged and the filter will be re-applied based on the updated data (e.g. the displayed rows will update if necessary).

## Next Up

Continue to the next section to learn about [Date Filters](/filter-date/).
