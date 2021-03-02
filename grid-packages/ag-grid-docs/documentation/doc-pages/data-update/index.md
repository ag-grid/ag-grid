---
title: "Updating Client-Side Data"
---

There are many ways in which data can change in your application, and as a result many ways in which you can inform the grid of data changes. This section explains the different ways of how you can update data inside the grid using the grid's API.

## Updates vs Edits vs Refresh

Updating data in the grid via the grid's API does not cover all the ways in which data can change inside the grid. Data can also change in the grid in the following ways:


1. Editing data inside the grid using the grid's UI, e.g. by the user double-clicking on a cell and editing the
   cell's value. When this happens the grid is in control and there is no need to explicitly tell the grid data
   has changed. See [Cell Editing](/cell-editing/) on how to edit via the grid's UI.

1. The grid's data is updated from elsewhere in your application. This can happen if you pass data to the grid
   and then subsequently change that data outside of the grid. This leaves the grid's view out of sync with the
   data that it has. In this instance what you want to do is [View Refresh](/view-refresh/) to have the grid's
   UI redraw to display the data changes.

## Setting Fresh Row Data


The easiest way to update data inside the grid is to replace the data you gave it with a fresh set of data. This is done by either updating the `rowData` bound property (if using a framework) or calling `api.setRowData(newData)`.

Replacing the data with a fresh set means the grid will treat it as a brand new set of data and as such the following will occur:

- Row selection will be cleared.
- If grouping, the open / closed state of the groups will be cleared.
- The entire grid's UI will be refreshed from scratch. This has the following drawbacks:
    - All [Cell Renderers](/cell-rendering/) will be destroyed and re-created with no option to have them refresh, losing out on a chance to provide custom animation between value changes (e.g. fade or slide old value out).

    - [Row Animation](/row-animation/) will not be applied. For example, if the difference in data is one row is removed, all rows below will jump up one position rather than having a smooth transition.

    - It is not possible to highlight data changes, e.g. to flash cells.

- All of the Client-Side Row Model calculations will be redone from scratch, i.e. sorting,
    filtering, grouping, aggregation and pivoting.

Use the technique of setting new Row Data when you are dealing with a different distinct set of data e.g. loading a new report with a completely different dataset to the previous one. This makes sure nothing is lying around from the old dataset and all data-related grid state (selection, groups etc.) is cleared.

## Changes to Row Data


Changes to Row Data means you want to change some of the data and have the grid keep all state that it had before the data change.

Keeping all state means items such as row selection and group open / closed state will be maintained.

There are different ways of updating row data which are summarised as follows:


- ### Single Row / Cell
    Updates the value of a single row or cell. This is done by getting a reference to the Row Node and then calling either `rowNode.setData()` or `rowNode.setDataValue()`.

    Use transactions for updating a small number of individual rows infrequently. There is no way to insert or remove rows with this method.


    See [Updating Single Row / Cell](/data-update-single-row-cell/) for more details.

- ### Transaction
    The grid takes a transaction containing rows to add, remove and update. This is done using `api.applyTransaction(transaction)`.

    Use transactions for doing add, remove or update operations on a large number of rows that are infrequent.

    If you are frequently updating rows (e.g. 5 or more updates a second), consider moving to High Frequency instead (achieved with Async Transactions).

    See [Transaction Updates](/data-update-transactions/) for more details.

- ### High Frequency

    High Frequency (achieved with Async Transactions) is a mechanism of applying many transactions over a small space of time and have the grid apply all the transactions in batches. The high frequency / batch method is for when you need the fastest possible way to process many continuous updates, such as providing a stream of updates to the grid. This is done using the API `applyTransactionAsync(transaction)`.

    Use Async Transactions for doing add, remove or update operations that are frequent, e.g. for managing streaming updates into the grid of tens, hundreds or thousands of updates a second.

    See [High Frequency Updates](/data-update-high-frequency/) for more details.
