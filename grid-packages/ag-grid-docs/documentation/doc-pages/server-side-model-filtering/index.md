---
title: "SSRM Filtering"
enterprise: true
---

This section covers Filtering using the Server-Side Row Model (SSRM).

## Enabling Filtering

Filtering is enabled in the grid via the `filter` column definition attribute.

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

## Server-side Filtering

The actual filtering of rows is performed on the server when using the Server-Side Row Model. When a filter is applied
in the grid a request is made for more rows via `getRows(params)` on the [Server-Side Datasource](/server-side-model-datasource/).
The supplied params includes a request containing filter metadata contained in the `filterModel` property.

The request object sent to the server contains filter metadata in the `filterModel` property, an example is shown below:

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

Notice in the snippet above the `filterModel` object contains a `'text'` and `'number'` filter. This filter metadata is used by the server to perform the filtering.

For more details on properties and values used in these filters see the section on
[Simple Column Filters](/filter-provided-simple/).

The example below demonstrates filtering using Simple Column Filters, note the following:

- The **Athlete** column has a `'text'` filter defined using `filter: 'agTextColumnFilter'`.
- The **Year** column has a `'number'` filter defined using `filter: 'agNumberColumnFilter'`.
- The medals columns have a `'number'` filter defined using `filter: 'agNumberColumnFilter'` on the `'number'` column type.
- The server uses the metadata contained in the `filterModel` to filter the rows.
- Open the browser's dev console to view the `filterModel` supplied in the request to the datasource.

<grid-example title='Server Side Filtering' name='infinite-simple' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "menu"] }'></grid-example>

## Set Filtering

Filtering using the [Set Filter](/filter-set/) has a few differences to filtering with Simple Filters.

### Set Filter Model

Entries in the `filterModel` have a different format to the Simple Filters. This filter model is what gets passed as part of the request to the server when using Server-side Filtering. The following shows an example of a Set Filter where two items are selected:

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
have all rows loaded. This can be done either synchronously or asynchronously using the `values` filter param as shown below:


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

For more details on setting values, see [Supplying Filter Values](/filter-set-filter-list/#supplying-filter-values). Once you have supplied values to the Set Filter, they will not change unless you ask for them to be refreshed. See [Refreshing Values](/filter-set-filter-list/#refreshing-values) for more information.

The example below demonstrates Server-side Filtering using the Set Filter and Infinite Scrolling. Note the following:

- The **Country** and **Sport** columns have Set Filters defined using `filter: 'agSetColumnFilter'`.
- Set Filter values are fetched asynchronously and supplied via the `params.success(values)` callback.
- The filter for the **Country** column is using [complex objects](/filter-set-filter-list/#complex-objects). The country name is shown in the Filter List, but the `filterModel` (and request) use the country code.
- The filter for the **Sport** column only shows the values which are available for the selected countries.
When the filter for the **Country** column is changed, the values for the **Sport** filter are updated.
- The server uses the metadata contained in the `filterModel` to filter the rows.
- Open the browser's dev console to view the `filterModel` supplied in the request to the datasource.

<grid-example title='Set Filter Server Side Filtering' name='infinite-set' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "setfilter", "menu"] }'></grid-example>

## Next Up

Continue to the next section to learn about [SSRM Row Grouping](/server-side-model-grouping/).
