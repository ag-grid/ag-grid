---
title: "Quick Filter"
---

In addition to the column specific filtering, a 'quick filter' can also be applied.

The quick filter text will check all words provided against the full row. For example if the text provided is "Tony Ireland", the quick filter will only include rows with both "Tony" AND "Ireland" in them.

If you are using a framework, you can bind the quick filter text to the `quickFilterText` attribute.

<api-documentation source='grid-options/properties.json' section='filter' names='["quickFilterText"]' config='{"overrideBottomMargin":"0rem"}'></api-documentation>
<api-documentation source='grid-api/api.json' section='filter' names='["setQuickFilter"]'></api-documentation>

<snippet>
gridOptions.api.setQuickFilter('new filter text');
</snippet>

## Overriding the Quick Filter Value

If your data contains complex objects, the quick filter will end up comparing against `[object Object]` instead of searchable string values. In this case you will need to implement `getQuickFilterText` to extract a searchable string from your complex object. 

Alternatively, you might want to format string values specifically for searching (e.g. replace accented characters in strings, or remove commas from numbers).

Finally, if you want a column to be ignored by the quick filter, have `getQuickFilterText` return an empty string `''`.

<api-documentation source='column-properties/properties.json' section='filtering' names='["getQuickFilterText"]'></api-documentation>

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'country',
            getQuickFilterText: params => {
                return params.value.name;
            }
        }
    ]
}
</snippet>


[[note]]
| The quick filter will work 'out of the box' in most cases, so you should only override the quick filter value if you have a particular problem to resolve.

## Quick Filter Cache

By default, the quick filter checks each column's value, including running value getters if present, every time the quick filter is executed. If your data set is large, you may wish to enable the quick filter cache by setting `cacheQuickFilter = true`.

<api-documentation source='grid-options/properties.json' section='filter' names='["cacheQuickFilter"]'></api-documentation>

When the cache is enabled, a 'quick filter text' is generated for each node by concatenating all the values for each column. For example, a table with columns of "Employee Name" and "Job" could have a row with quick filter text of `'NIALL CROSBY\nCOFFEE MAKER'`. The grid then performs a simple string search, so if you search for `'Niall'`, it will find our example text. Joining all the column's values into one string gives a performance boost. The values are joined after the quick filter is requested for the first time and stored in the `rowNode` - the original data that you provide is not changed.

## Reset Cache Text

When in use, the quick filter cache text can be reset in any of the following ways:

- Each rowNode has a `resetQuickFilterAggregateText()` method on it, which can be called to reset the cache text
- `rowNode.setDataValue(colKey, newValue)` will also reset the cache text
- `api.resetQuickFilter()` will reset the cache text on every rowNode.
- Lastly, if using the grid editing features, when you update a cell, the cache text will be reset

## Example: Quick Filter

The example below shows the quick filter working on different data types. Each column demonstrates something different as follows:

- `Name` - Simple column, nothing complex.
- `Age` - Complex object with 'dot' in field, quick filter works fine.
- `Country` - Complex object and value getter used, again quick filter works fine.
- `Results` - Complex object, quick filter would call `toString` on the complex object, so `getQuickFilterText` is provided.

The example also demonstrates having the quick filter cache turned on. The grid works very fast even when the cache is turned off, so you probably don't need it for small data sets. For large data sets (e.g. over 10,000 rows), turning the cache on will improve quick filter speed. Tweaking the `cacheQuickFilter` option in the example allows both modes to be experimented with:

- **Cache Quick Filter (example default):** The cache is used. Value getters are executed the first time the quick filter is run. Hitting 'Print Quick Filter Cache Texts' will return back the quick filter text for each row which will initially be `undefined` and then return the quick filter text after the quick filter is executed for the first time.
- **Normal Quick Filter:** The cache is not used. Value getters are executed on every node each time the filter is executed. Hitting 'Print Quick Filter Cache Texts' will always return `undefined` for every row because the cache is not used.

<grid-example title='Quick Filter' name='quick-filter' type='generated' options='{ "exampleHeight": 580 }'></grid-example>

## Server Side Data

Quick Filters only make sense with client side data (i.e. when using the [client-side row model](/client-side-model/)). For the other row models you would need to implement your own server-side filtering to replicate Quick Filter functionality.

