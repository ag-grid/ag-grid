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

## Full Store

When using the Full Store, sorting of rows is performed by the grid. There is nothing special to be done by the server.

The example below demonstrates the Full Store sorting inside the grid. Note the following:

- The grid is using the Full Store by setting the grid property `serverSideStoreType = full`.
- All columns have sorting enabled using the `defaultColDef.sortable = true`.
- Rows are loaded once. All sorting is then subsequently done by the grid.

<grid-example title='Full Store Sorting' name='full-sorting' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

[[note]]
| The example above demonstrates the default behaviour of the full store.
| To instead have the grid request that the server provide the sorted rows, enable the `serverSideSortOnServer` grid option.

## Partial Store

When using the Partial Store, sorting of rows is performed on the server. When a sort is applied in the grid a request
is made for more rows via the [Datasource](/server-side-model-datasource/). The provided request contains sort
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

The example below demonstrates sorting using the SSRM and the Partial Store. Note the following:

- The grid is using the Partial Row Store (the default store).
- All columns have sorting enabled using the `defaultColDef.sortable = true`.
- The server uses the metadata contained in the `sortModel` to sort the rows.
- Open the browser's dev console to view the `sortModel` supplied in the request to the datasource.
- Try single / multi column (using <kbd>Shift</kbd> key) sorting by clicking on column headers.


<grid-example title='Partial Sorting' name='partial-sorting' type='generated' options='{ "enterprise": true, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

[[note]]
| When using the Partial Store, it is not possible for the grid to sort the data as it doesn't not have all the data loaded to sort.

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
