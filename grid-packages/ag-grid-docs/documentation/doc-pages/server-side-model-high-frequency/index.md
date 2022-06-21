---
title: "SSRM High Frequency Updates"
enterprise: true
---

High Frequency Updates allow large numbers of updates against the grid without having a drastic hit on performance.

When a transaction is applied to the grid, it results in the grid re-rendering its rows to cater for the new values. In addition to this, if the transactions are getting applied in different JavaScript VM turns (which is often the case when data updates are streamed), each VM turn will result in a browser redraw. If you are receiving tens of updates a second, this will probably kill your application's performance, hence the need for Async Transactions.

## Async Transactions

Grid grid caters for High Frequency Updates via Async Transactions.

When a Transaction is applied to the grid using Async Transactions, the transaction is not applied immediately. Rather the grid waits for a period for more transactions to be applied and then applies them all together in one go, resulting in just one redraw for all the Transactions.

The amount of time which the grid waits before applying the transaction is set via the grid property `asyncTransactionWaitMillis` and defaults to 50ms. Transactions are also applied after any rows are loaded.

The transaction interfaces `ServerSideTransaction` and `ServerSideTransactionResult` used in [SSRM Transactions](/server-side-model-transactions/#transaction-api) are used again for Async Transactions.

```ts
// Standard Sync for regular updates
public applyServerSideTransaction(
    transaction: ServerSideTransaction
) : ServerSideTransactionResult;

// Async apply for High Frequency Updates
public applyServerSideTransactionAsync(
    transaction: ServerSideTransaction,
    callback?: (res: ServerSideTransactionResult) => void
): void;
```

Below shows a simple example using Async Transactions. Note the following:

- The property `asyncTransactionWaitMillis = 4000`. This makes the grid wait 4 seconds before applying Async Transactions.
- Clicking **Add** will apply the Transaction asynchronously. The grid will wait for 4 seconds before adding the row to the grid. Any other rows added during this two seconds (e.g. if the button is clicked multiple times before 4 seconds have expired) then all rows will be added together at the end of the 4 second wait.
- Clicking **Flush** will apply all waiting Transactions.
- Row data finished loading will also apply (flush) all waiting Transactions.

<grid-example title='High Frequency Flat' name='high-frequency-flat' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Flushed Event

When Async Transactions are applied, the `asyncTransactionsFlushed` event is fired. The event contains all of the `ServerSideTransactionResult` objects of all attempted transactions.

<interface-documentation interfaceName='AsyncTransactionsFlushed' ></interface-documentation>

The example below listens for this event and prints a summary of the result objects to the console.

<grid-example title='Transaction Flushed Event' name='transaction-flushed-event' type='generated' options=' { "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Retrying Transactions

The Retrying Transactions feature guards against Lost Updates. Lost updates refers to new data created in the server's data store that due to the order of data getting read and the transaction applied, the record ends up missing in the grid.

Lost updates occur when data read from the server is missing a record (as it's read to early), but the transaction for the new record is attempted before the grid finishes loading (causing transaction to be discarded).

When the grid is loading a particular level and a transaction is applied asynchronously to that level, the grid will wait for the load and then apply the transaction.

The transactions will get applied to the grid's level in the order they were provided to the grid. The order will not get mixed up due to retrying. However transactions applied to other levels (e.g. grouping is active and other levels have loaded) will go ahead as normal. Loading only delays transactions for the loading level.

The example is configured to demonstrate this. Note the following:

- Use the **Refresh** button to get the grid to refresh.
- The Datasource reads (takes a copy) of the server data, but then waits 2 seconds before returning the data, to mimic a slow network on the data return.
- While a refresh is underway, add records using the **Add** button. This will add records to the server that will be missing in the row data the grid receives. The transactions will be applied after the data load is complete.
- Note the console - after rows are loaded, transactions that were received during the load are applied after the load. This means the grid will show new records even though they were missing from the loaded row data.

<grid-example title='Retry Transactions' name='retry-transactions' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

This only applies to loading levels. If the grid is limiting the number of concurrent loads (property `maxConcurrentDatasourceRequests` is set) then it's possible levels are waiting to load. If they are waiting to load, transactions for updates will all be discarded as no race condition (see below) is possible.

## Cancelling Transactions

The Cancelling Transactions feature guards against Duplicate Records. Duplicate records is the inverse of Lost Update. It results in records duplicating.

Duplicate records occur when data read from the server includes a new record (it's just in time), but the transaction for the new record is attempted after the level finishes loading (transaction is applied). This results in the record appearing twice.

Before a transaction is applied, the grid calls the `isApplyServerSideTransaction(params)` callback to give the application one last chance to cancel the transaction.

<api-documentation source='grid-options/properties.json' section='serverSideRowModel' names='["isApplyServerSideTransaction"]' ></api-documentation>

If the callback returns `true`, the transaction is applied as normal and the Transaction Status `Applied` is returned. If the callback returns `false`, the transaction is discarded and the Transaction Status `Cancelled` is returned.

The suggested mechanism is to use versioned (or timestamped) data. When row data is loaded, the application could provide a data version as [Group Level Info](/server-side-model-grouping/#group-level-info).

The example is configured to demonstrate this. Note the following:

- Use the **Refresh** button to get the grid to refresh.
- The Datasource reads (takes a copy) of the server data, but waits 2 seconds first before reading. This mimics a slow network on the way to the server.
- While a refresh is underway, add records using the **Add** button. This will add records to the server that will be existing in the row data the grid receives. The transactions will be applied after the data load is complete.
- A version is applied to the server. This version attached to both the group level and also the Transaction.
- Note the console - after rows are loaded, transactions that were received during the load are applied after the load. This means the grid will show new records even though they were missing from the loaded row data.

<grid-example title='Cancel Transactions' name='cancel-transactions' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Race Conditions

Race conditions occur because of the asynchronous nature of loading data and applying transactions. Race conditions result in lost updates and duplicated records.

Lost updates are catered for by the grid by retrying transactions when loading completes explained in [Retry Transactions](#retrying-transactions) above.

Duplicate records need to be catered for by your application using the [Cancelling Transactions](#cancelling-transactions) feature explained above.

## Big Example

The above explains all the finer details of using Async Transactions. Below presents an example bringing it all together with a larger dataset, grouping and streaming updates from the server.

The example presents a simplified trading hierarchy, typically found inside a financial institution. The example data initially has 28 products, with each product containing 5 portfolios each, each portfolio containing 5 books and each book containing 5 trades. So the data has 28 products, 150 portfolios, 700 books and 3,500 trades. This data size is small comparable to what the grid can handle, or what's typical for large financial institutions, however it's kept to moderate size as the server is mocked in the example.

As far as the grid is concerned, it is lazy loading data based on what groups the user has expanded, so it doesn't matter from the grids perspective how big the dataset is on the server.

In theory there is no limit to the number of groupings or data size allowed. It's common for financial institutions to use the grid to show trading hierarchies with 10 or more levels in the hierarchy with 60,000 to 100,000 books.

In the example, note the following:

- The data has three levels of grouping over columns Product, Portfolio and Book.
- The SSRM does not use Infinite Scrolling at any level.
- The grid property `asyncTransactionWaitMillis = 500`, which means all Async Transactions will get applied after 500ms. In applications, a lower number would typically be used to give more instant feedback to the user. However this example slows it down to save clutter in the dev console and make the example easier to follow.
- The button One Transaction apply one Async Transaction to the top most group when data is un-sorted (Palm Oil -> Aggressive -> LB-0-0-0). When this route is expanded, adding the trade can be observed.
- The buttons Start Feed and Stop Feed start and stop live updates happening on the server.
- The example registers for live updates with the fake server. In a real world example, live updates would probably be delivered using web sockets and how it is managed on the server would be the responsibility of your server technology.
- The fake server makes use of a version counter. The version at the time of data reads is provided to the grid as Group Info. The version of the data at the time of record creation is passed alongside the grid's transactions.
- There are no problems with race conditions as the grid will retry transactions automatically when transactions are applied against loading levels and the callback `isApplyServerSideTransaction(params)` is implemented to discard old transactions.
- All columns are sortable. The sorting is done by the grid without needing to request data again from the server.
- Column Deal Type has a filter associated with it. The filter is done by the grid without needing to request data again from the server.

<grid-example title='High Frequency Hierarchy' name='high-frequency-hierarchy' type='generated' options='{ "enterprise": true, "modules": ["serverside","rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn how to do [Load Retry](/server-side-model-retry/).
