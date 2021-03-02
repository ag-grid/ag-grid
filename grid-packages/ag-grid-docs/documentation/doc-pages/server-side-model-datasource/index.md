---
title: "SSRM Datasource"
enterprise: true
---

This section describes the Server-Side Datasource and demonstrates how it can be used to lazy-load data from a
server through an infinite scroll.


The Server-Side Row Model (SSRM) requires a datasource to fetch rows for the grid. As the grid requires more data
(eg the user scrolls down and Infinite Scrolling is active) more data will be requested via the datasource.

[[note]]
| The SSRM does not impose any restrictions on the server-side technologies used. It is left up to applications to decide how and where data is sourced for the grid.

## Enabling Server-Side Row Model

When no row model is specified the grid will use the [Client-Side Row Model](/client-side-model/) by default. To use the SSRM instead, set the `rowModelType` as follows:


```js
gridOptions.rowModelType = 'serverSide';
```

## Implementing the Server-Side Datasource

A datasource is used by the SSRM to fetch rows for the grid. Applications are required to implement a datasource that conforms to the [Server-Side Datasource](#datasource-interface) interface.

The following snippet shows a simple datasource implementation:

```js
const createDatasource = server => {
    return {
        // called by the grid when more rows are required
        getRows: params => {

            // get data for request from server
            const response = server.getData(params.request);

            if (response.success) {
                // supply rows for requested block to grid
                params.success({
                    rowData: response.rows
                });
            } else {
                // inform grid request failed
                params.fail();
            }
        }
    };
}
```

Notice that the datasource contains a single method `getRows(params)` which is called by the grid when more rows are required. A request is supplied in the `params` which contains all the information required by the server to fetch data from the server.

Rows fetched from the server are supplied to the grid via `params.success()`. Note the `rowCount` can be optionally supplied to the grid.

## Registering the Datasource

The datasource is registered with the grid via either a) the grid property `serverSideDatasoruce` or b) the grid API.

Registering the datasource with via grid options is done as follows:

<snippet>
const gridOptions = {
    serverSideDatasource: myDatasource
}
</snippet>

Alternatively, the datasource can be registered via the grid API:

<snippet>
gridOptions.api.setServerSideDatasource(myDatasource);
</snippet>

## Simple Example

The example below demonstrates loading rows using an SSRM Datasource. The example does not use
Row Grouping or Infinite Scrolling, so it doesn't demonstrate the benefits of using the SSRM.
However it does demonstrate how to configure the grid with the SSRM which will be built on later.
Note the following:

- The Server-Side Row Model is selected using the grid options property: `rowModelType = 'serverSide'`.
- The datasource is registered with the grid using: `api.setServerSideDatasource(datasource)`.
- A request is contained in params supplied to `getRows(params)`.
- Open the browser's dev console to view the contents of the request made by the grid for rows.

<grid-example title='Simple Example' name='simple' type='generated' options='{ "enterprise": true, "modules": ["serverside", "menu", "columnpanel"] }'></grid-example>

## Datasource Interface

The interface for the Server-side Datasource is show below:


```ts
interface IServerSideDatasource {
    // grid calls this to get rows
    getRows(params: IServerSideGetRowsParams): void;

    // optional destroy method, if your datasource has state it needs to clean up
    destroy?(): void;
}
```

Each time the grid requires more rows, it will call the `getRows()` method. The method is passed a `params` object that contains two callbacks (one for success and one for failure) and a request object with details what row the grid is looking for.

The interface for the `params` is shown below:

```ts
interface IServerSideGetRowsParams {
    // details for the request, simple object, can be converted to JSON
    request: IServerSideGetRowsRequest;

    // the parent row node. is the RootNode (level -1) if request is top level.
    // this is NOT part of the request as it cannot be serialised to JSON (a rowNode has methods)
    parentNode: RowNode;

    // success callback
    success(params: LoadSuccessParams): void;

    // fail callback, tell the grid the call failed so it can adjust its state
    fail(): void;

    // grid API
    api: GridApi;

    // column API
    columnApi: ColumnApi;
}
```

The request gives details on what the grid is looking for. The success and failure callbacks are not included inside
the request object to keep the request object simple data (i.e. simple data types, no functions). This allows the
request object to be serialised (e.g. via JSON) and sent to your server.

The interface for the `request` is shown below:

```ts
interface IServerSideGetRowsRequest {
    // for Infinite Scroll (i.e. Partial Store) only, first row requested
   startRow: number;

   // for Infinite Scroll (i.e. Partial Store) only, last row requested
   endRow: number;

   // row group columns
   rowGroupCols: ColumnVO[];

   // value columns
   valueCols: ColumnVO[];

   // pivot columns
   pivotCols: ColumnVO[];

   // true if pivot mode is one, otherwise false
   pivotMode: boolean;

   // what groups the user is viewing
   groupKeys: string[];

   // if filtering, what the filter model is
   filterModel: any;

   // if sorting, what the sort model is
   sortModel: any;
}

// we pass a VO (Value Object) of the column and not the column itself,
// so the data can be converted to a JSON string and passed to server-side
interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}
```

In the example above, no sorting, filtering, infinite scrolling, grouping or pivoting was active. This means the
request didn't have any information for any of these attributes.

## Success Callback

The success callback passes rows to the grid with the following parameters:


```ts
// The success() callback uses the following params
interface LoadSuccessParams {

    // data retreived from the server
    rowData: any[];

    // for Infinite Scroll (i.e. Partial Store) only, the last row, if known
    rowCount?: number;

    // any extra info for the grid to associate with this load
    storeInfo?: any;
}
```

The `rowData` attribute provides the grid with the requested data.

The `rowCount` is used when Partial Store is used. When the total row count is known, this should be passed to the grid to enable the grid to set the vertical scroll range. This then allows the user to scroll the full extend of the dataset and the grid will never ask for data past the provided row count. Otherwise the grid will assume the total number of rows is not known and the vertical scrollbar range will grow as the user scrolls down (the default behaviour for Partial Store).

The `info` is additional data the application can pass to the grid about a particular load. This is useful when doing [High Frequency Updates](/server-side-model-high-frequency/) and explained further in that section.

[[note]]
| Prior to version 25, the `success` callback was called `successCallback` and takes a list of parameters instead
| of a `params` object. The old method is still provided for backwards compatibility however it will be deprecated
| and then removed in future major releases.


## Fail Callback

The Fail callback has no parameters. It informs the grid the request has failed - eg a network error. It is important to inform the grid of failed requests as it limits the number of concurrent datasource requests. If the Fail callback was not called, the grid would still count the request as pending. For example if the grid was configured with `maxConcurrentDatasourceRequests = 1`, only one request can be pending at any time, and all other requests would be paused until either the Fail or Success callbacks were called for the outstanding request.

[[note]]
| Prior to version 25, the `fail` callback was called `failCallback`. The old method is still provided for backwards
| compatibility however it will be deprecated and then removed in future major releases.

## Next Up

Continue to the next section to learn about [Row Stores](/server-side-model-row-stores/).

