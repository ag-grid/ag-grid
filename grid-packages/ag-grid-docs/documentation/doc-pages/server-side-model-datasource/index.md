---
title: "SSRM Datasource"
enterprise: true
---

This section describes the Server-Side Datasource and demonstrates how it is used to load data from a server.


The Server-Side Row Model (SSRM) requires a datasource to fetch rows for the grid. As the grid requires more data
(e.g. the user scrolls down and Infinite Scrolling is active) more data will be requested via the datasource.

[[note]]
| The SSRM does not impose any restrictions on the server-side technologies used. It is left up to applications to decide how and where data is sourced for the grid.

## Enabling Server-Side Row Model

The [Client-Side Row Model](/client-side-model/) is the default Row Model. To use the SSRM instead, set the `rowModelType` as follows:

<snippet>
const gridOptions = {
    rowModelType: 'serverSide',
}
</snippet>

## Implementing the Server-Side Datasource

A datasource is used by the SSRM to fetch rows for the grid. 

<interface-documentation interfaceName='IServerSideDatasource' ></interface-documentation>

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

Notice that the datasource contains a single method `getRows(params)` which is called by the grid when more rows are 
required. A request is supplied in the `params` object which contains all the information required by the server to
fetch data from the server.

Rows fetched from the server are supplied to the grid via `params.success(data)`.

## Registering the Datasource

The datasource is registered with the grid via either a) the grid property `serverSideDatasource` or b) the grid API.

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

The example below demonstrates loading rows using an SSRM Datasource. The example does not use
Row Grouping or Infinite Scrolling, so it doesn't demonstrate the benefits of using the SSRM.
However, it does demonstrate how to configure the grid with the SSRM which will be built on later.
Note the following:

- The Server-Side Row Model is selected using the grid options property: `rowModelType = 'serverSide'`.
- The datasource is registered with the grid using: `api.setServerSideDatasource(datasource)`.
- A request is contained in params supplied to `getRows(params)` with `startRow` and `endRow` to determine the range of rows to return.
- When scrolling down there is a delay as more rows are fetched from the server.
- Open the browser's dev console to view the contents of the request made by the grid for rows.

<grid-example title='Simple Server-Side Datasource' name='simple' type='generated' options='{ "enterprise": true, "modules": ["serverside", "menu", "columnpanel"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Configuration](/server-side-model-configuration/).
