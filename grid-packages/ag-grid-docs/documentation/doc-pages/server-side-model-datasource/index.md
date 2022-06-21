---
title: "SSRM Datasource"
enterprise: true
---

This section describes the Server-Side Datasource and demonstrates how it is used to load data from a
server.


The Server-Side Row Model (SSRM) requires a datasource to fetch rows for the grid. As the grid requires more data
(e.g. the user scrolls down and Infinite Scrolling is active) more data will be requested via the datasource.

[[note]]
| The SSRM does not impose any restrictions on the server-side technologies used. It is left up to applications to decide how and where data is sourced for the grid.

## Enabling Server-Side Row Model

When no row model is specified the grid will use the [Client-Side Row Model](/client-side-model/) by default. To use the SSRM instead, set the `rowModelType` as follows:

<snippet>
const gridOptions = {
    rowModelType: 'serverSide',
}
</snippet>

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

Notice that the datasource contains a single method `getRows(params)` which is called by the grid when more rows are required. A request is supplied in the `params` object which contains all the information required by the server to fetch data from the server.

Rows fetched from the server are supplied to the grid via `params.success(data)`.

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

The interface for the Server-side Datasource is `IServerSideDatasource`:

<interface-documentation interfaceName='IServerSideDatasource' ></interface-documentation>

### GetRows

Each time the grid requires more rows, it will call the `getRows(params)` method. The method is passed a `params` object (`IServerSideGetRowsParams`) that contains two callbacks (one for success and one for failure) and a request object which details what rows the grid is looking for.

<interface-documentation interfaceName='IServerSideGetRowsParams' config='{"overrideBottomMargin":"1rem"}' ></interface-documentation>

### GetRows Request Params

The request gives details on what the grid is looking for. The success and failure callbacks are not included inside
the request object to keep the request object simple data (i.e. simple data types, no functions). This allows the
request object to be serialised (e.g. via JSON) and sent to your server.

<interface-documentation interfaceName='IServerSideGetRowsRequest' config='{"overrideBottomMargin":"1rem"}' ></interface-documentation>

In the example above, no sorting, filtering, infinite scrolling, grouping or pivoting was active. This means the
request didn't have any information for any of these attributes.

## Success Callback

The success callback passes rows to the grid via the `LoadSuccessParams` interface:

<interface-documentation interfaceName='LoadSuccessParams' config='{"overrideBottomMargin":"1rem"}' ></interface-documentation>

The `rowData` attribute provides the grid with the requested data.

The `rowCount` is used when Infininte Scrolling is used. When the total row count is known, this should be passed to the grid to enable the grid to set the vertical scroll range. This then allows the user to scroll the full extend of the dataset and the grid will never ask for data past the provided row count. Otherwise the grid will assume the total number of rows is not known and the vertical scrollbar range will grow as the user scrolls down.

The `rowCount` is also used when [Pagination](/server-side-model-pagination/) is enabled. The row count is used to determine the number of pages that are required and enables the grid to jump to the last page. If not provided users will only be able to step to the next page as the grid does not know how many pages are required.

The `groupLevelInfo` is additional data the application can pass to the grid about a particular load. This is useful when doing [High Frequency Updates](/server-side-model-high-frequency/) and explained further in that section.

## Fail Callback

The Fail callback has no parameters. It informs the grid the request has failed - eg a network error. It is important to inform the grid of failed requests as it limits the number of concurrent datasource requests. If the Fail callback was not called, the grid would still count the request as pending. For example if the grid was configured with `maxConcurrentDatasourceRequests = 1`, only one request can be pending at any time, and all other requests would be paused until either the Fail or Success callbacks were called for the outstanding request.

## Next Up

Continue to the next section to learn about [Infinite Scroll](/server-side-model-infinite-scroll/).
