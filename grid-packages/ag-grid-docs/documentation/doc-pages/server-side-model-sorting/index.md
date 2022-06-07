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

## Sorting Without Infinite Scroll

When not Infinite Scrolling, sorting of rows is performed by the grid. There is nothing special to be done by the server. This is possible as the grid has all the rows needed to perform the sort. The example below demonstrates this. Note the following:

- The grid is not using Infinite Scrolling, the property  `serverSideInfiniteScroll` is not set.
- All columns have sorting enabled using the `defaultColDef.sortable = true`.
- Rows are loaded once. All sorting is then subsequently done by the grid.

<grid-example title='Sorting Without Infinite Scroll' name='full-sorting' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

[[note]]
| The example above demonstrates the default behaviour when not Infinite Scrolling.
| To instead have the grid request that the server provide the sorted rows, enable the `serverSideSortOnServer` grid option.

## Sorting With Infinite Scroll

When using Infinite Scroll, sorting of rows is performed on the server. When using Infinite Scroll, it is not possible for the grid to sort the data as it doesn't not have all the data loaded to sort.

When a sort is applied in the grid a request is made for rows via the [Datasource](/server-side-model-datasource/). The provided request contains sort
metadata in the `sortModel` property.

An example of the contents contained in the `sortModel` is shown below:

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

Notice in the snippet above that the `sortModel` contains an array of models for each column that has active sorts
in the grid. The column ID and sort type can then be used by the server to perform the actual sorting.

The example below demonstrates sorting using the SSRM and Infinite Scrolling. Note the following:

- The grid has Infinite Scrolling enabled via `serverSideInfiniteScroll=true`.
- All columns have sorting enabled via `defaultColDef.sortable = true`.
- The server uses the metadata contained in the `sortModel` to sort the rows.
- Open the browser's dev console to view the `sortModel` supplied in the request to the datasource.
- Try single / multi column (using <kbd>Shift</kbd> key) sorting by clicking on column headers.


<grid-example title='Sorting With Infinite Scroll' name='partial-sorting' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

[[note]]
| **Fake Server Implementation**
|
| Most of the Server-Side Row Model examples include a fake server that generates SQL to imitate how a real server
| might use the requests sent from the grid. These examples use [AlaSQL](http://alasql.org/) which is a
| JavaScript SQL database that works in browsers.
|
| However, note that the Server-Side Row Model does not impose any restrictions on the server-side technologies used.

## Next Up

Continue to the next section to learn about [Filtering](/server-side-model-filtering/).
