---
title: "Number Filter"
---

Number Filters allow you to filter number data.

<image-caption src="filter-provided-simple/resources/number-filter.png" alt="Number Filter" width="12.5rem" centered="true"></image-caption>

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

## Common Configuration

The Number Filter is a type of [Simple Filter](/filter-provided-simple/) and shares some configuration, which is described in more detail in the following sections:

- [Apply, Clear, Reset and Cancel Buttons](/filter-provided/#apply-clear-reset-and-cancel-buttons)
- [Applying the UI Model](/filter-provided/#applying-the-ui-model)
- [Simple Filter Parts](/filter-simple-configuration/#simple-filter-parts) (filter options and conditions)
- [Blank Cells](/filter-simple-configuration/#blank-cells-date-and-number-filters)
- [Data Updates](/filter-simple-configuration/#data-updates)
- [Customising Filter Placeholder Text](/filter-simple-configuration/#customising-filter-placeholder-text)

## Number Filter Parameters

[Filter Parameters](/filter-column/#filter-parameters) for Number Filters are configured though the `filterParams` attribute of the column definition (`INumberFilterParams` interface):

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

Custom number support can be seen in the [Number Filter Example](#example-number-filter) above.

## Number Filter Model

The [Filter Model](/filter-column/#filter-model) describes the current state of the applied Number Filter. This will either be a `NumberFilterModel` or an `ICombinedSimpleModel<NumberFilterModel>`.

This is described in more detail in the [Simple Filter Models](/filter-simple-configuration/#simple-filter-models) section.

<interface-documentation interfaceName='NumberFilterModel'></interface-documentation>

## Number Filter Options

The Number Filter presents a list of [Filter Options](/filter-simple-configuration/#filter-options) to the user.

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

Note that the `empty` filter option is primarily used when creating [Custom Filter Options](/filter-simple-configuration/#custom-filter-options). When 'Choose One' is displayed, the filter is not active.

The default option for the Number Filter is `equals`.

## Next Up

Continue to the next section to learn about the [Date Filter](/filter-date/).
