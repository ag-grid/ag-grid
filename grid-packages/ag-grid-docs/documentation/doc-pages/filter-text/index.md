---
title: "Text Filter"
---

Text Filters allow you to filter string data.

<image-caption src="filter-text/resources/text-filter.png" alt="Text Filter" width="12.5rem" centered="true"></image-caption>

## Enabling Text Filters

The Text Filter is the default filter used in AG Grid Community, but it can also be explicitly configured as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            // Text Filter is used by default in Community version
            filter: true,
            filterParams: {
                // pass in additional parameters to the Text Filter
            },
        },
        {
            field: 'country',
            // explicitly configure column to use the Text Filter
            filter: 'agTextColumnFilter',
            filterParams: {
                // pass in additional parameters to the Text Filter
            },
        },
    ],
}
</snippet>

## Example: Text Filter

The example below shows the Text Filter in action:

- For the **Athlete** column:
    - There are only two [Filter Options](#text-filter-options): `filterOptions = ['contains', 'notContains']`
    - There is a [Text Formatter](#text-formatter), so if you search for 'o' it will find '&ouml;'. You can try this by searching the string `'Bjo'`.
    - The filter has a debounce of 200ms (`debounceMs = 200`).
    - Only one Filter Condition is allowed (`maxNumConditions = 1`)
- For the **Country** column:
    - There is only one [Filter Option](#text-filter-options): `filterOptions = ['contains']`
    - There is a [Custom Matcher](#text-custom-matcher) so that aliases can be entered in the filter, e.g. if you filter using the text `'usa'` it will match `United States` or `'holland'` will match `'Netherlands'`
    - The filter input will be trimmed when the filter is applied (`trimInput = true`)
    - There is a debounce of 1000ms (`debounceMs = 1000`)
- For the **Sport** column:
    - There is a different default [Filter Option](#text-filter-options) (`defaultOption = 'startsWith'`)
    - The filter is case-sensitive (`caseSensitive = true`)

<grid-example title='Text Filter' name='text-filter' type='generated' options='{ "exampleHeight": 555 }'></grid-example>

## Text Filter Parameters

Text Filters are configured though the `filterParams` attribute of the column definition (`ITextFilterParams` interface):

<interface-documentation interfaceName='ITextFilterParams' config='{"description":"", "sortAlphabetically":"true"}' overrideSrc="filter-text/resources/text-filter-params.json"></interface-documentation>

## Text Formatter

By default, the grid compares the Text Filter with the values in a case-insensitive way, by converting both the filter text and the values to lower case and comparing them; for example, `'o'` will match `'Olivia'` and `'Salmon'`. If you instead want to have case-sensitive matches, you can set `caseSensitive = true` in the `filterParams`, so that no lowercasing is performed. In this case, `'o'` would no longer match `'Olivia'`.

You might have more advanced requirements, for example to ignore accented characters. In this case, you can provide your own `textFormatter`, which is a function with the following signature:

<interface-documentation interfaceName='ITextFilterParams' names='["textFormatter"]' config='{"description":"", "overrideBottomMargin":"1rem"}' ></interface-documentation>

`from` is the value coming from the grid. This can be from the `valueGetter` if there is any for the column, or the value as originally provided in the `rowData`. The function should return a string to be used for the purpose of filtering.

The Text Formatter is applied to both the filter text and the values before they are compared.

The following is an example function to remove accents and convert to lower case.

```js
const toLowerWithoutAccents = value => value == null
    ? null
    : value.toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/ç/g, 'c')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[òóôõö]/g, 'o')
        .replace(/œ/g, 'oe')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y');
```

Note that when providing a Text Formatter, the `caseSensitive` parameter is ignored. In this situation, if you want to do a case-insensitive comparison, you will need to perform case conversion inside the `textFormatter` function.

## Text Custom Matcher

In most cases, you can customise the Text Filter matching logic by providing your own [Text Formatter](#text-formatter), e.g. to remove or replace characters in the filter text and values. The Text Formatter is applied to both the filter text and values before the filter comparison is performed.

For more advanced use cases, you can provide your own `textMatcher` to decide when to include a row in the filtered results. For example, you might want to apply different logic for the filter option `equals` than for `contains`.

<interface-documentation interfaceName='ITextFilterParams' names='["textMatcher"]' config='{"description":"", "overrideBottomMargin":"1rem"}' ></interface-documentation>

The following is an example of a `textMatcher` that mimics the current implementation of AG Grid. This can be used as a template to create your own.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agTextColumnFilter',
            filterParams: {
                textMatcher: ({ filterOption, value, filterText }) => {
                    if (filterText == null) {
                        return false;
                    }
                    switch (filterOption) {
                        case 'contains':
                            return value.indexOf(filterText) >= 0;
                        case 'notContains':
                            return value.indexOf(filterText) < 0;
                        case 'equals':
                            return value === filterText;
                        case 'notEqual':
                            return value != filterText;
                        case 'startsWith':
                            return value.indexOf(filterText) === 0;
                        case 'endsWith':
                            const index = value.lastIndexOf(filterText);
                            return index >= 0 && index === (value.length - filterText.length);
                        default:
                            // should never happen
                            console.warn('invalid filter type ' + filter);
                            return false;
                    }
                }
            }
        }
    ]
}
</snippet>

## Text Filter Model

The Filter Model describes the current state of the applied Text Filter. If only one [Filter Condition](/filter-conditions/) is set, this will be a `TextFilterModel`:

<interface-documentation interfaceName='TextFilterModel' config='{"description":""}'></interface-documentation>

If more than one Filter Condition is set, then multiple instances of the model are created and wrapped inside a Combined Model (`ICombinedSimpleModel<TextFilterModel>`). A Combined Model looks as follows:

```ts
// A filter combining multiple conditions
interface ICombinedSimpleModel<TextFilterModel> {
    filterType: string;

    operator: JoinOperator;

    // multiple instances of the Filter Model
    conditions: TextFilterModel[];
}

type JoinOperator = 'AND' | 'OR';
```

Note that in AG Grid versions prior to 29.2, only two Filter Conditions were supported. These appeared in the Combined Model as properties `condition1` and `condition2`. The grid will still accept and supply models using these properties, but this behaviour is deprecated. The `conditions` property should be used instead.

An example of a Filter Model with two conditions is as follows:

```js
// Text Filter with two conditions, both are equals type
const textEqualsSwimmingOrEqualsGymnastics = {
    filterType: 'text',
    operator: 'OR',
    conditions: [
        {
            filterType: 'text',
            type: 'equals',
            filter: 'Swimming'
        },
        {
            filterType: 'text',
            type: 'equals',
            filter: 'Gymnastics'
        }
    ]
};
```

## Text Filter Options

The Text Filter presents a list of [Filter Options](/filter-conditions/#filter-options) to the user.

The list of options are as follows:

| Option Name             | Option Key            | Included by Default |
| ----------------------- | --------------------- | ------------------- |
| Contains                | `contains`            | Yes                 |
| Not contains            | `notContains`         | Yes                 |
| Equals                  | `equals`              | Yes                 |
| Not equal               | `notEqual`            | Yes                 |
| Starts with             | `startsWith`          | Yes                 |
| Ends with               | `endsWith`            | Yes                 |
| Blank                   | `blank`               | Yes                 |
| Not blank               | `notBlank`            | Yes                 |
| Choose One              | `empty`               | No                  |

Note that the `empty` filter option is primarily used when creating [Custom Filter Options](/filter-conditions/#custom-filter-options). When 'Choose One' is displayed, the filter is not active.

The default option for the Text Filter is `contains`.

## Text Filter Values

By default, the values supplied to the Text Filter are retrieved from the data based on the `field` attribute. This can be overridden by providing a `filterValueGetter` in the Column Definition. This is similar to using a [Value Getter](/value-getters), but is specific to the filter.

<api-documentation source='column-properties/properties.json' section='filtering' names='["filterValueGetter"]'></api-documentation>

## Applying the Text Filter

Applying the Text Filter is described in more detail in the following sections:

- [Apply, Clear, Reset and Cancel Buttons](/filter-applying/#apply-clear-reset-and-cancel-buttons)
- [Applying the UI Model](/filter-applying/#applying-the-ui-model)

## Data Updates

The Text Filter is not affected by data changes. When the grid data is updated, the filter value will remain unchanged and the filter will be re-applied based on the updated data (e.g. the displayed rows will update if necessary).

## Next Up

Continue to the next section to learn about [Number Filters](/filter-number/).
