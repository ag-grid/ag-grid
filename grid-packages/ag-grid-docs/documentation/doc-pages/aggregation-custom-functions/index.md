---
title: "Aggregation - Custom Functions"
enterprise: true
---

This section covers how custom aggregation functions can be supplied and used in the grid.

## Directly Supplied Functions

Custom aggregation functions can be supplied directly to `colDef.aggFunc` as shown below: 

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'total',
            aggFunc: params => {
                let total = 0;
                params.values.forEach(value => total += value);
                return total;
            }
        }
    ]
}
</snippet>

As shown above, a custom agg function is supplied directly to the `aggFunc` property. The custom function uses the 
provided `values` to perform the custom aggregation. See [Aggregation API Reference](/aggregation/#api-reference) to 
learn more about the supplied `params`.

This is the simplest way to supply custom functions, however it has limitations compared with 
[Registering Custom Functions](/aggregation-custom-functions/#registering-custom-functions).

[[note]]
| Direct Functions will not appear in the [Columns Tool Panel](/tool-panel-columns/) or work when [Saving and Applying Column State](/column-state/#save-and-apply).

The example below uses the direct `aggFunc` approach shown in the above snippet. Note the following:
- Rows are grouped by the **Country** and **Year** columns by enabling the `rowGroup` column definition property.
- `func(Total)` is displayed in the column header by default as it's a direct function.
- `agg(Total)` appears in the Columns Tool Panel, but it's omitted from the drop-down list as it's not registered with the grid.   

<grid-example title='Directly Supplied Aggregation Functions' name='direct-functions' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel", "setfilter"] }'></grid-example>

## Registering Custom Functions

Custom functions that are registered with the grid can be referenced by name in column definitions and will 
appear in the [Columns Tool Panel](/tool-panel-columns/) just like any [Built-In Function](/aggregation/#enabling-aggregation), 
and is done using the `aggFuncs` grid option:

<api-documentation source='grid-options/properties.json' section='rowPivoting' names='["aggFuncs"]'></api-documentation>

The following snippet shows how to register custom functions using the `aggFuncs` grid option:

<snippet>
const gridOptions = {
    columnDefs: [
        { field: 'sales', aggFunc: 'mySum' },
    ],
    aggFuncs: {
        'mySum': params => {
            let sum = 0;
            params.values.forEach(value => sum += value);
            return sum;
        }
    },
}
</snippet>

As shown above, a custom function is registered with in the grid with the name 'mySum' and is referenced by name in 
the column definition using the `aggFunc` property.

Note that custom aggregation functions can also be registered using `gridApi.addAggFunc('mySum', mySumFunc)`.

<api-documentation source='grid-api/api.json' section='rowPivoting' names='["addAggFunc"]'></api-documentation>

The example below uses the `aggFuncs` approach shown in the snippet above. Note the following:
- Rows are grouped by the **Country** and **Year** columns by enabling the `rowGroup` column definition property.
- `mySum(Total)` is displayed in the column header by default as it uses the registered function name.
- `mySum(Total)` appears in the Columns Tool Panel and appears in the drop-down list just like a built-in function.

<grid-example title='Registering Custom Aggregation Functions' name='registered-function' type='generated' options='{ "enterprise": true, "exampleHeight": 540, "modules": ["clientside", "rowgrouping", "menu", "columnpanel", "filterpanel", "setfilter"] }'></grid-example>

## Custom Aggregation Functions

It is possible to add your own custom aggregation to the grid. Custom aggregation functions can be applied directly to
the column or registered to the grid and reference by name (similar to grid provided functions).

<api-documentation source='grid-options/properties.json' section='rowPivoting' names='["aggFuncs"]'></api-documentation>

A custom aggregation function takes values to aggregate and aggregates them.

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

## Multi-Column Aggregation

This section provides an example of how to calculate a ratio using values from multiple columns.

When values from multiple columns are required, a value object containing all the required values across multiple columns
should be passed around instead of a simple value. This value object should also contain a `toString()` method, so it can
also be resolved by the grid to a single value. This is shown in the code snippet below:


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

## Next Up

Continue to the next section to learn about [Aggregation Filtering](/aggregation-filtering/).