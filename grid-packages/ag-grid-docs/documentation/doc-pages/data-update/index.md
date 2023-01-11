---
title: "Updating Data"
---

[[only-javascript-or-angular-or-vue]]
|There are many ways in which data can change in your application, and as a result many ways in which you can inform the grid of data changes. This section explains the different ways of how you can update data inside the grid using the grid's API.


[[only-react]]
|<video-section id="_V5qFr62uhY" title="React Updating Datal" header="true">
|There are many ways in which data can change in your application, and as a result many ways in which you can inform the grid of data changes. This section explains the different ways of how you can update data inside the grid using the grid's API.
|</video-section>


## Updates vs Edits vs Refresh

This page talks about updating data via the grid's API. It does not talk about the following:

1. Editing data inside the grid using the grid's UI, e.g. by the user double-clicking on a cell and editing the
   cell's value. When this happens the grid is in control and there is no need to explicitly tell the grid data
   has changed. See [Cell Editing](/cell-editing/) on how to edit via the grid's UI.

1. The grid's data is updated from elsewhere in your application. This can happen if you pass data to the grid
   and then subsequently change that data outside of the grid. This leaves the grid's view out of sync with the
   data that it has. In this instance what you want to do is [View Refresh](/view-refresh/) to have the grid's
   UI redraw to display the data changes.

## Updating Data

Updating data in the grid can be done in the following ways:

- ### Row Data

    The easiest way to update data inside the grid is to replace the data you gave it with a fresh set of data. This is done by either updating the `rowData` bound property (if using a framework) or calling `api.setRowData(newData)`.

    See [Updating Row Data](/data-update-row-data/) for more details.

    <br/>

- ### Single Row / Cell
    Updates the value of a single row or cell. This is done by getting a reference to the Row Node and then calling either `rowNode.setData(data)` or `rowNode.setDataValue(col,value)`.

    There is no way to insert or remove rows with this method.

    See [Updating Single Row / Cell](/data-update-single-row-cell/) for more details.

    <br/>
    
- ### Transaction
    The grid takes a transaction containing rows to add, remove and update. This is done using `api.applyTransaction(transaction)`.

    Use transactions for doing add, remove or update operations on a large number of rows that are infrequent.

    If you are frequently updating rows (e.g. 5 or more updates a second), consider moving to [High Frequency](#high-frequency) instead (achieved with Async Transactions).

    See [Transaction Updates](/data-update-transactions/) for more details.

    <br/>

- ### High Frequency

    High Frequency (achieved with Async Transactions) is a mechanism of applying many transactions over a small space of time and have the grid apply all the transactions in batches. The high frequency / batch method is for when you need the fastest possible way to process many continuous updates, such as providing a stream of updates to the grid. This is done using the API `api.applyTransactionAsync(transaction)`.

    Use Async Transactions for doing add, remove or update operations that are frequent, e.g. for managing streaming updates into the grid of tens, hundreds or thousands of updates a second.

    See [High Frequency Updates](/data-update-high-frequency/) for more details.
