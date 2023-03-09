---
title: "Quick Filter"
---

Quick Filter is a piece of text given to the grid (typically the user will type it in somewhere in your application) that is used to filter rows by comparing against the data in all columns. This can be used in addition to column-specific filtering.

The provided Quick Filter text will be split into words, and each word will be compared against the row. A word matches the row if the string value of any of the columns contains the word (the check is case insensitive). All words must match the row for it to be included. For example, if the text is "Tony Ireland", the Quick Filter will only include rows with both "Tony" AND "Ireland" in them.

## Setting the Quick Filter

You can set the Quick Filter text by calling the `setQuickFilter` method on the grid API.

<api-documentation source='grid-api/api.json' section='filter' names='["setQuickFilter"]'></api-documentation>

If you are using a framework, you can also bind the Quick Filter text to the `quickFilterText` attribute.

<api-documentation source='grid-options/properties.json' section='filter' names='["quickFilterText"]'></api-documentation>

<snippet>
gridOptions.api.setQuickFilter('new filter text');
</snippet>

## Checking the Quick Filter

Usually the state of the Quick Filter text would be maintained outside of the grid. However, it's possible to check whether the Quick Filter is applied, and get the current text, via the grid API.

<api-documentation source='grid-api/api.json' section='filter' names='["isQuickFilterPresent", "getQuickFilter"]'></api-documentation>

## Overriding the Quick Filter Value

If your data contains complex objects, the Quick Filter will end up comparing against `[object Object]` instead of searchable string values. In this case you will need to implement `getQuickFilterText` to extract a searchable string from your complex object. 

Alternatively, you might want to format string values specifically for searching (e.g. replace accented characters in strings, or remove commas from numbers).

Finally, if you want a column to be ignored by the Quick Filter, have `getQuickFilterText` return an empty string `''`.

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
| The Quick Filter will work 'out of the box' in most cases, so you should only override the Quick Filter value if you have a particular problem to resolve.

## Quick Filter Cache

By default, the Quick Filter checks each column's value, including running value getters if present, every time the Quick Filter is executed. If your data set is large, you may wish to enable the Quick Filter cache by setting `cacheQuickFilter = true`.

<api-documentation source='grid-options/properties.json' section='filter' names='["cacheQuickFilter"]'></api-documentation>

When the cache is enabled, a 'Quick Filter text' is generated for each node by concatenating all the values for each column. For example, a table with columns of "Employee Name" and "Job" could have a row with Quick Filter text of `'NIALL CROSBY\nCOFFEE MAKER'`. The grid then performs a simple string search, so if you search for `'Niall'`, it will find our example text. Joining all the column values into one string gives a performance boost. The values are joined after the Quick Filter is requested for the first time and stored in the `rowNode` - the original data that you provide is not changed.

## Reset Cache Text

When in use, the Quick Filter cache text can be manually reset in one of the following ways:

- Each Row Node has a `resetQuickFilterAggregateText()` method on it, which can be called to reset the cache text.
- `api.resetQuickFilter()` will reset the cache text on every Row Node.

[Updating Data](/data-update/), [Cell Editing](/cell-editing/) and [Updating Column Definitions](/column-updating-definitions/) will automatically reset the cache text on any affected Row Nodes.

## Exclude Hidden Columns

By default the Quick Filter will check all column values, including ones that are currently hidden from the grid. If you have a large number of hidden columns and you're not interested in filtering against them, you can set the grid option `excludeHiddenColumnsFromQuickFilter = true` to provide a performance improvement.

This can also be set via the API method `setExcludeHiddenColumnsFromQuickFilter`.

<api-documentation source='grid-options/properties.json' section='filter' names='["excludeHiddenColumnsFromQuickFilter"]'></api-documentation>

<api-documentation source='grid-api/api.json' section='filter' names='["setExcludeHiddenColumnsFromQuickFilter"]'></api-documentation>

## Example: Quick Filter

The example below shows the Quick Filter working on different data types. Each column demonstrates something different as follows:

- `Name` - Simple column, nothing complex.
- `Age` - Complex object with 'dot' in field, Quick Filter works fine.
- `Country` - Complex object and value getter used, again Quick Filter works fine.
- `Results` - Complex object, Quick Filter would call `toString` on the complex object, so `getQuickFilterText` is provided.
- `Hidden` - A hidden column with all values being the string 'hidden'. Enter `hidden` into the filter and it will match all rows. Click the `Exclude Hidden Columns` button to set `excludeHiddenColumnsFromQuickFilter = true`, and no rows will be matched. Note the Quick Filter cache will be cleared automatically when the option is changed.

The example also demonstrates having the Quick Filter cache turned on. The grid works very fast even when the cache is turned off, so you probably don't need it for small data sets. For large data sets (e.g. over 10,000 rows), turning the cache on will improve Quick Filter speed. Tweaking the `cacheQuickFilter` option in the example allows both modes to be experimented with:

- **Cache Quick Filter (example default):** The cache is used. Value getters are executed the first time the Quick Filter is run. Hitting 'Print Quick Filter Cache Texts' will return back the Quick Filter text for each row which will initially be `undefined` and then return the Quick Filter text after the Quick Filter is executed for the first time.
- **Normal Quick Filter:** The cache is not used. Value getters are executed on every node each time the filter is executed. Hitting 'Print Quick Filter Cache Texts' will always return `undefined` for every row because the cache is not used.

<grid-example title='Quick Filter' name='quick-filter' type='generated' options='{ "exampleHeight": 580 }'></grid-example>

## Server Side Data

Quick Filters only make sense with client-side data (i.e. when using the [Client-Side Row Model](/client-side-model/)). For the other row models you would need to implement your own server-side filtering to replicate Quick Filter functionality.

