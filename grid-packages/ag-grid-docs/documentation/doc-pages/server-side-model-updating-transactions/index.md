---
title: "SSRM Transactions"
enterprise: true
---

The SSRM Transaction API allows large numbers of rows in the grid to be added, removed or updated in an efficient manner.

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["applyServerSideTransaction"]' ></api-documentation>

The grid API `applyServerSideTransaction(transaction)` function accepts an object containing lists of rows to be added, updated and removed which it applies to the grid's rows. It then returns a similar object, containing lists of rows which have been successfully added, updated and removed.

For each transaction item in the request, there will typically be a Row Node returned in the transaction response. The only exception is, for example, that you tried to delete or update a row that didn't currently exist in the store.

## Prerequisites

In order for the grid to find rows to update and remove, it needs a way to identify these rows. As such, to use transactions it is required that an implementation for `getRowId` grid callback has been provided.

<api-documentation source='grid-options/properties.json' section='rowModels' names='["getRowId"]' ></api-documentation>

## Simple Example

In the example below, note the following;
 - The server is relaying details of changes made to the data once per second to the application.
 - 500 rows are removed, 500 rows are created and 500 rows are updated on the source every second.
 - Because the transaction `addIndex` has been omitted, the created rows are assumed to have been added at the end.

<grid-example title='Simple Example' name='transactions-simple' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>

## Row Grouping

When updating grouped data, a transaction needs to be targeted against the group. This is done by providing a `route` when applying the transaction.

In the example below, note the following:
 - One transaction has to be applied for each row group that has changes.
 - To move a row between groups, two transactions are required. One to remove the old row, and the other to recreate it in the correct group.

<grid-example title='Transactions With Groups' name='transactions-grouping' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside", "rowgrouping"] }'></grid-example>

## High Frequency Updates

When processing many updates rapidly, the grid will perform more smoothly if the changes are batched (as this can prevent excessive rendering). The grid can batch these changes for you without negatively impacting the user experience, and in most cases improving it.

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["applyServerSideTransactionAsync"]' ></api-documentation>

When using asynchronous transactions, the grid delays any transactions received within a time window (specified using `asyncTransactionWaitMillis`) and executes them together when the window has passed.

In the example below, note the following:
 - 10 rows are created, 10 rows are updated, and 10 rows are deleted every 10 milliseconds.
 - The transactions are batched, and only executed once every second.

<grid-example title='Asynchronous Example' name='transactions-async' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["alasql"], "modules": ["serverside"] }'></grid-example>


