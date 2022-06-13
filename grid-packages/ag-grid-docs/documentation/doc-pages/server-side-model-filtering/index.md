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

<grid-example title='Client Side Filtering' name='full-client-side' type='generated' options='{ "enterprise": true, "modules": ["serverside","setfilter", "menu"] }'></grid-example>

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

<grid-example title='Server Side Filtering' name='infinite-simple' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "menu"] }'></grid-example>

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

<grid-example title='Set Filter Server Side Filtering' name='infinite-set' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside", "setfilter", "menu"] }'></grid-example>


## Client-side Group Filtering

Filtering groups Client-side (Infinite Scroll is off) happens inside the grid out of the box.

The example below shows Client-side sorting of groups. Note the following:
 
 - The grid is not using [Infinite Scroll](/server-side-model-row-stores/), the property  `serverSideInfiniteScroll` is not set.
 - All columns have Text or Number filters configured. Setting filters on these columns will filter leaf values within the dataset.

<grid-example title='Client-side Group Filtering' name='group-filter-client-side' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

Note the SSRM does not filter groups when using Client-side filtering. This is becasue not all children are loaded, so it is not possible for the grid to know if a group passes af filter. For example if the data was grouped by Sport, and the filter `Country=Ireland` was set, the Gymnastics group would still show even though it has no children (Ireland has no Gymnastics winners). This makes sense, as the grid cannot know this, if the child rows are not laoded. This leads to empty groups when filtering.


## Server-side Group Filtering

When grouping and Server-side filtering, the grid will reload the data if it needs to be filtered.

Not all rows need to be reloaded when a filter changes. Group levels only need to be reloaded (filtered) if the filter impacts the group level. A filter will impact a group level if the filter is on a grouped column, or the filter is on an aggregated column (ie `colDef.aggFunc` is set).

The example below demonstrates. Note the following:

- Filtering is done on the Server-side via grid property `serverSideFilterOnServer=true`.
- All columns have Text or Number filters configured.

<grid-example title='Server-side Group Filtering' name='group-filter-server-side' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

To override this behaviour, and always have the grid reload all rows when a filter changes, set the grid property `serverSideFilterAllLevels=true`.

The example below is identical to the above, except `serverSideFilterAllLevels=true`.

<grid-example title='Server-side Group Filtering Force' name='group-filter-server-side-force' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Data Refresh](/server-side-model-refresh/).
