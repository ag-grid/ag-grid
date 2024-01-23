---
title: "SSRM Sorting"
enterprise: true
---

This section covers Server-Side Sorting using the Server-Side Row Model.

## Sorting

Sorting is enabled by default in the grid and controlled via the `sortable` column definition attribute.


<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'country'},
        // Disable sorting by sport
        { field: 'sport', sortable: false },
    ]
}
</snippet>

For more details on sorting configurations see the section on [Row Sorting](/row-sorting/).

## Server-side Sorting

The actual sorting of rows is performed on the server when using the Server-Side Row Model. When a sort is applied in the
grid a request is made for more rows via `getRows(params)` on the [Server-Side Datasource](/server-side-model-datasource/).

The request object sent to the server contains sort metadata in the `sortModel` property, an example is shown below:

```js
// Example request with sorting info
{
    sortModel: [
        { colId: 'country', sort: 'asc' },
        { colId: 'year', sort: 'desc' },
    ]
}
```

Notice in the snippet above that the `sortModel` contains an array of models for each column that has active sorts in 
the grid. The column ID and sort type can then be used by the server to perform the actual sorting.

The example below demonstrates sorting using the SSRM. Note the following:

- The server uses the metadata contained in the `sortModel` to sort the rows.
- Open the browser's dev console to view the `sortModel` supplied in the request to the datasource.
- Try single / multi-column (using <kbd>⇧ Shift</kbd> key) sorting by clicking on column headers.

<grid-example title='Server Side Sorting' name='server-side-sorting' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Client-side Sorting

When the store has been fully loaded into memory, the grid can perform sorting in the browser. This reduces the
load on the server while also improving user experience.

The example below demonstrates sorting using the CSRM. Note the following:

- `cacheBlockSize` has been increased to 10,000 - this allows the first request to load every row.
- `serverSideEnableClientSideSorting` is set to `true`
- When sorting any column in this example, the rows are not replaced by loading rows, and a request to the server is not made.

<grid-example title='Client Side Sorting' name='client-side-sorting' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Next Up

Continue to the next section to learn about [SSRM Filtering](/server-side-model-filtering/).
