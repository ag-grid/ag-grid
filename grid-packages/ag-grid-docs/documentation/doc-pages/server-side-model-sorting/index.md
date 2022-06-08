---
title: "SSRM Sorting"
enterprise: true
---

This section covers Server-Side Sorting using the Server-Side Row Model.

## Enabling Sorting

Sorting is enabled in the grid via the `sortable` column definition attribute. Some example column definitions
with sorting enabled are shown below:


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

When [Infinite Scroll](/server-side-model-row-stores/) is not active, the grid has all the rows needed to sort on the client. As such, the SSRM will sort on the client-side when Infinite Scroll is not active.

The example below demonstrates Client-side Sorting with no Infinite Scroll. Note the following:

- The grid is not using [Infinite Scroll](/server-side-model-row-stores/), the property  `serverSideInfiniteScroll` is not set.
- All columns have sorting enabled using the `defaultColDef.sortable = true`.
- Rows are loaded once. All sorting is then subsequently done by the grid.

<grid-example title='No Infinite Scroll Client-side Sort' name='full-sort-client-side' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Server-side Sorting

When [Infinite Scroll](/server-side-model-row-stores/) is active, the grid does not have all the rows needed to sort on the client. As such, the SRRM will request rows again when the sort changes and expect the server to sort the rows.

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

<grid-example title='Sorting With Infinite Scroll' name='partial-sorting' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

As previously mentioned, when not using Infinite Scroll, the grid will sort on the client. To change this (sort on the server when no Infinite Scroll) set `serverSideSortOnServer=true`. The is demonstrated in the example below. Note the following:

- The grid is not using [Infinite Scroll](/server-side-model-row-stores/), the property  `serverSideInfiniteScroll` is not set.
- Grid property `serverSideSortOnServer=true` to force Server-side Sorting.
- Rows are loaded every time the sort order changes.

<grid-example title='No Infinite Scroll Server-side Sort' name='full-sort-server-side' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

[[note]]
| **Fake Server Implementation**
|
| Most of the Server-Side Row Model examples include a fake server that generates SQL to imitate how a real server
| might use the requests sent from the grid. These examples use [AlaSQL](http://alasql.org/) which is a
| JavaScript SQL database that works in browsers.
|
| However, note that the Server-Side Row Model does not impose any restrictions on the server-side technologies used.

## Sorting Groups

When a sort is applied to a grouped grid using the SSRM, the grid will behave differently depending on whether [Infinite Scrolling](/server-side-model-row-stores/) is active. How it behaves is as follows:

- ### Infinite Scrolling Off
    - By default, the grid will sort all rows on the client side.
    - Enabling the `serverSideSortOnServer` grid option will instead request sorted data from the server when a group is affected by a sort change.

- ### Infinite Scrolling On
    - Non-group levels always refresh - all rows are loaded again from the server.
    - Group levels refresh (reload from server) if the sort was changed in:
        - Any column with a value active (ie colDef.aggFunc='something')
        - Any secondary column (ie you are pivoting and sort a pivot value column)
        - A Column used for this levels group (eg you are grouping by 'Country' and you sort by 'Country').

To instead reload every row and group from the server when a refresh is needed, enable the `serverSideSortAllLevels` grid option.

## Next Up

Continue to the next section to learn about [Filtering](/server-side-model-filtering/).
