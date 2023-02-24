---
title: "Text Filter"
---

Text filters allow you to filter string data.

The [Provided Filters](/filter-provided/) and [Simple Filters](/filter-provided-simple/) pages explain the parts of the Text Filter that are the same as the other Provided Filters. This page builds on that and explains some details that are specific to the Text Filter.

## Text Filter Parameters

Text Filters are configured though the `filterParams` attribute of the column definition (`ITextFilterParams` interface):

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

## Example: Text Filter

- The **Athlete** column has only two filter options: `filterOptions = ['contains', 'notContains']`
- The **Athlete** column has a text formatter, so if you search for 'o' it will find '&ouml;'. You can try this by searching the string `'Bjo'`.
- The **Athlete** column has a debounce of 200ms (`debounceMs = 200`).
- The **Athlete** column filter has only one Filter Condition allowed (`maxNumConditions = 1`)
- The **Country** column has only one filter option: `filterOptions = ['contains']`
- The **Country** column has a `textMatcher` so that aliases can be entered in the filter, e.g. if you filter using the text `'usa'` it will match `United States` or `'holland'` will match `'Netherlands'`
- The **Country** column will trim the input when the filter is applied (`trimInput = true`)
- The **Country** column filter has a debounce of 1000ms (`debounceMs = 1000`)
- The **Sport** column has a different default option (`defaultOption = 'startsWith'`)
- The **Sport** column filter is case-sensitive (`caseSensitive = true`)

<grid-example title='Text Filter' name='text-filter' type='generated' options='{ "exampleHeight": 555 }'></grid-example>
