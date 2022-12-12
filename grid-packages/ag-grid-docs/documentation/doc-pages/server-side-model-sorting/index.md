---
title: "SSRM Sorting"
enterprise: true
---

This section covers Server-Side Sorting using the Server-Side Row Model.

## Enabling Sorting

Sorting is enabled in the grid via the `sortable` column definition attribute.


<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country', sortable: true },
        { field: 'year', sortable: true },
        { field: 'sport' },
    ]
}
</snippet>

For more details on sorting configurations see the section on [Row Sorting](/row-sorting/).

## Client-side Sorting

When Infinite Scroll is not active, the grid has all the rows needed to sort on the client. As such, the SSRM will sort on the client-side.

The example below demonstrates Client-side Sorting with no Infinite Scroll. Note the following:

- The grid is not using Infinite Scroll, the property  `serverSideInfiniteScroll` is not set.
- All columns have sorting enabled using the `defaultColDef.sortable = true`.
- Rows are loaded once. All sorting is then subsequently done by the grid.

<grid-example title='Client-side Sorting' name='full-sort-client-side' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Server-side Sorting

When Infinite Scroll is active, the grid does not have all the rows needed to sort on the client. As such, the server-side row model will request rows again each time the sort changes and expect the server to sort the rows.

The request object sent to the server contains sort metadata in the `sortModel` property. An example of the `sortModel` is as follows:

```js
// Example request with sorting info
{
    sortModel: [
        { colId: 'country', sort: 'asc' },
        { colId: 'year', sort: 'desc' },
    ],

    // other properties
}
```

Notice `sortModel` is an array with each item representing a Column with an active sort, containing the Column ID and the Sort Direction.

The example below demonstrates sorting using the SSRM and Infinite Scrolling. Note the following:

- The grid has Infinite Scrolling enabled via `serverSideInfiniteScroll=true`.
- All columns have sorting enabled via `defaultColDef.sortable = true`.
- The server uses the metadata contained in the `sortModel` to sort the rows.
- Open the browser's dev console to view the `sortModel` supplied in the request to the datasource.
- Try single / multi column (using <kbd>Shift</kbd> key) sorting by clicking on column headers.

<grid-example title='Server Side Sorting' name='infinite-sorting' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

As previously mentioned, when not using Infinite Scroll, the grid will sort on the client. To force Server-side Sorting, regardless of Infinite Scroll, set `serverSideSortOnServer=true`. This is demonstrated below, note the following:

- The grid is not using Infinite Scroll, the property  `serverSideInfiniteScroll` is not set.
- Grid property `serverSideSortOnServer=true` to force Server-side Sorting.
- Rows are loaded every time the sort order changes.

<grid-example title='No Infinite Scroll Server-side Sorting' name='full-sort-server-side' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Client-side Row Group Sorting

Sorting row groups Client-side (Infinite Scroll is off) happens inside the grid by default.

The example below shows Client-side sorting of groups. Note the following:
 
 - The grid is not using Infinite Scroll, the property  `serverSideInfiniteScroll` is not set.
 - All columns have sorting enabled via defaultColDef.sortable = true.
 - Click the Gold column header to sort, open the browser console and note there are no requests to the server - the grid sorts client-side without reloading the rows.


<grid-example title='Client-side Group Sorting' name='group-sort-client-side' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>


## Server-side Row Group Sorting

When grouping and Server-side sorting, the grid will reload the data if it needs to be sorted.

Not all rows need to be reloaded when a sort changes. Group levels only need to be reloaded (sorted) if the sort impacts the group level. A sort will impact a group level if the sort is on a grouped column, or the sort is on an aggregated column (ie `colDef.aggFunc` is set).

The example below demonstrates. Note the following:

- Sorting is done on the Server-side via grid property `serverSideSortOnServer=true`.
- Sorting by `Country` reloads the top level groups.
- Sorting by `Sport` reloads the second level group, the top level is not impacted.
- Sorting by `Year` does not reload any groups. Only leaf-levels are reloaded.
- Sorting by `Gold`, `Silver` or `Bronze` does reload groups, as they columns have `aggFunc` set.

<grid-example title='Server-side Group Sorting' name='group-sort-server-side' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

To override this behaviour, and always have the grid reload all rows when a sort changes, set the grid property `serverSideSortAllLevels=true`.

The example below is identical to the above, except `serverSideSortAllLevels=true`.

<grid-example title='Server-side Group Sorting Force' name='group-sort-server-side-force' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Next Up

Continue to the next section to learn about [SSRM Filtering](/server-side-model-filtering/).
