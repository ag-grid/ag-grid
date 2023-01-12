---
title: "Client-Side Data - Transaction Updates"
---

Transaction Updates allow large numbers of rows in the grid to be added, removed or updated in an efficient manner. Use Transaction Updates for fast changes to large datasets.


## Transaction Update API

A transaction object contains the details of what rows should be added, removed and updated. The grid API `applyTransaction(transaction)` takes this transaction object and applies it to the grid's data.

<api-documentation source='grid-api/api.json' section='data' names='["applyTransaction"]' ></api-documentation>

The result of the `applyTransaction(transaction)` is also a transaction, however it is a list of [Row Nodes](/row-object/) that were added, removed or updated. Both types of transactions look similar, but the difference is the data type they contain.

- **Row Data Transaction**: Contains Row Data, the data that you are providing to the grid.
- **Row Node Transaction**: Contains Row Nodes, the grid-created objects that wrap row data items.

For each data item in a Row Data Transaction there will typically be a Row Node in Row Node Transaction wrapping that data item. The only exception is for edge cases, for example you tried to delete or update a data item that didn't exist.



## Example: Updating with Transaction

The example applies transactions in different ways and prints the results of the call to the console. The following can be noted:

- **Add Items**: Adds three items.
- **Add Items addIndex=2**: Adds items at index 2.
- **Update Top 2**: Updates the price on the first 2 rows in the list.
- **Remove Selected**: Removes all the selected rows from the list.
- **Get Row Data**: Prints all row data in the grid to the console.
- **Clear Data**: Sets the data in the grid to an empty list.

<grid-example title='Updating with Transaction' name='updating-with-transaction' type='generated'></grid-example>



## Identifying Rows for Update and Remove

When passing in data to be updated or removed, the grid will be asking:


_"What row do you mean exactly by this data item you are passing?"_

There are two approaches you can take: 1) Providing Row IDs, or 2) Using Object References.

- ### Providing Row IDs (Faster)

  If you are providing [Row IDs](/row-ids/) using the grid callback `getRowId()` then the grid will match data provided in the transaction with data in the grid using the key.

  For updating rows, the grid will find the row with the same key and then swap the data out for the
  newly provided data.

  For removing rows, the grid will find the row with the same key and remove it. For this reason, the
  provided records within the `remove` array only need to have a key present.

  <snippet>
  const gridOptions = {
      getRowId: (params) => params.data.employeeId
  }
  </snippet>

  ```js
  const myTransaction = {
      add: [
          // adding a row, there should be no row with ID = 4 already
          {employeeId: '4', name: 'Billy', age: 55}
      ],
      
      update: [
          // updating a row, the grid will look for the row with ID = 2 to update
          {employeeId: '2', name: 'Bob', age: 23}
      ],
      
      remove: [
          // deleting a row, only the ID is needed, other attributes (name, age) don't serve any purpose
          {employeeId: '5'}
      ]
  }
  ```


- ### Using Object References (Slower)

  If you do not provide [Row IDs](/row-ids/) for the rows, the grid will compare rows using object references. In other words when you provide a transaction with update or remove items, the grid will find those rows using the `===` operator on the data that you previously provided.

  When using object references, note the following:

  1. The same instance of the row data items should be used. Using another instance of the same object will stop the grid from making the comparison.

  1. Using object references for identification will be slow for large data sets, as the grid has no way of indexing rows based on object reference.

Although using object references is slower, this will only be an issue if working with large datasets (thousands of rows).


## Example: Updating with Transaction and Groups


When using transactions and grouping, the groups are kept intact as you add, remove and update rows. The example below demonstrates the following:

- **Add For Sale:** Adds a new item to 'For Sale' group.
- **Add In Workshop:** Adds a new item to 'In Workshop' group.
- **Remove Selected:** Removes all selected items.
- **Move to For Sale:** Move selected items to 'For Sale' group.
- **Move to In Workshop:** Move selected items to 'In Workshop' group.
- **Move to Sold:** Move selected items to 'Sold' group.
- When moving items, the grid animates the rows to the new location with minimal DOM updates.
- **Get Row Data:** Prints all row data to the console.


<grid-example title='Updating with Transaction and Groups' name='updating-with-transaction-and-groups' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Suppressing Top Level Aggregations

When aggregations are present, the grid also aggregates all the top level rows into one parent row. This total aggregation is not shown in the grid so a speed increase can be produced by turning this top level aggregation off by setting `suppressAggAtRootLevel=true`. It is the intention that a future release of the grid will allow exposing the top level aggregation hence why this feature is left in.

The example in the next section has this property enabled to provide a performance boost.

## Localised Changes in Grouped Data

When you apply a transaction to grouped data, the grid will only re-apply grouping, filtering and sorting to the impacted data.

For example, suppose you have the grid with its rows grouped into 10 groups and a sort is applied on one column. If a transaction is applied to update one row, then the group that row sits within will be re-sorted as well as the top level group (as aggregations could impact values at the top level). All of the other 9 groups do not need to have their sorting re-applied.

Deciding what groups need to be operated on within the grid is called Changed Path Selection. After the grid applies all adds, removes and updates from a transaction, it works out what groups were impacted and only executes the required operations on those groups. The groups that were impacted include each group with data that was changed, as well as all parents of changed groups all the way up to the top level.

The example below demonstrates Changed Path Selection. The example is best viewed with the dev console open so log messages can be observed. Note the following:

- The 'Distro' column is sorted with a custom comparator. The comparator records how many times it is called.

- The Value column is aggregated with a custom aggregator. The aggregator records how many times it is called.

- When the example first loads, all the data is set into the grid which results in 171 aggregation operations (one for each group), approximately 24,000 comparisons (for sorting all rows in each group, the number of sorts differs slightly dependent on the data values which are random in this example) and 10,000 filter passes (one for each row). The number of milliseconds to complete the operation is also printed (this value will depend on your hardware).

- Select a row and click 'Update', 'Delete' OR 'Duplicate' (duplicate results in an add operation). Note in the console that the number of aggregations, compares and filters is drastically fewer. The total time to execute is also drastically less.

- The property [`suppressAggAtRootLevel=true`](#suppressAggAtRootLevel) to prevent the grid from calculating aggregations at the top level.

<grid-example title='Small Changes Big Data' name='small-changes-big-data' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

[[note]]
| Note that [Header Checkbox Selection](/row-selection/#header-checkbox-selection)
| is not turned on for the example above. If it was it would slow the grid down marginally as it requires each
| row to be checked (for selection state) between each update. If you need a blazing fast grid managing rapid
| changes, consider avoiding this feature.


## Suppress Model Updates

Sometimes it's required to do transaction updates and not have the rows re-sort / re-filter / re-group / re-aggregate.
This is useful if the user is interacting with the data and you don't want the rows moving.

To prevent sorting, filtering and grouping after an update transaction, set the grid property
`suppressModelUpdateAfterUpdateTransaction=true`.

Note that this property is only used when transactions are applied that only have updates. If the transaction
contains any adds or removes, the sorting, filtering and grouping will always be applied.

The example below is identical to the previous example except `suppressModelUpdateAfterUpdateTransaction=true`.
Note the following:

1. When data is updated (Update buttons), the grid does not re-execute sorting, filtering or aggregation.
2. When data is added (Duplicate button) or removed (Remove button), the grid does execute sorting, filtering and aggregation.
3. After data is updated, hitting Update Model gets the grid to sort, filter and aggregate.

<grid-example title='Suppress Update Model' name='suppress-update-model' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Delta Sorting

While using transactions to modify the grids data model, the default behaviour when a row is modified is for the grid to sort the modified row as well as every sibling into a new ordered list.

The `deltaSort` option is a performance enhancement which may (depending upon your configuration) provide a faster experience by instead:
- Filtering deleted and updated rows from the previously sorted data set
- Only sorting the changed and added rows together in a new list
- Merging the cleaned and changes lists to produce a new sorted data set

It is possible that, if using transactions, enabling this feature may provide a performance boost to your application. Delta sort may be beneficial to you if:
- Your data has a large amount of rows in each row group (or a large number of rows with no grouping) and comparatively small transactions
- You're sorting by a large number of columns simultaneously

Some caveats also exist which may make delta sorting slower in your application if:
- Your data set is small compared to the size of your transactions
- You have a large number of groups containing small numbers of rows.

In the below example two buttons have been provided, one using delta sort and one without. When clicked they will use a transaction to insert one row and update one existing row on the initial dataset of 100,000 rows.

<grid-example title='Delta Sorting' name='delta-sorting' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>