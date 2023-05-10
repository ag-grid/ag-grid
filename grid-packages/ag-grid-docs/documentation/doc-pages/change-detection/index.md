---
title: "Change Detection"
---

The grid has built in change detection. When a value in the grid changes, either via the UI or via the grid API, the grid will check all cells to see which ones need updating and update only those cells, so minimal changes are made to the DOM.

Change detection can be broken down into the following two categories:


1. **Value Change Detection:** When a value for any cell changes (e.g. after an edit), the grid goes through every cell in the grid and compares the current value to the previous value. If the values differ, the cell is refreshed. This allows all cells using `valueGetters` to be kept up to date where a change to one cell (that was edited) may impact the value of another cell (that references the first cell).

1. **Aggregation Change Detection:** When a value for any cell changes, the grid will recalculate all [aggregations](/aggregation/) that are impacted by the changed value. This means the grid will automatically keep aggregation results (the values in the grouped row) up to date as the data beneath it changes.

[[note]]
| If you are using a custom cell renderer see [Component Refresh](/component-cell-renderer/#component-refresh) for more details on how to update your component following change detection.

## Example: Change Detection and Value Getters

The example below shows the impact of change detection on value getters. The grid is
doing all the refresh by itself with no need for the client application explicitly requesting
a refresh. Notice the following:

- The 'Total' column uses a value getter to calculate the sum of all values in that row.
- Edit any of the values in columns A to F by double clicking a cell and entering a new value.

- The 'Total' column gets automatically refreshed and flashes.

<grid-example title='Change Detection and Value Getters' name='change-detection-value-getters' type='generated' options='{ "exampleHeight": 550 }'></grid-example>

## 1. Value Change Detection

The grid keeps a local copy of all values rendered in each cell. When a refresh of the cell is requested, the cell will only be refreshed if the value has changed.

[[note]]
| You might ask, is checking every cell against its value a performance problem? The answer is no.
| What AG Grid does is similar to the change detection algorithms in frameworks.
| Doing this many checks in JavaScript is not a problem. Slowness comes when the DOM is updated
| many times. AG Grid minimises the DOM updates by only updating the DOM where changes are detected.

### Comparing Values

This section explains how the grid compares values. This is of interest if you want to compare values in a different way.

By default the grid will compare values by using triple equals, eg `"oldValue === newValue"`. This will work most of the time for you, especially if your values are simple types (string, number, boolean) or immutable objects. This will be a problem for mutable objects as object references will be used for comparison which won't detect internal changes in the object. If using mutable objects (data has changed but it's the same object reference), then you will need to override how the value's are compared.

If your row data attributes are simple types (string, boolean, number) or immutable objects you don't need to implement your own comparison method.

If you do need to provide custom comparison of objects, use the `colDef.equals(val1,val2)` method. For example, the following code snippet provides custom comparison to a 'Name' column where the name is stored in a complex object.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'person',
            // method returns true if first and last names are equal
            equals: (person1, person2) => {
                const firstNameEqual = person1.firstName === person2.firstName;
                const lastNameEqual = person2.lastName === person2.lastName;
                return firstNameEqual && lastNameEqual;
            }
        }
    ]
}
</snippet>

### Triggering Value Change Detection

The following operations will **automatically** trigger change detection on all visible cells:

1. Editing any value via the grid UI (e.g. double clicking a cell and entering a new value).
1. Using the `rowNode.setDataValue(col,value)` Row Node method.
1. Using the `api.applyTransaction(transaction)` API method.


If you do not want change detection to be automatically done, then set the grid property
`suppressChangeDetection=true`. This will stop the change detection process firing when the above events happen.
Ideally you should not want to turn off change detection, however the option is there if you choose to turn it off.
One thing that may entice you to turn it off is if you have some custom Value Getters or Cell Class Rules that are
doing some time intensive calculations, you may want limit the number of times they are called and have more
control over when refreshing is done.

To **manually** run Value Change Detection to refresh all visible cells call [api.refreshCells()](/view-refresh/).

## 2. Aggregation Change Detection

Aggregation change detection means rerunning [aggregations](/aggregation/) when a value changes. So for example, if you are grouping by a column and summing by a value, and one of those values change, then the summed value should also change.

### Example: Re-Aggregation of Groups

The example below shows change detection impacting the result of groups. The grid is doing all the refresh by itself with no need for the client application explicitly requesting a refresh. Notice the following:


- Column 'Group' is marked as a [Row Group](/grouping/) and columns A to D are marked as [Aggregation](/aggregation/) columns so that their values are summed into the group level.

- Column 'Total' has a valueGetter which gives a sum of all columns A to D.

- Columns A to D are editable. If you edit a cells value, then the aggregate value at the group level is also updated to reflect the change. This is because the grid is recalculating the aggregations as a result of the change.

- All cells are configured to use one of the grids [animation cell renderer](/change-cell-renderers/) instead of flashing cells.

<grid-example title='Change Detection with Groups' name='change-detection-groups' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"], "exampleHeight": 590 }'></grid-example>

Notice above that the group column is also editable (eg you can change one of the rows from group 'A' to group 'G'), however the row does **not** move into the correct group after this change is made. This is discussed below in the section [Change Detection and Sorting, Filtering, Grouping](#sorting-filtering-grouping).

### Triggering Aggregation Change Detection

The following operations will **automatically** trigger aggregation change detection:

1. Editing any value via the grid UI (e.g. double clicking a cell and entering a new value).
1. Using the `rowNode.setDataValue(col,value)` Row Node method.
1. Using the `api.applyTransaction(transaction)` API method.

To **manually** run aggregation change detection to re-compute the aggregated values, then call [api.refreshClientSideRowModel('aggregate')](/client-side-model/#refreshing-the-client-side-model).

## Change Detection and Sorting, Filtering, Grouping

When a value changes, the grid's automatic change detection will update:

- Aggregated values.
- Values displayed in cells.

The grid will **not**:

- Sort
- Filter
- Group

The reason why sorting, filtering and grouping is not done automatically is that it would be considered bad user experience in most use cases to change the displayed rows while editing. For example, if a user edits a cell, then the row should not jump location (due to sorting and grouping) or even worse, disappear altogether (if the filter removes the row due to the new value failing the filter).

For this reason, if you want to update the sorting, filtering or group grouping after an update, you should listen for the event `cellValueChanged` and call [api.applyTransaction(transaction)](/client-side-model/#refreshing-the-client-side-model) with the rows that were updated.

### Example: Change Detection and Filter / Sort / Group


The following example is the same as the example above [Change Detection and Groups](#example-change-detection-groups) except it gets the grid to do a transaction update so that the grouping, sorting and filtering are recomputed. From the example, the following can be noted:

- As before, updating any value will update the total column and aggregated group columns.

- Updating a group cell will move the row to the new group. If the group does not exist, it will be created.

- If you order by a column (eg order by 'A') and then change the data so that the order is incorrect, the grid will fix itself so that the ordering is maintained. In other words, the updated row will move to the new sorted position.

- If you set a filter (eg filter 'A' to be 'less than 50') and then change the data so that a row no longer passes the filter, the grid will fix itself so that the filtering is maintained. In other words, the updated row will be removed if it no longer passes the filter.

<grid-example title='Change Detection with Filter / Sort / Group' name='change-detection-filter-sort-group' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "setfilter"] }'></grid-example>

## Aggregation Path Selection

When data in the grid updates and aggregations are active, the grid will not recompute all aggregations again from scratch. Instead it will be selective as to what aggregations need to be re-computed.

## Tree Path Selection

When a value changes, the grid will recompute the immediate group the row is in, and then any parent group, all the way to the root. This is known as 'tree path selection' - only the part of the tree that need to be recalculated are recalculated.

If you are updating many rows at the same time using an [Update Transaction](/data-update-transactions/), the grid will do all updates first, then recompute all aggregations against the combined impacted paths only.

## Column Path Selection

By default, the grid will recalculate aggregations on all columns for the updated tree path, even if only one of the columns values were changed. This is because the grid assumes any column has the potential to impact any other column, should the column be referenced in a valueGetter.

If you are sure that a value change impacts that one column only, then you can set the grid property `aggregateOnlyChangedColumns=true`. This will re-aggregate only the changed column and not all columns after a single cell is updated.

## Example: Tree Path & Column Path Selection

Consider the example below and you edit a cell value under under the groups "Bottom" -> "Group B2" and column "Column C". The grid will only recompute column C aggregations for "Group B2" and "Bottom". It will not recompute any aggregates for any other groups or for any other columns.

The tree path selection (ie not updating anything in the group "Top") is active always in the grid and the column selection (only updating column "Column C") is active because of the grid property `aggregateOnlyChangedColumns=true`.


The path selections ensure only the minimal amount of recalculations are done.

To demonstrate this, the example installs it's own aggregation function for summing. This is identical to the normal summing provided by the grid while also printing out to the console when it gets called. This allows the example to show when the aggregations are done and on what.

So with the example below, open up the console and notice the following:

- When the grid initialises, the aggregation gets complete 56 times (4 columns * 14 groups). That's all paths in the group tree and all columns.

- When one value changes (either via UI or via the first button 'Update One Value') then the grid recomputes the values for the impacted path only, and for the changed column only.

- When some values change via a transactions using any of the other buttons, then all columns are recomputed but only on the changed path.

<grid-example title='Change Detection with Delta Aggregation' name='change-detection-delta-aggregation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "setfilter"], "exampleHeight": 590 }'></grid-example>

## Change Detection and Pivot

Everything above stands for when you are doing [pivoting](/pivoting/). There are no new concepts to introduce, so let's just get stuck into an example.

When you click any of the buttons below, remember you are not changing the displayed cells values, as when you pivot, each cell is an aggregation of underlying data and the underlying data is no longer displayed in the grid (doing a pivot removes leaf nodes).

From the example, you can observe:


- Uncheck '**Group & Pivot**' to see what the data looks like when it is flat. You can see it's a list of student records showing student scores and age. For seeing the impact of value changes on pivots, keep this checked while selecting the other buttons.

- Button '**Set One Value**' updates one value using `rowNode.setDataValue(col,value)`. The grid aggregates the new value for display.

- Button '**Update Points**' updates one record using `api.applyTransaction(transaction)`. The grid aggregates the new value for display.

- Button '**Add New Group**' adds one record for 'Year 5' using `api.applyTransaction(transaction)`. The grid does a delta change and adds one more row to represent this group while not touching the DOM with the remaining rows.

- Button '**Add Physics Row**' adds one record with subject 'Physics' using `api.applyTransaction(transaction)`. This impacts the columns in the grid as we are pivoting on 'course', so a new column is added for 'Physics'. Again this is all done without touching the remaining columns or rows in the grid.

- Button '**Remove All Physics**' removes all 'Physics' records `api.applyTransaction(transaction)`. As before, this impacts the columns, all 'Physics' columns are removed.

- Button '**Move Course**' updates a row's course using `api.applyTransaction(transaction)`. This results in the aggregations changing in two locations, once where the course was removed, and another where the course was added.

<grid-example title='Change Detection Pivot' name='change-detection-pivot' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping" ], "exampleHeight": 590}'></grid-example>
