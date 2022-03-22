---
title: "Aggregation"
enterprise: true
---

When grouping, you can apply an aggregation function to any column to populate the group row with values.
You can pick from the grid's built in aggregation functions or provide your own.

## Defining Aggregations

You can define aggregations on columns in the following three ways:

1. **Built-In Functions:** Out of the box the grid provides `sum`, `min`, `max`, `count`, `avg`, `first`, `last`. To use
   one of these, set `colDef.aggFunc` to the string of the function you require.

    [[note]]
    | The built-in functions will support `bigint` values if you have them in your data, but the `avg`
    | function will lose precision as it can only use integer arithmetic if `bigint` is used.

1. **User Registered Functions:** You can install your own aggregation functions into the
grid and reference them as if they were grid provided functions by calling `api.addAggFunc(key, func)` or by declaring
them using the grid option `aggFuncs` property.

1. **Direct Functions:** Lastly you can provide a function directly by setting `colDef.aggFunc` to your custom function. Direct functions do not appear in the toolPanel when selecting functions for your columns.


Aggregation functions are provided with an array of values that it should aggregate into one value that it then returns.
The following code snippets show the three ways of defining aggregations for columns as explained above.

<api-documentation source='column-properties/properties.json' section='grouping' names='["aggFunc"]' config='{"overrideBottomMargin":"0rem"}'></api-documentation>
<api-documentation source='grid-properties/properties.json' section='rowPivoting' names='["aggFuncs"]'></api-documentation>

Option 1 - use the built-in 'sum' function:

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'sales', aggFunc: 'sum' },
    ]
}
</snippet>

Option 2 - register aggFunc with the grid called 'mySum', then reference by name:

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'sales', aggFunc: 'mySum' },
    ],
    aggFuncs: {
        // this overrides the grids built-in sum function
        'mySum': params => {
            let sum = 0;
            params.values.forEach(value => sum += value);
            return sum;
        }
    },
}
</snippet>

Option 3 - column uses a function directly:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'sales',
            aggFunc: params => {
                let sum = 0;
                params.values.forEach(value => sum += value);
                return sum;
            }
        },
    ]
}
</snippet>


Note that custom aggregation functions can also be registered using `gridApi.addAggFunc('mySum', mySumFunc)`.

<api-documentation source='grid-api/api.json' section='rowPivoting' names='["addAggFunc"]'></api-documentation>


[[note]]
| Using a function directly will not work with column state, like
| [Saving and Applying Column State](/column-state/#save-and-apply).
| If you require state management with custom aggregation, use `addAggFunc` to register it.

## Restricting Functions

By default, all functions are available to all value columns. To restrict the functions on a column, use the `allowedAggFuncs` column property.

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'gold',
            // allow gui to set aggregations for this column
            enableValue: true,
            // restrict aggregations to sum, min and max
            allowedAggFuncs: ['sum', 'min', 'max'],
        }
    ]
}
</snippet>

## Example 1 - Built In Functions

The example below shows simple aggregation using the built in functions. The following should be noted:

- In order for aggregations to be used, a group column is specified. The example groups by country by setting `rowGroup=true` for the country column.

- Column gold, silver, bronze and total all have `enableValue=true`. This tells the grid to allow the user to select aggregation functions for these columns. Aggregation functions can be selected from the menu and also in the tool panel.

- The gold, silver, bronze and total columns all have a different aggregation functions active.

- The gold column has `allowedAggFuncs=['sum','min','max']` which restricts the user to selecting only sum, min or max as the aggregation function for this column.

<grid-example title='Built-In Functions' name='built-in-functions' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel", "setfilter"] }'></grid-example>

[[note]]
| Remember to mark value columns with `enableValue=true` when using the [Tool Panel](/tool-panel/).
| Otherwise you won't be able to drag and drop them to the 'Values' section in the Tool Panel.

## Custom Aggregation Functions


It is possible to add your own custom aggregation to the grid. Custom aggregation functions can be applied directly to
the column or registered to the grid and reference by name (similar to grid provided functions).

<api-documentation source='grid-properties/properties.json' section='rowPivoting' names='["aggFuncs"]'></api-documentation>

A custom aggregation function takes values to aggregate and aggregates them.

Option 1 - reference the function directly with a column

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'sales',
            aggFunc: params => {
                let sum = 0;
                params.values.forEach(value => sum += value);
                return sum;
            }
        },
    ]
}
</snippet>

Option 2 - register the function with the grid property aggFuncs

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'sales', aggFunc: 'mySum' },
    ],
    aggFuncs: {
        // this overrides the grids built-in sum function
        'mySum': params => {
            let sum = 0;
            params.values.forEach(value => sum += value);
            return sum;
        }
    },
}
</snippet>

 
[[note]]
| Javascript doesn't always represent decimal numbers correctly (e.g `0.2 + 0.1 = 0.30000000000000004`). For this
| reason, if your aggregations rely on decimal values, it's better to add logic to enforce the amount of decimal
| numbers that will be displayed in the cell (see the Rounded Average on Age Column in the example below).

The next example shows many custom aggregation functions configured in a variety of ways and demonstrating different things aggregation functions can do.

The following can be noted from the example:


- **Min/Max on Age Column**: The function creates an aggregation over age giving a min and a max age. The function knows whether it is working with leaf nodes (original row data items) or aggregated nodes (ie groups) by checking the type of the value. If the value is a number, it's a row data item, otherwise it's a group. This is because the result of the aggregation has two values based on one input value. <br/><br/> The min/max function is then set by placing the function directly as the `colDef.aggFunc`.
<br/><br/>
- **Average on Age Column**: The age columns is aggregated a second time with a custom average function. The average function also needs to know if it is working with leaf nodes or group nodes, as if it's group nodes then the average is weighted. The grid also provides an average function that works in the same way, so there is no value in providing your own average function like this, it is done in this example for demonstration purposes. <br/><br/> The average function is also set by placing the function directly as the `colDef.aggFunc`.
<br/><br/>
- **Rounded Average on Age Column**: This is the same as `Average on Age Column` but forcing the values to display a maximum of
two decimal numbers.
<br/><br/>
- **Sum on Gold**: The gold column gets a custom `sum` aggregated function. The new sum function doesn't do anything different to the built in sum function, however it serves as a demonstration on how you can override. Maybe you want to provide a sum function that uses for example the `math.js` library.<br/><br/> The sum function is set using a `gridOptions` property.
<br/><br/>
- **'123' on Silver**: The '123' function ignores the inputs and always returns the value 123. Because it is registered as an aggregation function, it can be reference by name in the column definitions. Having a function return the same thing isn't very useful, however for the example it demonstrates easily where in the grid the function was used. <br/><br/> The '123' function, like 'sum', is set using a `gridOptions` property.
<br/><br/>
- **'xyz' on Bronze**: The 'xyz' function is another function with much use, however it demonstrates you can return anythin from an aggregation function - as long as your aggregation function can handle the result (if you have groups inside groups) and as long as your cell renderer can render the result (if using `cellRenderer`). <br/><br/> The 'xyz' function is set using the API. Note that we also set 'xyz' in the grid options as otherwise
the grid would complain 'Function not found' as it tries to use the function before it is set via the API.

<grid-example title='Custom Aggregation Functions' name='custom-agg-functions' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel", "setfilter"] }'></grid-example>

Note that custom aggregations will get called for the top level rows to calculate a 'Grand Total', not just for row groups. For example if you have 10 rows in the grid, the grid will still call the aggregation with 10 values to get a grand total aggregation.

The grand total aggregation is normally not seen, unless the grid is configured with [Grouping Total Footers](/grouping/#grouping-footers). Total footers display the result of the aggregation for top level, for example displaying a grand total even if no row grouping is active.

When the grid is empty, the aggregations are still called once with an empty set. This is to calculate the grand total aggregation for the top level.

## Example 3 - Multi-Column Aggregation

The next example shows a ratio calculation to demonstrate how to create an `aggFunc` that uses values from multiple columns.

When values from multiple columns are required, a value object containing all the required values across multiple columns should be passed around instead of a simple value. This value object should also contain a `toString()` method so it can also be resolved by the grid to a single value. This is shown in the code snippet below:


<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    columnDefs: [
|        { field: 'gold', aggFunc: 'sum' },
|        { field: 'silver', aggFunc: 'sum' },
|        {
|            headerName: 'Ratio',
|            colId: 'ratio',
|            valueGetter: params => {
|                if (!params.node.group) {
|                    // no need to handle group levels - calculated in the 'ratioAggFunc'
|                    return {
|                        gold: params.data.gold,
|                        silver: params.data.silver,
|                        toString: () => (gold && silver) ? gold / silver : 0,
|                    }
|                }
|            },
|            aggFunc: (params) => {
|                var goldSum = 0;
|                var silverSum = 0;
|                params.values.forEach(value => {
|                    if (value && value.gold) {
|                        goldSum += value.gold;
|                    }
|                    if (value && value.silver) {
|                        silverSum += value.silver;
|                    }
|                });
|                return {
|                    gold: goldSum,
|                    silver: silverSum,
|                    toString: () => {
|                        return goldSum && silverSum ? goldSum / silverSum : 0;
|                    },
|                }
|            }
|        }
|    ]
|}
</snippet>

The following example demonstrates this approach in action:

<grid-example title='Multi-Column Aggregation' name='multi-column-aggregation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel", "setfilter"] }'></grid-example>

## Filtering

Aggregations work on filtered values only. If a filter removes rows from a group, the aggregation for the group is recalculated to consider only rows remaining after the filter is applied.

To override this and always have aggregated values include filtered values (so the aggregated values don't change as filters are applied) set the grid property `suppressAggFilteredOnly`.

In the first example below, `suppressAggFilteredOnly` is **not** set. Note that the Year column has a filter. As the filter changes, the aggregation values change.

<grid-example title='Aggregation and Filters' name='filters' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

In this next example, `suppressAggFilteredOnly=true`. Note that the Year column has a filter. As the filter changes, the aggregation values **do not** change.

<grid-example title='Suppress Filtered Only' name='suppress-filtered-only' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu"] }'></grid-example>

## Aggregation API

After the grid is initialised an aggregation can be applied to a column using the following:

1. Add the columns to the list of value columns via `columnApi.addValueColumn(colKey)` - the 'sum' `aggFunc` is used by default.
1. (Optional) Modify the aggregation function on the column via `columnApi.setColumnAggFunc(colKey, aggFunc)`.

When the grid initialises, any column definitions that have `aggFunc` set will be automatically added as a value column.

## Column Headers

When aggregating, the column headers will include the aggregation function for the column. For example the header `'Bank Balance'` will become `'sum(Bank Balance)'` if you have the sum aggregation active on the column. To turn this off and display simply `'Bank Balance'` then set the grid property `suppressAggFuncInHeader`.

## Custom Full Row Aggregation

Using `colDef.aggFunc` is the preferred way of doing aggregations. However you may find scenarios where you cannot define your aggregations with respect to individual column values. Maybe you are aggregating sales records in different currencies and you need to read the value from one column and the currency code from another column and then convert the record to a common currency for aggregation - the point being you need data from more than just one column, or you want to put the results into different columns to the inputs for the calculation. For that reason, you can take control of the row aggregation by providing a `getGroupRowAgg` function as a grid callback.

[[note]]
| Using `colDef.aggFunc` is the preferred way of doing aggregations, only use `getGroupRowAgg`
| if you cannot achieve what you want as it will make your code more complex. Also note that `getGroupRowAgg`
| will not work when pivoting.

For groups, when aggregating, the grid stores the results in the colId of the column. For example, if you have a group defined as follows:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'abby',
            valueGetter: 'data.a + data.b',
            colId: 'aaa'
        }
    ]
}
</snippet>

Then the result of the aggregation will be stored in `data.aaa` and not in 'abby'. Most of the time this will not matter for you as the colId, if not provided, will default to the field. In order for the grid to display the aggregation result, it must be stored in the correct field name.

Below shows an  example using `getGroupRowAgg`. The example doesn't represent a real world scenario, it's contrived for demonstration. It takes the number of medals as inputs and creates two outputs, one as a normal sum and another by multiplying the result by `Math.PI`.

<grid-example title='Custom Full Row Aggregation' name='custom-full-row-aggregation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel", "setfilter"], "exampleHeight": 620 }'></grid-example>

## Empty Aggregation Calls

When providing either [Custom Aggregation Functions](#custom-aggregation-functions) or [Custom Full Row Aggregation](#custom-full-row-aggregation) then you will see strange calls to these functions where empty lists are provided.

The empty aggregation calls happen in the following two scenarios:

1. The grid has no data (usually the case when the gird is initially displayed before the application has set data). Aggregating at the root level will request an aggregation of an empty set.
1. The grid has groups and a filter, such that groups are empty.

## Recomputing Aggregates

If the data changes after the aggregation is done, you can tell the grid to recompute the aggregates through the API method `refreshClientSideRowModel('aggregate')`.
