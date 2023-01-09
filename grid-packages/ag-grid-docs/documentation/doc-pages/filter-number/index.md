---
title: "Number Filter"
---

Number filters allow you to filter number data.

The [Provided Filters](/filter-provided/) and [Simple Filters](/filter-provided-simple/) pages explain the parts of the Number Filter that are the same as the other Provided Filters. This page builds on that and explains some details that are specific to the Number Filter.

## Number Filter Parameters

Number Filters are configured though the `filterParams` attribute of the column definition:

<interface-documentation interfaceName='INumberFilterParams' config='{"description":"", "sortAlphabetically":"true"}' overrideSrc="filter-number/resources/number-filter-params.json"></interface-documentation>

## Custom Number Support

By default, the Number Filter uses HTML5 `number` inputs. However, these have mixed browser support, particularly around locale-specific nuances, e.g. using commas rather than periods for decimal values. You might also want to allow users to type other characters e.g. currency symbols, commas for thousands, etc, and still be able to handle those values correctly.

For these reasons, the Number Filter allows you to control what characters the user is allowed to type, and provide custom logic to parse the provided value into a number to be used in the filtering. In this case, a `text` input is used with JavaScript controlling what characters the user is allowed (rather than the browser).

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

The example below shows custom number support in action:
-  The first column shows the default behaviour, and the second column uses commas for decimals and allows a dollar sign ($) to be included.
- Floating filters are enabled and also react to the configuration of `allowedCharPattern`.

<grid-example title='Number Filter' name='number-filter' type='generated'></grid-example>

