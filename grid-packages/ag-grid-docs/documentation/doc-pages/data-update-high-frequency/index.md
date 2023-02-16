---
title: "Client-Side Data - High Frequency Updates"
---

High Frequency Updates relates to lots of updates in high succession going into the grid. Every time you update data in the grid, the grid will rework all aggregations, sorts and filters as well as having the browser update its DOM. If you are streaming multiple updates into the grid this can be a bottleneck. High Frequency Updates are achieved in the grid using Async Transactions. Async Transactions allow for efficient high-frequency grid updates.

## Async Transactions

When you call `applyTransactionAsync()` the grid will execute the update, along with any other updates you subsequently provide using `applyTransactionAsync()`, after 50ms. This allows the grid to execute all the transactions in one batch which is more efficient.

<api-documentation source='grid-api/api.json' section='data' names='["applyTransactionAsync"]' ></api-documentation>

The following example demonstrates updating data using normal transactions and async transactions:

- **Normal Update**: Calls `applyTransaction()` 200 times with each call updating a single row.
- **Async Update**: Calls `applyTransactionAsync()` 200 times with each call updating a single row.

<grid-example title='Async Transaction' name='async-transaction' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"], "exampleHeight": 590 }'></grid-example>


To help understand the interface for `applyTransaction()` and `applyTransactionAsync()`, here are both method signatures side by side. The first executes immediately. The second executes sometime later using a callback for providing a result.

```ts
// normal applyTransaction takes a RowDataTransaction and returns a RowNodeTransaction
applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction

// batch takes a RowDataTransaction and the result is provided some time later via a callback
applyTransactionAsync(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void
```

Use Async Transactions if you have a high volume of streaming data going into the grid and don't want the grid's rendering and recalculating to be a bottleneck.

## Async Transactions Applied Event

Each time the grid executes a batch of Async Transactions, it dispatches a `asyncTransactionsApplied` event.

The event contains `results` attribute, which is a list of all the results for all Transactions that got applied.

This event is useful for debugging or observing how the Async Transactions are applied for learning purposes.

## Flush Async Transactions

The default wait between executing batches is 50ms. This means when an Async Transaction is provided to the grid, it can take up to 50ms for that transaction to be applied.

Sometimes you may want all transactions to be applied before doing something - for example you may want to select a row in the grid but want to make sure the grid has all the latest row data before doing so.

To make sure the grid has no Async Transactions pending, you can flush the Async Transaction queue. This is done by calling the API `flushAsyncTransactions`.

It is also possible to change the wait between executing batches from the default 50ms. This is done using the grid property `asyncTransactionWaitMillis`.

The example below demonstrates setting the wait time and also flushing. Note the following:

- The property `asyncTransactionWaitMillis` is set to 4000, thus transactions get flushed every 4 seconds.
- The button Flush Transactions will call the API method `flushAsyncTransactions`.
- Transactions getting added and executed is logged to the console.
- The example listens on event `asyncTransactionsFlushed` and logs how many transactions got applied.

<grid-example title='Flush Transactions' name='flush-transactions' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"], "exampleHeight": 590 }'></grid-example>

