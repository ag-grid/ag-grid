---
title: "SSRM Datasource"
enterprise: true
---

This section describes the Server-Side Datasource and demonstrates how it is used to load data from a server.

The Server-Side Row Model requires a datasource to fetch rows for the grid. When users scroll or perform grid operations
such as sorting or grouping, more data will be requested via the datasource.

[[note]]
| Most of the Server-Side Row Model examples include a fake server that generates SQL to imitate how a real server
| might use the requests sent from the grid. These examples use [AlaSQL](http://alasql.org/) which is a
| JavaScript SQL database that works in browsers.
|
| However, note that the Server-Side Row Model does not impose any restrictions on the server-side technologies used.

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

The example below demonstrates loading rows using a simple SSRM Datasource. Note the following:

- The Server-Side Row Model is selected using the grid options property: `rowModelType = 'serverSide'`.
- The datasource is registered with the grid using: `api.setServerSideDatasource(datasource)`.
- The `getRows(params)` defines the request parameters, with `params` containing a `startRow` and `endRow` that determines the range of rows to return. For example, if block size is 100, the `getRows` function will be called with `startRow: 0` and `endRow: 100` and the grid will expect a result with 100 rows (rows 0 to 99).
- When scrolling down there is a delay as more rows are fetched from the server.
- Open the browser's dev console to view the contents of the request made by the grid for rows.

<grid-example title='Simple Server-Side Datasource' name='simple' type='generated' options='{ "enterprise": true, "modules": ["serverside", "menu", "columnpanel"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Configuration](/server-side-model-configuration/).
