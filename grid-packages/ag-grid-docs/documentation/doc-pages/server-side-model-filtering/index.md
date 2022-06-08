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


## Client-side Filtering

When Infinite Scroll is not active, the grid has all the rows needed to filter on the client. As such, the SSRM will filter on the client-side when Infinite Scroll is not active.

The example below demonstrates Client-side Filtering with no Infinite Scroll. Note the following:

- The grid is not using Infinite Scrolling, the property `serverSideInfiniteScroll` is not set.
- Columns are set up with the following filters:
    - Athlete column has Text Filter.
    - County column has Set Filter.
    - Year column has Number Filter.
- Rows are loaded once. All filtering is then subsequently done by the grid.

<grid-example title='No Infinite Scroll Client Side' name='full-client-side' type='generated' options='{ "enterprise": true, "modules": ["serverside","setfilter", "menu"] }'></grid-example>

Note that the Set Filter is provided values to work. This is a requirement when using the Set Filter with the SSRM.

## Server-side Filtering

When Infinite Scroll is active, the grid does not have all the rows needed to filter on the client. As such, the SRRM will request rows again when the filter changes and expect the server to filter the rows.

The request object sent to the server contains filter metadata in the `filterModel` property. An example of the `filterModel` is as follows:

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

The example below demonstrates filtering using [Simple Column Filters](/filter-provided-simple/) and Infinite Scroll. Notice the following:

- The **Athlete** column has a `'text'` filter defined using `filter: 'agTextColumnFilter'`.
- The **Year** column has a `'number'` filter defined using `filter: 'agNumberColumnFilter'`.
- The medals columns have a `'number'` filter defined using `filter: 'agNumberColumnFilter'` on the `'number'` column type.
- The server uses the metadata contained in the `filterModel` to filter the rows.
- Open the browser's dev console to view the `filterModel` supplied in the request to the datasource.

<grid-example title='Filtering With Infinite Scroll' name='infinite-simple' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "menu"] }'></grid-example>

As previously mentioned, when not using Infinite Scroll, the grid will filter on the client. To force Server-side Filtering, regardless of Infinite Scroll, set `serverSideFilterOnServer=true`. This is demonstrated below, note the following:

- The grid is not using [Infinite Scroll](/server-side-model-row-stores/), the property  `serverSideInfiniteScroll` is not set.
- Grid property `serverSideFilterOnServer=true` to force Server-side Filtering.
- Rows are loaded every time the filter changes.

<grid-example title='No Infinite Scroll Server Side' name='full-server-side' type='generated' options='{ "enterprise": true, "modules": ["serverside","setfilter", "menu"] }'></grid-example>

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
- The filter for the **Sport** column only shows the values which are available for the selected countries.
When the filter for the **Country** column is changed, the values for the **Sport** filter are updated.
- The server uses the metadata contained in the `filterModel` to filter the rows.
- Open the browser's dev console to view the `filterModel` supplied in the request to the datasource.

<grid-example title='Set Filter and Infinite Scrolling' name='infinite-set' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "setfilter", "menu"] }'></grid-example>


## Row Grouping

When a filter is applied to a grouped grid using the SSRM, the grid will behave differently depending on whether [Infinite Scrolling](/server-side-model-row-stores/) is active. How it behaves is as follows:

- ### Infinite Scrolling Off
    - By default, the grid will filter all rows on the client side.
    - Enabling the `serverSideFilterOnServer` grid option will instead request filtered data from the server when a group is affected by a filter change.
    - To instead reload every row and group from the server when a refresh is needed, enable the `serverSideFilterAllLevels` grid option.

- ### Infinite Scrolling On
    Changing the filter on any column will always refresh the rows. Rows will be loaded again from the server with the new filter information.

## Next Up

Continue to the next section to learn about [Data Refresh](/server-side-model-refresh/).


