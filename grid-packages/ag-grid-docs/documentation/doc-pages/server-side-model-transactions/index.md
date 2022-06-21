---
title: "SSRM Transactions"
enterprise: true
---

SSRM Transaction Updates allow large numbers of rows in the grid to be added, removed or updated in an efficient manner.

Transactions for the Server Side Row Model (SSRM) work similarly to [Client Side Row Model Transactions](/data-update-transactions/). The APIs are almost identical, but there are some important differences (such as the SSRM requiring a 'route') and as such the APIs are not shared.

Applying a SSRM transaction is done using the grid API `applyServerSideTransaction(params)`. Here are some introductory code snippets demonstrating how to use the API:

<snippet>
// Add 1 row at the top level group
gridOptions.api.applyServerSideTransaction({
    add: [
        { id: 24, name: 'Niall Crosby', status: 'Alive and kicking' }
    ]
});
// Remove 1 row under the group 'Ireland', '2002'
gridOptions.api.applyServerSideTransaction({
    route: ['Ireland','2002'],
    remove: [
        { id: 24, name: 'Niall Crosby', status: 'Alive and kicking' }
    ]
});
// Add, remove and update a bunch of rows under 'United Kingdom'
gridOptions.api.applyServerSideTransaction({
    route: ['United Kingdom'],
    add: [
        { id: 24, name: 'Niall Crosby', status: 'Alive and kicking' },
        { id: 25, name: 'Jillian Crosby', status: 'Alive and kicking' }
    ],
    update: [
        { id: 26, name: 'Kevin Flannagan', status: 'Alive and kicking' },
        { id: 27, name: 'Tony Smith', status: 'Alive and kicking' }
    ],
    remove: [
        { id: 28, name: 'Andrew Connel', status: 'Alive and kicking' },
        { id: 29, name: 'Bricker McGee', status: 'Alive and kicking' }
    ]
});
</snippet>

Here is a basic example with no grouping and a small dataset.

<grid-example title='Transactions Flat' name='transactions-flat' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Transaction API

The signature of the grid API `applyServerSideTransaction(params)` is as follows:

<api-documentation source='grid-api/api.json' section='serverSideRowModel' names='["applyServerSideTransaction"]'></api-documentation>


## Matching Rows

In order for the grid to find rows to update and remove, it needs a way to identify these rows.

If the grid callback `getRowId` is provided, the grid will match on row ID.

If the grid callback `getRowId` is not provided, the grid will match on object reference.

<api-documentation source='grid-options/properties.json' section='rowModels' names='["getRowId"]' ></api-documentation>

## Targeting Groups

When updating grouped data, a transaction needs to be targeted against the group. This is done by using the transaction's `route` attribute.

If you require to update more than one group, then a transaction needs to be applied for each individual group to update.

The example below demonstrates applying transactions to groups. Note the following:

- The buttons **New Palm Oil** and **New Rubber** will add one row to each group accordingly and print the result to the console. The group must be open for the add to happen.
- The button **New Wool & Amber** will add one item to each group. Note that two transactions are require to achieve this, one for each group, and print the results to the console. The groups must be open for the add to happen.
- The button **New Product** will attempt to add an item to the top level, however it will fail as the top level has been configured to use Infinite Scroll.
- The button **Group State** will print to the console the state of the existing groups.

<grid-example title='Transactions Hierarchy' name='transactions-hierarchy' type='generated' options='{ "enterprise": true, "modules": ["serverside","rowgrouping"] }'></grid-example>

## Infinite Scroll

Transaction Updates do not work for Infinite Scroll. Instead either move your application to not use Infinite Scroll or  [Refresh](/server-side-model-refresh/) to have the grid data update.

## Next Up

Continue to the next section to learn how to perform [High Frequency Updates](/server-side-model-high-frequency/).
