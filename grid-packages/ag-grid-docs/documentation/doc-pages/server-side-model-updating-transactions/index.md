---
title: "SSRM Transactions"
enterprise: true
---
This section show how rows can be added, removed and updated using the Server-Side Transaction API.

[[note]]
| Server-Side Transactions require row ID's to be supplied to grid via [getRowId()](/row-ids/#application-assigned-ids/).

##Server-Side Transaction API

The SSRM Transaction API allows rows to be added, removed or updated in the grid:

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["applyServerSideTransaction"]' ></api-documentation>

The following snippet shows how to add / update and remove rows from the grid:

<snippet>
gridOptions.api.applyServerSideTransaction({ 
    add: [ 
        { tradeId: 101, portfolio: 'Aggressive', product: 'Aluminium', book: 'GL-62472', current: 57969 }
    ],
    update: [
        { tradeId: 102,  portfolio: 'Aggressive', product: 'Aluminium', book: 'GL-624723', current: 58927 }
    ],
    remove: [
        { tradeId: 103 }
    ]
});
</snippet>

The following example demonstrates add / update and remove operations via the transaction API. Note the following;
 - Opening the console and interacting with one of the provided buttons shows the parameter passed to `api.applyServerSideTransaction()` and returned result.
 - The add transaction also provides an `addIndex`. If this was omitted, the row would instead be added at the end.
 - A successful transaction also returns a similar response, with one RowNode being returned per successful operation.

<grid-example title='Simple Example' name='transactions-simple' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Row Grouping

To use transactions while using row grouping, transactions need to be applied to the specific row group. This is done by providing a `route` when applying the transaction. It is also necessary to inform the grid when group rows are updated, added or removed.


In the example below, note the following:
 - When clicking any of the buttons, the console logs each transaction as it is applied to the grid.
 - To add a new row, if the group didn't previously exist, then the route is omitted and the group row is added. If it did previously exist, then the group route is provided and the leaf node is added.
 - To delete a row, if the group row would be deleted then a transaction needs to be applied to remove this group row instead of the leaf row.
 - To move a row between groups, the row needs to be deleted from the old group with one transaction, and added to the new group with another.

<grid-example title='Transactions With Groups' name='transactions-grouping' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## High Frequency Updates

When processing many updates rapidly, the grid will perform more smoothly if the changes are batched (as this can prevent excessive rendering). The grid can batch these changes for you without negatively impacting the user experience, and in most cases improving it.

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["applyServerSideTransactionAsync"]' ></api-documentation>

When using asynchronous transactions, the grid delays any transactions received within a time window (specified using `asyncTransactionWaitMillis`) and executes them together when the window has passed.

In the example below, note the following:
 - 1 row is created, 10 rows are updated, and 1 rows is deleted every 10 milliseconds.
 - The transactions are batched, and only executed once every second.

<grid-example title='Asynchronous Example' name='transactions-async' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Showcase Example

<grid-example title='Showcase Example' name='transactions-showcase' type='generated' options='{ "enterprise": true, "exampleHeight": 670, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

