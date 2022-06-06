---
title: "SSRM Filtering"
enterprise: true
---

This section covers Filtering using the Server-Side Row Model (SSRM).

## Enabling Filtering

Filtering is enabled in the grid via the `filter` column definition attribute. Some example column definitions with filtering enabled are shown below:

<snippet>
|const gridOptions = {
|    columnDefs: [
|        // sets the 'text' filter
|        { field: 'country', filter: 'agTextColumnFilter' },
|
|        // use the default 'set' filter
|        { field: 'year', filter: true },
|
|        // no filter (unspecified)
|        { field: 'sport' },
|    ],
|}
</snippet>

For more details on filtering configurations see the section on [Column Filtering](/filtering/).


## Full Store Filtering

When using the Full Store, filtering of rows is performed by the grid. There is nothing special to be done by the server.

The example below demonstrates the Full Store filtering inside the grid. Note the following:

- The grid is using the Full Store by setting the grid property `serverSideStoreType = full`.
- Columns are set up with the following filters:
    - Athlete column has Text Filter.
    - County column has Set Filter.
    - Year column has Number Filter.
- Rows are loaded once. All filtering is then subsequently done by the grid.

<grid-example title='Full Store Filtering' name='full' type='generated' options='{ "enterprise": true, "modules": ["serverside","setfilter", "menu"] }'></grid-example>

Note that the Set Filter is provided values to work. This is a requirement when using the Set Filter with the SSRM.

[[note]]
| The example above demonstrates the default behaviour of the full store.
| To instead have the grid request that the server provide the filtered rows, enable the `serverSideFilterOnServer` grid option.

## Partial Store Filtering

When using the Partial Store, filtering of rows is performed on the server. When a filter is applied in the grid
a request is made for more rows via the [Datasource](/server-side-model-datasource/). The provided request
contains filter metadata in the `filterModel` property.

An example of the contents contained in the `filterModel` is shown below:

```js
// Example request with filter info
{
    filterModel: {
        athlete: {
            filterType: 'text',
            type: 'contains',
            filter: 'fred'
        },
        year: {
            filterType: 'number',
            type: 'greaterThan',
            filter: 2005,
            filterTo: null
        }
    },

    // other properties
}
```

Notice in the snippet above the `filterModel` object contains a `'text'` and `'number'` filter. This filter metadata
is used by the server to perform the filtering.

For more details on properties and values used in these filters see the section on
[Simple Column Filters](/filter-provided-simple/).

The example below demonstrates filtering using [Simple Column Filters](/filter-provided-simple/) and the
Partial Store. Notice the following:

- The **Athlete** column has a `'text'` filter defined using `filter: 'agTextColumnFilter'`.
- The **Year** column has a `'number'` filter defined using `filter: 'agNumberColumnFilter'`.
- The medals columns have a `'number'` filter defined using `filter: 'agNumberColumnFilter'` on the `'number'` column type.
- The server uses the metadata contained in the `filterModel` to filter the rows.
- Open the browser's dev console to view the `filterModel` supplied in the request to the datasource.

<grid-example title='Partial Simple' name='partial-simple' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "menu"] }'></grid-example>

## Set Filtering

Filtering using the [Set Filter](/filter-set/) has a few differences to filtering with Simple Filters.

### Set Filter Model

Entries in the `filterModel` have a different format to the Simple Filters. This filter model is what gets passed
as part of the request to the server when using the Partial Store.
The following shows an example of a Set Filter where two items are selected:


```js
// IServerSideGetRowsRequest
{
    filterModel: {
        country: {
            filterType: 'set',
            values: ['Australia', 'Belgium']
        }
    },

    // other properties
}
```

### Set Filter Values

When using the Set Filter with the SSRM it is necessary to supply the values as the grid does not
have all rows loaded.  This can be done either synchronously or asynchronously using the `values` filter param as shown below:


<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        // colDef with Set Filter values supplied synchronously
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: ['Australia', 'China', 'Sweden']
            }
        },
        // colDef with Set Filter values supplied asynchronously
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: params => {
                    // simulating async delay
                    setTimeout(() => params.success(['Australia', 'China', 'Sweden']), 500);
                }
            }
        }
    ]
}
</snippet>

For more details on setting values, see [Supplying Filter Values](/filter-set-filter-list/#supplying-filter-values).
Once you have supplied values to the Set Filter, they will not change unless you ask for them to be refreshed;
see [Refreshing Values](/filter-set-filter-list/#refreshing-values) for more information.

The example below demonstrates server-side filtering using the Set Filter and the Partial Row Store. Note the following:

- The **Country** and **Sport** columns have Set Filters defined using `filter: 'agSetColumnFilter'`.
- Set Filter values are fetched asynchronously and supplied via the `params.success(values)` callback.
- The filter for the **Sport** column only shows the values which are available for the selected countries.
When the filter for the **Country** column is changed, the values for the **Sport** filter are updated.
- The server uses the metadata contained in the `filterModel` to filter the rows.
- Open the browser's dev console to view the `filterModel` supplied in the request to the datasource.

<grid-example title='Partial Set' name='partial-set' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "setfilter", "menu"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Row Grouping](/server-side-model-grouping/).


