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
    - The AND/OR additional filter is suppressed (`suppressAndOrCondition = true`)
- For the **Country** column:
    - There is only one [Filter Option](#text-filter-options): `filterOptions = ['contains']`
    - There is a [Custom Matcher](#text-custom-matcher) so that aliases can be entered in the filter, e.g. if you filter using the text `'usa'` it will match `United States` or `'holland'` will match `'Netherlands'`
    - The filter input will be trimmed when the filter is applied (`trimInput = true`)
    - There is a debounce of 1000ms (`debounceMs = 1000`)
- For the **Sport** column:
    - There is a different default [Filter Option](#text-filter-options) (`defaultOption = 'startsWith'`)
    - The filter is case-sensitive (`caseSensitive = true`)

<grid-example title='Text Filter' name='text-filter' type='generated' options='{ "exampleHeight": 555 }'></grid-example>

## Common Configuration

The Text Filter is a type of [Simple Filter](/filter-provided-simple/) and shares some configuration, which is described in more detail in the following sections:

- [Apply, Clear, Reset and Cancel Buttons](/filter-applying/#apply-clear-reset-and-cancel-buttons)
- [Applying the UI Model](/filter-applying/#applying-the-ui-model)
- [Simple Filter Parts](/filter-provided-simple/#simple-filter-parts) (filter options and conditions)
- [Data Updates](/filter-provided-simple/#data-updates)
- [Customising Filter Placeholder Text](/filter-provided-simple/#customising-filter-placeholder-text)

## Text Filter Parameters

[Filter Parameters](/filter-column/#filter-parameters) for Text Filters are configured though the `filterParams` attribute of the column definition (`ITextFilterParams` interface):

<interface-documentation interfaceName='ITextFilterParams' config='{"description":"", "sortAlphabetically":"true"}' overrideSrc="filter-text/resources/text-filter-params.json"></interface-documentation>

## Text Custom Matcher

By default the text filter performs strict case-insensitive text filtering, i.e. if you provide `['1,234.5USD','345GBP']` as data for a text column:

- **contains '1,2'** will show 1 value: ['1,234.5USD']
- **contains '12'** will show 0 values
- **contains '$'** will show 0 values
- **contains 'gbp'** will show 1 value ['345GBP']

You can change the default behaviour by providing your own `textMatcher`, which allows you to provide your own logic to decide when to include a row in the filtered results.

<interface-documentation interfaceName='ITextFilterParams' names='["textMatcher"]' config='{"description":"", "overrideBottomMargin":"1rem"}' ></interface-documentation>

- `filter` The applicable filter type being tested. One of: `equals`, `notEqual`, `contains`, `notContains`, `startsWith`, `endsWith`
- `value` The value about to be filtered. If this column has a value getter, this value will be coming from the value getter, otherwise it is the raw value injected into the grid.
- `filterText` The value to filter by.
- `returns: boolean` Set to `true` if the value passes the filter, otherwise `false`.

The following is an example of a `textMatcher` that mimics the current implementation of AG Grid. This can be used as a template to create your own.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agTextColumnFilter',
            filterParams: {
                textMatcher: ({filter, value, filterText}) => {
                    const filterTextLowerCase = filterText.toLowerCase();
                    const valueLowerCase = value.toString().toLowerCase();
                    switch (filter) {
                        case 'contains':
                            return valueLowerCase.indexOf(filterTextLowerCase) >= 0;
                        case 'notContains':
                            return valueLowerCase.indexOf(filterTextLowerCase) === -1;
                        case 'equals':
                            return valueLowerCase === filterTextLowerCase;
                        case 'notEqual':
                            return valueLowerCase != filterTextLowerCase;
                        case 'startsWith':
                            return valueLowerCase.indexOf(filterTextLowerCase) === 0;
                        case 'endsWith':
                            var index = valueLowerCase.lastIndexOf(filterTextLowerCase);
                            return index >= 0 && index === (valueLowerCase.length - filterTextLowerCase.length);
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

## Text Formatter

By default, the grid compares the text filter with the values in a case-insensitive way, by converting both the filter text and the values to lower-case and comparing them; for example, `'o'` will match `'Olivia'` and `'Salmon'`. If you instead want to have case-sensitive matches, you can set `caseSensitive = true` in the `filterParams`, so that no lower-casing is performed. In this case, `'o'` would no longer match `'Olivia'`.

You might have more advanced requirements, for example to ignore accented characters. In this case, you can provide your own `textFormatter`, which is a function with the following signature:

<interface-documentation interfaceName='ITextFilterParams' names='["textFormatter"]' config='{"description":"", "overrideBottomMargin":"1rem"}' ></interface-documentation>

`from` is the value coming from the grid. This can be from the `valueGetter` if there is any for the column, or the value as originally provided in the `rowData`. The function should return a string to be used for the purpose of filtering.

The following is an example function to remove accents and convert to lower case.

```js
const toLowerWithoutAccents = value =>
    value.toLowerCase()
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

## Text Filter Model

The [Filter Model](/filter-column/#filter-model) describes the current state of the applied Text Filter. This will either be a `TextFilterModel` or an `ICombinedSimpleModel<TextFilterModel>`.

This is described in more detail in the [Simple Filter Models](/filter-provided-simple/#simple-filter-models) section.

<interface-documentation interfaceName='TextFilterModel'></interface-documentation>

## Text Filter Options

The Text Filter presents a list of [Filter Options](/filter-provided-simple/#filter-options) to the user.

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

Note that the `empty` filter option is primarily used when creating [Custom Filter Options](/filter-provided-simple/#custom-filter-options). When 'Choose One' is displayed, the filter is not active.

The default option for Text Filter is `contains`.

## Next Up

Continue to the next section to learn about the [Number Filter](/filter-number/).
